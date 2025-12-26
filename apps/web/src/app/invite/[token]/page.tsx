'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { invitationsApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const acceptInvitationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'La confirmation du mot de passe doit contenir au moins 8 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

interface Invitation {
  id: string;
  email: string;
  role: string;
  organization: {
    name: string;
    slug: string;
  };
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  expiresAt: string;
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    CLOSER: 'Closer',
    SETTER: 'Setter',
    SUPER_ADMIN: 'Super Admin',
  };
  return labels[role] || role;
};

export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await invitationsApi.getByToken(token);
        const invitationData = response.data;

        // Pré-remplir le formulaire si firstName/lastName sont déjà dans l'invitation
        if (invitationData.firstName) {
          setValue('firstName', invitationData.firstName);
        }
        if (invitationData.lastName) {
          setValue('lastName', invitationData.lastName);
        }

        setInvitation(invitationData);
      } catch (err: any) {
        console.error('Error fetching invitation:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de l\'invitation';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, setValue]);

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token || !invitation) return;

    try {
      setSubmitting(true);
      setError(null);

      await invitationsApi.accept(token, {
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      setSuccess(true);
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/login?invitation=accepted');
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'acceptation de l\'invitation';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation invalide</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange-dark transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation acceptée !</h1>
            <p className="text-gray-600 mb-6">
              Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  // Vérifier si l'invitation est expirée
  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === 'ACCEPTED';
  const isDeclined = invitation.status === 'DECLINED';
  const isConflict = invitation.status === 'CONFLICT';

  if (isExpired || isAccepted || isDeclined || isConflict) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isExpired && 'Invitation expirée'}
              {isAccepted && 'Invitation déjà acceptée'}
              {isDeclined && 'Invitation refusée'}
              {isConflict && 'Conflit d\'invitation'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isExpired && 'Cette invitation a expiré. Veuillez contacter votre organisation pour recevoir une nouvelle invitation.'}
              {isAccepted && 'Cette invitation a déjà été acceptée.'}
              {isDeclined && 'Cette invitation a été refusée.'}
              {isConflict && 'Un conflit est survenu avec cette invitation. Veuillez contacter le support.'}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange-dark transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejoindre KLOZD</h1>
          <p className="text-gray-600">
            Vous avez été invité(e) à rejoindre <strong>{invitation.organization.name}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Rôle : <span className="font-medium">{getRoleLabel(invitation.role)}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={invitation.email}
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              {...register('firstName')}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              {...register('lastName')}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Création du compte...' : 'Créer mon compte et accepter l\'invitation'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            En créant votre compte, vous acceptez de rejoindre l'organisation <strong>{invitation.organization.name}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

