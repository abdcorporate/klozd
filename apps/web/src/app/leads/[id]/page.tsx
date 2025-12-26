'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { leadsApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface Lead {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  qualificationScore: number | null;
  closingProbability: number | null;
  budget: number | null;
  sector: string | null;
  urgency: string | null;
  notes: string | null;
  qualifiedAt: string | null;
  disqualifiedAt: string | null;
  disqualificationReason: string | null;
  assignedCloser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  assignedSetter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  form: {
    id: string;
    name: string;
  } | null;
  submissions: Array<{
    id: string;
    score: number;
    qualified: boolean;
    createdAt: string;
  }>;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    assignedCloser: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  deals: Array<{
    id: string;
    stage: string;
    value: number | null;
    createdAt: string;
  }>;
  activities: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  aiPrediction: {
    closingProbability: number;
    predictedValue: number | null;
    confidence: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function LeadDetailPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Rediriger les closers vers le dashboard
    if (user?.role === 'CLOSER') {
      router.push('/dashboard');
      return;
    }

    fetchLead();
  }, [leadId, isAuthenticated, router, user]);

  const fetchLead = async () => {
    try {
      const response = await leadsApi.getOne(leadId);
      setLead(response.data);
    } catch (err: any) {
      console.error('Error fetching lead:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du lead');
    } finally {
      setLoading(false);
    }
  };

  // Rediriger les closers
  if (user?.role === 'CLOSER') {
    return null; // Le useEffect va rediriger
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !lead) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Lead non trouvé'}
        </div>
      </AppLayout>
    );
  }

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      NEW: 'Nouveau',
      QUALIFIED: 'Qualifié',
      DISQUALIFIED: 'Disqualifié',
      APPOINTMENT_SCHEDULED: 'Rendez-vous planifié',
      APPOINTMENT_COMPLETED: 'Rendez-vous terminé',
      WON: 'Gagné',
      LOST: 'Perdu',
      ABANDONED: 'Abandonné',
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUALIFIED':
        return 'bg-green-100 text-green-800';
      case 'DISQUALIFIED':
        return 'bg-red-100 text-red-800';
      case 'APPOINTMENT_SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'APPOINTMENT_COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/leads"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour aux leads
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lead.firstName} {lead.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                lead.status,
              )}`}
            >
              {getStatusLabel(lead.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de contact */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de contact
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">{lead.email}</p>
                </div>
                {lead.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
                  </div>
                )}
                {lead.company && (
                  <div>
                    <p className="text-sm text-gray-600">Entreprise</p>
                    <p className="text-sm font-medium text-gray-900">{lead.company}</p>
                  </div>
                )}
                {lead.form && (
                  <div>
                    <p className="text-sm text-gray-600">Formulaire</p>
                    <p className="text-sm font-medium text-gray-900">{lead.form.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Qualification */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Qualification</h2>
              <div className="grid grid-cols-2 gap-4">
                {lead.qualificationScore !== null && (
                  <div>
                    <p className="text-sm text-gray-600">Score de qualification</p>
                    <p className="text-2xl font-bold text-gray-900">{lead.qualificationScore}/100</p>
                  </div>
                )}
                {lead.closingProbability !== null && (
                  <div>
                    <p className="text-sm text-gray-600">Probabilité de closing</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(lead.closingProbability)}%</p>
                  </div>
                )}
                {lead.budget && (
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(lead.budget)}
                    </p>
                  </div>
                )}
                {lead.sector && (
                  <div>
                    <p className="text-sm text-gray-600">Secteur</p>
                    <p className="text-sm font-medium text-gray-900">{lead.sector}</p>
                  </div>
                )}
                {lead.urgency && (
                  <div>
                    <p className="text-sm text-gray-600">Urgence</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {lead.urgency}
                    </p>
                  </div>
                )}
                {lead.qualifiedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Qualifié le</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(lead.qualifiedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                )}
                {lead.disqualifiedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Disqualifié le</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(lead.disqualifiedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                    {lead.disqualificationReason && (
                      <p className="text-sm text-red-600 mt-1">
                        {lead.disqualificationReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}

            {/* Activités */}
            {lead.activities && lead.activities.length > 0 && (
              <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h2>
                <div className="space-y-4">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="border-l-4 border-gray-300 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Par {activity.createdBy.firstName} {activity.createdBy.lastName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600">
                          {format(new Date(activity.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attribution */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attribution</h2>
              <div className="space-y-3">
                {lead.assignedCloser && (
                  <div>
                    <p className="text-sm text-gray-600">Closer assigné</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.assignedCloser.firstName} {lead.assignedCloser.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{lead.assignedCloser.email}</p>
                  </div>
                )}
                {lead.assignedSetter && (
                  <div>
                    <p className="text-sm text-gray-600">Setter assigné</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.assignedSetter.firstName} {lead.assignedSetter.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{lead.assignedSetter.email}</p>
                  </div>
                )}
                {!lead.assignedCloser && !lead.assignedSetter && (
                  <p className="text-sm text-gray-500">Aucune attribution</p>
                )}
              </div>
            </div>

            {/* Prédiction IA */}
            {lead.aiPrediction && (
              <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Prédiction IA</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Probabilité de closing</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lead.aiPrediction.closingProbability}%
                    </p>
                  </div>
                  {lead.aiPrediction.predictedValue && (
                    <div>
                      <p className="text-sm text-gray-500">Valeur prédite</p>
                      <p className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(lead.aiPrediction.predictedValue)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Confiance</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.aiPrediction.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rendez-vous */}
            {lead.appointments && lead.appointments.length > 0 && (
              <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendez-vous</h2>
                <div className="space-y-3">
                  {lead.appointments.map((appointment) => (
                    <div key={appointment.id} className="border-b border-gray-200 pb-3 last:border-0">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(appointment.scheduledAt), 'dd/MM/yyyy à HH:mm', {
                          locale: fr,
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.assignedCloser.firstName}{' '}
                        {appointment.assignedCloser.lastName}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getStatusColor(
                          appointment.status,
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deals */}
            {lead.deals && lead.deals.length > 0 && (
              <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Deals</h2>
                <div className="space-y-3">
                  {lead.deals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/crm/deals/${deal.id}`}
                      className="block border-b border-gray-200 pb-3 last:border-0 hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{deal.stage}</p>
                      {deal.value && (
                        <p className="text-sm text-gray-600">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(deal.value)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {format(new Date(deal.createdAt), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="text-gray-900">
                    {format(new Date(lead.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Modifié le</p>
                  <p className="text-gray-900">
                    {format(new Date(lead.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

