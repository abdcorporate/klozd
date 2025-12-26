'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { settingsApi, usersApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface OrganizationSettings {
  id: string;
  subscriptionPlan: string;
  monthlyPrice: number;
  maxUsers: number;
  maxForms: number;
  maxLeadsPerMonth: number;
  maxAppointmentsPerMonth: number;
  maxSmsPerMonth: number;
  aiEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  callRecordingEnabled: boolean;
  primaryColor: string;
  logoUrl?: string;
  customDomain?: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    timezone: string;
    currency: string;
  };
}

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  maxUsers: number;
  maxForms: number;
  maxLeadsPerMonth: number;
  maxAppointmentsPerMonth: number;
  maxSmsPerMonth: number;
  aiEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
}

const settingsSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  timezone: z.string().min(1, 'Le fuseau horaire est requis'),
  currency: z.string().length(3, 'La devise doit être au format ISO (ex: EUR)'),
});

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional().or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;
type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [pricingPlans, setPricingPlans] = useState<Record<string, PricingPlan>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [personalInfoError, setPersonalInfoError] = useState<string | null>(null);
  const [personalInfoSuccess, setPersonalInfoSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'organization' | 'billing' | 'call'>('personal');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const {
    register: registerPersonalInfo,
    handleSubmit: handleSubmitPersonalInfo,
    reset: resetPersonalInfo,
    formState: { errors: personalInfoErrors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Initialiser le formulaire d'informations personnelles (accessible à tous)
    if (user) {
      resetPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',
      });
    }

  // Charger les paramètres de l'organisation seulement pour ADMIN
  if (user?.role === 'ADMIN') {
    fetchSettings();
    fetchPricingPlans();
  } else {
    // Pour les autres rôles, on peut directement arrêter le chargement
    setLoading(false);
  }
  }, [user, isAuthenticated, router, resetPersonalInfo]);

  const fetchSettings = async () => {
    try {
      const response = await settingsApi.getSettings();
      setSettings(response.data);
      reset({
        name: response.data.organization.name,
        timezone: response.data.organization.timezone,
        currency: response.data.organization.currency,
      });
    } catch (err: any) {
      console.error('Erreur lors du chargement des paramètres:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des paramètres';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingPlans = async () => {
    try {
      const response = await settingsApi.getPricingPlans();
      setPricingPlans(response.data);
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await settingsApi.updateOrganization(data);
      // Recharger les paramètres pour avoir les données à jour
      const response = await settingsApi.getSettings();
      setSettings(response.data);
      // Mettre à jour le formulaire avec les nouvelles valeurs
      reset({
        name: response.data.organization.name,
        timezone: response.data.organization.timezone,
        currency: response.data.organization.currency,
      });
      // Mettre à jour le store auth avec le nouveau nom d'organisation
      if (user) {
        const updatedUser = { ...user, organizationName: response.data.organization.name };
        useAuthStore.setState({ user: updatedUser });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      // Afficher le message de succès
      setSuccess('Les modifications ont été sauvegardées avec succès !');
      // Masquer le message après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePlanChange = async (newPlan: string) => {
    if (!settings) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir passer au plan ${newPlan} ?`)) {
      setSaving(true);
      setError(null);
      try {
        await settingsApi.updateSettings({ subscriptionPlan: newPlan });
        await fetchSettings();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du changement de plan');
      } finally {
        setSaving(false);
      }
    }
  };

  const onPersonalInfoSubmit = async (data: PersonalInfoFormData) => {
    if (!user) return;
    
    setSavingPersonalInfo(true);
    setPersonalInfoError(null);
    setPersonalInfoSuccess(null);
    
    try {
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
      };
      
      // Ajouter le mot de passe seulement s'il est fourni
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }
      
      await usersApi.update(user.id, updateData);
      
      // Mettre à jour le store auth avec les nouvelles informations
      const updatedUser = {
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      useAuthStore.setState({ user: updatedUser });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Réinitialiser le champ mot de passe
      resetPersonalInfo({
        ...data,
        password: '',
      });
      
      setPersonalInfoSuccess('Vos informations personnelles ont été mises à jour avec succès !');
      setTimeout(() => setPersonalInfoSuccess(null), 3000);
    } catch (err: any) {
      setPersonalInfoError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  // Pour les non-ADMIN, afficher seulement les informations personnelles
  if (user?.role !== 'ADMIN') {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-2">Gérez vos paramètres personnels</p>
          </div>

          {personalInfoError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {personalInfoError}
            </div>
          )}

          {personalInfoSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
              {personalInfoSuccess}
            </div>
          )}

          {/* Informations personnelles */}
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h2>
            
            <form onSubmit={handleSubmitPersonalInfo(onPersonalInfoSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...registerPersonalInfo('firstName')}
                    className="mt-1 block w-full px-4 py-3 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base placeholder-slate-400 outline-none"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#dd7200';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {personalInfoErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{personalInfoErrors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...registerPersonalInfo('lastName')}
                    className="mt-1 block w-full px-4 py-3 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base placeholder-slate-400 outline-none"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#dd7200';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {personalInfoErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{personalInfoErrors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full px-4 py-3 bg-slate-200 border-2 text-slate-500 rounded-md shadow-sm text-base cursor-not-allowed"
                  style={{ borderColor: 'transparent' }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  id="password"
                  {...registerPersonalInfo('password')}
                  className="mt-1 block w-full px-4 py-3 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base placeholder-slate-400 outline-none"
                  placeholder="Laisser vide pour ne pas changer"
                  style={{ borderColor: 'transparent' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#dd7200';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {personalInfoErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{personalInfoErrors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPersonalInfo}
                  className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm bg-black hover:bg-gray-800 disabled:hover:bg-black"
                >
                  {savingPersonalInfo ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!settings) {
    return (
      <AppLayout>
        <div className="p-4 bg-slate-100 border border-slate-300 text-slate-800 rounded">
          <p className="font-medium">Impossible de charger les paramètres</p>
          {error && (
            <div className="mt-2 text-sm">
              <p className="font-semibold">Détails de l'erreur :</p>
              <p className="mt-1">{error}</p>
            </div>
          )}
          <div className="mt-3 text-sm">
            <p className="font-semibold">Vérifications :</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>L'API backend est-elle démarrée ? (vérifiez http://localhost:3001)</li>
              <li>Êtes-vous bien connecté ?</li>
              <li>Vérifiez la console du navigateur (F12) pour plus de détails</li>
            </ul>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentPlan = pricingPlans[settings.subscriptionPlan];
  const planNames: Record<string, string> = {
    solo: 'Solo',
    pro: 'Pro',
    business: 'Business',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">Gérez vos paramètres</p>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informations personnelles
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'organization'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informations de l'organisation
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Facturation
            </button>
            <button
              onClick={() => setActiveTab('call')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'call'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              KLOZD Call
            </button>
          </nav>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === 'personal' ? (
          /* Informations personnelles */
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h2>
            
            {personalInfoError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
                {personalInfoError}
              </div>
            )}
            
            {personalInfoSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded mb-4">
                {personalInfoSuccess}
              </div>
            )}
            
            <form onSubmit={handleSubmitPersonalInfo(onPersonalInfoSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...registerPersonalInfo('firstName')}
                    className="mt-1 block w-full px-4 py-3 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base placeholder-slate-400 outline-none"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#dd7200';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {personalInfoErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{personalInfoErrors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...registerPersonalInfo('lastName')}
                    className="mt-1 block w-full px-4 py-3 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base placeholder-slate-400 outline-none"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#dd7200';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {personalInfoErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{personalInfoErrors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full px-4 py-3 bg-slate-200 border-2 text-slate-500 rounded-md shadow-sm text-base cursor-not-allowed"
                  style={{ borderColor: 'transparent' }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  id="password"
                  {...registerPersonalInfo('password')}
                  className="mt-1 block w-full px-4 py-3 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base placeholder-slate-400 outline-none"
                  placeholder="Laisser vide pour ne pas changer"
                  style={{ borderColor: 'transparent' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#dd7200';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {personalInfoErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{personalInfoErrors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPersonalInfo}
                  className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm bg-black hover:bg-gray-800 disabled:hover:bg-black"
                >
                  {savingPersonalInfo ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'organization' ? (
          /* Informations de l'organisation */
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations de l'organisation
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom de l'organisation
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="mt-1 block w-full px-4 py-3 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base placeholder-slate-400 outline-none"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#dd7200';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {errors.name && <p className="mt-1 text-sm text-slate-700">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Fuseau horaire
                  </label>
                  <select
                    id="timezone"
                    {...register('timezone')}
                    className="mt-1 block w-full px-4 py-3 pr-8 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base outline-none appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#dd7200';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
                  </select>
                  {errors.timezone && <p className="mt-1 text-sm text-slate-700">{errors.timezone.message}</p>}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Devise
                  </label>
                  <select
                    id="currency"
                    {...register('currency')}
                    className="mt-1 block w-full px-4 py-3 pr-8 bg-slate-100 border-2 text-slate-900 rounded-md shadow-sm text-base outline-none appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#dd7200';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(221, 114, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                  {errors.currency && <p className="mt-1 text-sm text-slate-700">{errors.currency.message}</p>}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm bg-black hover:bg-gray-800 disabled:hover:bg-black"
                  >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
            </form>
          </div>
        ) : activeTab === 'billing' ? (
          /* Facturation */
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facturation</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Plan actuel</p>
              <p className="text-lg font-medium text-gray-900">
                {planNames[settings.subscriptionPlan] || settings.subscriptionPlan}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: settings.organization.currency }).format(settings.monthlyPrice)}/mois
              </p>
            </div>

            {currentPlan && (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quotas du plan actuel</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Utilisateurs :</span>{' '}
                    <span className="font-medium text-gray-900">{settings.maxUsers}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Formulaires :</span>{' '}
                    <span className="font-medium text-gray-900">{settings.maxForms}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Leads/mois :</span>{' '}
                    <span className="font-medium text-gray-900">{settings.maxLeadsPerMonth}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">RDV/mois :</span>{' '}
                    <span className="font-medium text-gray-900">{settings.maxAppointmentsPerMonth}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">SMS/mois :</span>{' '}
                    <span className="font-medium text-gray-900">{settings.maxSmsPerMonth}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">IA :</span>{' '}
                    <span className="font-medium text-gray-900">{settings.aiEnabled ? 'Activée' : 'Désactivée'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-300 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Changer de plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(pricingPlans).map(([planKey, plan]) => {
                  const isCurrent = planKey === settings.subscriptionPlan;
                  return (
                    <div
                      key={planKey}
                      className={`border rounded-lg p-4 ${
                        isCurrent ? 'border-slate-900 bg-slate-900' : 'border-slate-300 bg-slate-100'
                      }`}
                    >
                      <h4 className={`font-semibold mb-1 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>
                      <p className={`text-2xl font-bold mb-2 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: settings.organization.currency,
                        }).format(plan.monthlyPrice)}
                        <span className="text-sm font-normal">/mois</span>
                      </p>
                      <ul className={`text-xs space-y-1 mb-4 ${isCurrent ? 'text-slate-100' : 'text-slate-600'}`}>
                        <li>{plan.maxUsers} utilisateurs</li>
                        <li>{plan.maxForms} formulaires</li>
                        <li>{plan.maxLeadsPerMonth} leads/mois</li>
                        <li>{plan.maxAppointmentsPerMonth} RDV/mois</li>
                      </ul>
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-md cursor-not-allowed"
                        >
                          Plan actuel
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePlanChange(planKey)}
                          className="w-full px-4 py-2 text-white border border-slate-300 rounded-md transition-colors font-medium"
                          style={{ backgroundColor: '#dd7200' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#b85f00';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dd7200';
                          }}
                        >
                          Choisir ce plan
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        ) : (
          /* KLOZD Call */
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">KLOZD Call</h2>
          <p className="text-sm text-gray-600 mb-4">
            Gérez les paramètres de visioconférence native. Toute la configuration technique est gérée par KLOZD.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-100">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Enregistrement des appels</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Activez l'enregistrement automatique de vos visioconférences
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.callRecordingEnabled !== undefined ? settings.callRecordingEnabled : true}
                  onChange={async (e) => {
                    try {
                      setError(null);
                      await settingsApi.updateSettings({ callRecordingEnabled: e.target.checked });
                      await fetchSettings();
                    } catch (err: any) {
                      console.error('Erreur lors de la mise à jour:', err);
                      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
                      setError(errorMsg);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-400 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#dd7200]" style={{ '--tw-ring-color': '#dd7200' } as React.CSSProperties}></div>
              </label>
            </div>
            <div className="p-4 bg-slate-100 border border-slate-300 rounded-lg">
              <p className="text-xs text-slate-700">
                <strong>Rétention des enregistrements :</strong> Les enregistrements sont conservés 90 jours. 
                Ils sont stockés de manière sécurisée et accessibles uniquement aux membres autorisés de votre organisation.
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </AppLayout>
  );
}
