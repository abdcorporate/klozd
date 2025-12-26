'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { formsApi, api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { FormVisualPreview } from '@/components/forms/form-visual-preview';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  optionsJson?: string | null;
  scoringRulesJson?: string | null;
}

interface Form {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  minScore: number;
  qualifiedRedirectUrl: string | null;
  disqualifiedRedirectUrl: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  primaryButtonColor?: string | null;
  fontFamily?: string | null;
  borderRadius?: string | null;
  formFields: FormField[];
  createdAt: string;
  updatedAt: string;
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

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    DRAFT: 'Brouillon',
    ACTIVE: 'Actif',
    PAUSED: 'En pause',
    ARCHIVED: 'Archivé',
  };
  return statusMap[status] || status;
};

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  // Next.js peut utiliser 'id' ou 'slug' selon la route
  const id = (params.id || params.slug) as string;

  const [form, setForm] = useState<Form | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Autoriser ADMIN, SUPER_ADMIN et MANAGER à voir les formulaires
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user?.role || '')) {
      router.push('/dashboard');
      return;
    }

    const fetchForm = async () => {
      try {
        // Récupérer le formulaire et les analytics en parallèle
        const [formResponse, analyticsResponse] = await Promise.all([
          api.get(`/forms/${id}`),
          formsApi.getAnalytics(id, analyticsDays).catch(() => null), // Ne pas bloquer si analytics échoue
        ]);
        setForm(formResponse.data);
        if (analyticsResponse?.data) {
          setAnalytics(analyticsResponse.data);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Formulaire non trouvé');
        } else {
          setError('Erreur lors du chargement du formulaire');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id, user, isAuthenticated, router]);

  // Recharger les analytics quand la période change
  useEffect(() => {
    if (!form || !id) return;

    const fetchAnalytics = async () => {
      try {
        const analyticsResponse = await formsApi.getAnalytics(id, analyticsDays);
        setAnalytics(analyticsResponse.data);
      } catch (err) {
        // Ignorer les erreurs d'analytics silencieusement
        console.error('Error fetching analytics:', err);
      }
    };

    fetchAnalytics();
  }, [id, analyticsDays, form]);

  const handleStatusChange = async (newStatus: string) => {
    if (!form) return;

    try {
      setUpdatingStatus(true);
      // Mettre à jour le statut en envoyant tous les champs requis
      await formsApi.update(form.id, {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        status: newStatus,
        minScore: form.minScore,
        qualifiedRedirectUrl: form.qualifiedRedirectUrl || undefined,
        disqualifiedRedirectUrl: form.disqualifiedRedirectUrl || undefined,
      });
      // Recharger le formulaire
      const response = await api.get(`/forms/${form.id}`);
      setForm(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!form) return;

    try {
      setDeleting(true);
      await formsApi.delete(form.id);
                router.push('/pages');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du formulaire');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  if (!form) {
    return (
      <AppLayout>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error || 'Formulaire non trouvé'}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
            <p className="text-gray-600 mt-2">{form.description || 'Aucune description'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (form.status !== 'ACTIVE') {
                  setError('Le formulaire doit être en statut Actif pour être accessible publiquement');
                  setTimeout(() => setError(null), 5000);
                  return;
                }
                setError(null);
                window.open(`/pages/public/${form.slug}`, '_blank');
              }}
              className="px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
            >
              Voir le formulaire public
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </button>
            <button
              onClick={() => router.push('/pages')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations générales */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Slug</dt>
                  <dd className="mt-1 text-sm text-gray-900">{form.slug}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd className="mt-1">
                    <select
                      value={form.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className={`pl-3 pr-10 py-1 text-sm rounded border appearance-none bg-no-repeat bg-right ${
                        form.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-300' :
                        form.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                        form.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        'bg-red-100 text-red-800 border-red-300'
                      } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="DRAFT">Brouillon</option>
                      <option value="ACTIVE">Actif</option>
                      <option value="PAUSED">En pause</option>
                      <option value="ARCHIVED">Archivé</option>
                    </select>
                  </dd>
                </div>
                {form.qualifiedRedirectUrl && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">URL de redirection (qualifiés)</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-all">{form.qualifiedRedirectUrl}</dd>
                  </div>
                )}
                {form.disqualifiedRedirectUrl && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">URL de redirection (disqualifiés)</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-all">{form.disqualifiedRedirectUrl}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Créé le</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(form.createdAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Modifié le</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(form.updatedAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Analytiques</h2>
                <select
                  value={analyticsDays}
                  onChange={(e) => setAnalyticsDays(parseInt(e.target.value, 10))}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.25rem center',
                    backgroundSize: '1em 1em',
                    paddingRight: '1.5rem'
                  }}
                >
                  <option value={7}>7 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={90}>90 jours</option>
                </select>
              </div>

              {analytics ? (
                <div className="space-y-4">
                  {/* Métriques principales */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold text-gray-900">{analytics.metrics.views.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 mt-1">Vues</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold text-gray-900">{analytics.metrics.started.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 mt-1">Commencés</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold text-gray-900">{analytics.metrics.completed.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 mt-1">Complétés</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold text-gray-900">{analytics.metrics.abandoned.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 mt-1">Abandons</div>
                    </div>
                  </div>

                  {/* Taux */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm font-bold text-gray-700 mb-2">Taux</div>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-900">
                        • Complétion : <span className="font-semibold">{analytics.metrics.completionRate}%</span>
                      </div>
                      <div className="text-gray-900">
                        • Abandon : <span className="font-semibold">{analytics.metrics.abandonmentRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Qualification */}
                  {analytics.qualification.total > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm font-bold text-gray-700 mb-2">Qualification</div>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-900">
                          • Qualifiés : <span className="font-semibold">{analytics.qualification.qualified}</span> ({analytics.qualification.qualificationRate}%)
                        </div>
                        <div className="text-gray-900">
                          • Disqualifiés : <span className="font-semibold">{analytics.qualification.disqualified}</span> ({analytics.qualification.total > 0 ? Math.round((analytics.qualification.disqualified / analytics.qualification.total) * 100) : 0}%)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Temps moyen de remplissage */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm font-bold text-gray-700 mb-1">Temps moyen de remplissage</div>
                    <div className="text-sm font-medium text-gray-900">
                      • {analytics.averageCompletionTime.minutes} min {analytics.averageCompletionTime.seconds} sec
                    </div>
                  </div>

                  {/* Champs problématiques */}
                  {analytics.problematicFields.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm font-bold text-gray-700 mb-2">Champs posant problème</div>
                      <div className="space-y-2">
                        {analytics.problematicFields.slice(0, 5).map((field, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            • "{field.label}" : {field.abandonPercentage}% d'abandon à ce champ
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={async () => {
                        try {
                          // Exporter les données du formulaire en CSV
                          const csvData = [
                            ['Métrique', 'Valeur'],
                            ['Vues', analytics.metrics.views],
                            ['Commencés', analytics.metrics.started],
                            ['Complétés', analytics.metrics.completed],
                            ['Abandons', analytics.metrics.abandoned],
                            ['Taux de complétion', `${analytics.metrics.completionRate}%`],
                            ['Taux d\'abandon', `${analytics.metrics.abandonmentRate}%`],
                            ['Qualifiés', analytics.qualification.qualified],
                            ['Disqualifiés', analytics.qualification.disqualified],
                            ['Temps moyen', `${analytics.averageCompletionTime.minutes} min ${analytics.averageCompletionTime.seconds} sec`],
                          ];
                          
                          const csvContent = csvData.map(row => row.join(',')).join('\n');
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          const url = URL.createObjectURL(blob);
                          link.setAttribute('href', url);
                          link.setAttribute('download', `analytics-${form.name}-${new Date().toISOString().split('T')[0]}.csv`);
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (error) {
                          console.error('Erreur lors de l\'export:', error);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Exporter CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Chargement des analytics...</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Aperçu visuel du formulaire */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Aperçu du formulaire</h2>
                <button
                  onClick={() => router.push(`/pages/${form.id}/edit`)}
                  className="px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
                >
                  Modifier
                </button>
              </div>
              {form.formFields.length === 0 ? (
                <p className="text-gray-500">Aucun champ défini</p>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-[600px]">
                  <FormVisualPreview
                    formName={form.name}
                    formDescription={form.description}
                    formFields={form.formFields}
                    backgroundColor={form.backgroundColor}
                    textColor={form.textColor}
                    primaryButtonColor={form.primaryButtonColor}
                    fontFamily={form.fontFamily}
                    borderRadius={form.borderRadius}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Supprimer le formulaire
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le formulaire "{form.name}" ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-white rounded-md transition-colors font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

