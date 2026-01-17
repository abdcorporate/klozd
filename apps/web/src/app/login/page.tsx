'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { AuthLayout } from '@/components/auth/auth-layout';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const redirectChecked = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Vérifier le paramètre verified dans l'URL (une seule fois)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setVerifiedSuccess(true);
      window.history.replaceState({}, '', '/login');
    }
  }, [mounted]);

  // Rediriger si déjà authentifié (une seule fois)
  useEffect(() => {
    if (!mounted || redirectChecked.current) return;
    
    redirectChecked.current = true;
    
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        router.replace('/dashboard');
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [mounted, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await login(data.email, data.password);
      
      // Si l'email n'est pas vérifié, rediriger vers la page de vérification
      if (response?.data?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      let errorMessage = 'Erreur de connexion';
      
      if (err.isNetworkError || err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que l\'API est démarrée sur http://localhost:3001';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <AuthLayout>
        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center text-gray-500">Chargement...</div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200"
      >
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Connexion
          </h2>
          {verifiedSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              ✅ Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
              placeholder="vous@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <a href="/register" className="font-medium text-brand-orange hover:text-brand-orange-light hover:underline">
            Créer un compte
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
