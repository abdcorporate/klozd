'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { formsApi, api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Form {
  id: string;
  name: string;
}

interface AnalyticsData {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  metrics: {
    views: number;
    started: number;
    completed: number;
    abandoned: number;
    completionRate: number;
    abandonmentRate: number;
    completionRateChange: number;
    abandonmentRateChange: number;
  };
  qualification: {
    qualified: number;
    disqualified: number;
    total: number;
    qualificationRate: number;
  };
  averageCompletionTime: {
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  problematicFields: Array<{
    label: string;
    abandonCount: number;
    abandonPercentage: number;
  }>;
}

export default function FormAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const id = params.id as string;

  // Debug: afficher les paramètres
  console.log('Analytics page - params:', params);
  console.log('Analytics page - id:', id);
  console.log('Analytics page - user:', user);

  const [form, setForm] = useState<Form | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Autoriser ADMIN, SUPER_ADMIN et MANAGER à voir les analytics
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user?.role || '')) {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Fetching analytics for form ID:', id);
        console.log('User role:', user?.role);
        console.log('User organizationId:', user?.organizationId);
        
        if (!id) {
          setError('ID du formulaire manquant');
          setLoading(false);
          return;
        }
        
        // Essayer de récupérer le formulaire d'abord (optionnel, on continue même si ça échoue)
        let formResponse;
        try {
          formResponse = await api.get(`/forms/${id}`);
          console.log('Form response:', formResponse.data);
          setForm(formResponse.data);
        } catch (formErr: any) {
          console.error('Error fetching form:', formErr);
          console.error('Form error status:', formErr.response?.status);
          console.error('Form error data:', formErr.response?.data);
          // Ne pas arrêter, continuer pour les analytics qui pourraient fonctionner
          if (formErr.response?.status === 401 || formErr.response?.status === 403) {
            setError(`Non autorisé: ${formErr.response?.data?.message || 'Vous n\'avez pas les permissions pour voir ce formulaire'}`);
            setLoading(false);
            return;
          }
          // Pour les autres erreurs (404, etc.), on continue quand même pour les analytics
        }

        // Récupérer les analytics
        try {
          const analyticsResponse = await formsApi.getAnalytics(id, days);
          setAnalytics(analyticsResponse.data);
        } catch (analyticsErr: any) {
          console.error('Error fetching analytics:', analyticsErr);
          console.error('Analytics error response:', analyticsErr.response);
          console.error('Analytics error data:', analyticsErr.response?.data);
          if (analyticsErr.response?.status === 404) {
            setError('Analytiques non trouvés pour ce formulaire');
          } else if (analyticsErr.response?.status === 401 || analyticsErr.response?.status === 403) {
            setError(`Non autorisé: ${analyticsErr.response?.data?.message || 'Vérifiez vos permissions'}`);
          } else {
            setError(`Erreur lors du chargement des analytics: ${analyticsErr.response?.data?.message || analyticsErr.message}`);
          }
          throw analyticsErr; // Re-throw pour être capturé par le catch externe
        }
      } catch (err: any) {
        console.error('Error in fetchData:', err);
        console.error('Error response:', err.response);
        if (err.response?.status === 404) {
          setError('Formulaire non trouvé');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError(`Non autorisé: ${err.response?.data?.message || 'Vérifiez vos permissions'}`);
        } else {
          setError(`Erreur: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      console.error('No form ID found in params');
      setError('ID du formulaire manquant');
      setLoading(false);
    }
  }, [id, days, user, isAuthenticated, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            <h2 className="font-semibold mb-2">Erreur</h2>
            <p>{error}</p>
            <div className="mt-4 text-sm">
              <p><strong>ID du formulaire:</strong> {id || 'Non défini'}</p>
              <p><strong>Rôle utilisateur:</strong> {user?.role || 'Non défini'}</p>
              <p><strong>Organization ID:</strong> {user?.organizationId || 'Non défini'}</p>
            </div>
            <button
              onClick={() => router.push('/pages')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retour aux formulaires
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!form || !analytics) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des données...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytiques - {form.name}</h1>
            <p className="text-gray-600 mt-2">
              Période : {format(new Date(analytics.period.startDate), 'd MMM yyyy', { locale: fr })} -{' '}
              {format(new Date(analytics.period.endDate), 'd MMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={90}>90 derniers jours</option>
            </select>
            <button
              onClick={() => router.push(`/pages/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{analytics.metrics.views.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Vues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{analytics.metrics.started.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Commencés</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{analytics.metrics.completed.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Complétés</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{analytics.metrics.abandoned.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Abandons</div>
          </div>
        </div>

        {/* Taux de complétion et d'abandon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Taux de complétion</h2>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-gray-900">{analytics.metrics.completionRate}%</div>
              {analytics.metrics.completionRateChange !== 0 && (
                <div
                  className={`text-sm font-medium ${
                    analytics.metrics.completionRateChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {analytics.metrics.completionRateChange > 0 ? '📈' : '📉'}{' '}
                  {Math.abs(analytics.metrics.completionRateChange)}% vs période précédente
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Taux d'abandon</h2>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-gray-900">{analytics.metrics.abandonmentRate}%</div>
              {analytics.metrics.abandonmentRateChange !== 0 && (
                <div
                  className={`text-sm font-medium ${
                    analytics.metrics.abandonmentRateChange < 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {analytics.metrics.abandonmentRateChange < 0 ? '📉' : '📈'}{' '}
                  {Math.abs(analytics.metrics.abandonmentRateChange)}% vs période précédente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Qualification */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Qualification</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.qualification.qualified}</div>
              <div className="text-sm text-gray-600">Qualifiés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.qualification.disqualified}</div>
              <div className="text-sm text-gray-600">Disqualifiés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.qualification.qualificationRate}%</div>
              <div className="text-sm text-gray-600">Taux de qualification</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.qualification.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Temps moyen de remplissage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">TEMPS MOYEN DE REMPLISSAGE</h2>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.averageCompletionTime.minutes} min {analytics.averageCompletionTime.seconds} sec
          </div>
        </div>

        {/* Champs posant problème */}
        {analytics.problematicFields.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚫 CHAMPS POSANT PROBLÈME</h2>
            <div className="space-y-3">
              {analytics.problematicFields.map((field, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{field.label}</div>
                    <div className="text-sm text-gray-600">
                      {field.abandonCount} abandons ({field.abandonPercentage}% des abandons)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push(`/pages/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour au formulaire
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

