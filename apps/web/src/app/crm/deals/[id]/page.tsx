'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { crmApi, leadsApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  value: number | null;
  stage: string;
  status: string;
  lead: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    company: string | null;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DealDetailPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchDeal();
  }, [dealId, isAuthenticated, router]);

  const fetchDeal = async () => {
    try {
      const response = await crmApi.getDeals();
      const foundDeal = response.data.find((d: any) => d.id === dealId);
      if (foundDeal) {
        setDeal(foundDeal);
      } else {
        setError('Deal non trouvé');
      }
    } catch (err: any) {
      console.error('Error fetching deal:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du deal');
    } finally {
      setLoading(false);
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

  if (error || !deal) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Deal non trouvé'}
        </div>
      </AppLayout>
    );
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'QUALIFIED':
        return 'bg-blue-100 text-blue-800';
      case 'APPOINTMENT_SCHEDULED':
        return 'bg-purple-100 text-purple-800';
      case 'PROPOSAL_SENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'NEGOTIATION':
        return 'bg-orange-100 text-orange-800';
      case 'WON':
        return 'bg-green-100 text-green-800';
      case 'LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stages = [
    'QUALIFIED',
    'APPOINTMENT_SCHEDULED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'WON',
    'LOST',
  ];

  const currentStageIndex = stages.indexOf(deal.stage);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/crm"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour aux Rapports
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deal.title}</h1>
              {deal.value && (
                <p className="text-xl text-gray-600 mt-1">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(deal.value)}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(
              deal.stage,
            )}`}
          >
            {deal.stage}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pipeline */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline</h2>
              <div className="flex items-center justify-between">
                {stages.map((stage, index) => (
                  <div key={stage} className="flex-1 flex items-center">
                    <div className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                          index <= currentStageIndex
                            ? 'bg-white text-gray-900'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p
                        className={`text-xs mt-2 text-center ${
                          index <= currentStageIndex ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {stage.replace('_', ' ')}
                      </p>
                    </div>
                    {index < stages.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          index < currentStageIndex ? 'bg-white' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {deal.description && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.description}</p>
              </div>
            )}

            {/* Informations du lead */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead associé</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <Link
                    href={`/leads/${deal.lead.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-black transition-colors"
                  >
                    {deal.lead.firstName} {deal.lead.lastName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{deal.lead.email}</p>
                </div>
                {deal.lead.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900">{deal.lead.phone}</p>
                  </div>
                )}
                {deal.lead.company && (
                  <div>
                    <p className="text-sm text-gray-500">Entreprise</p>
                    <p className="text-sm font-medium text-gray-900">{deal.lead.company}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
              <div className="space-y-3">
                {deal.value && (
                  <div>
                    <p className="text-sm text-gray-500">Valeur</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(deal.value)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="text-sm font-medium text-gray-900">{deal.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Créé par</p>
                  <p className="text-sm font-medium text-gray-900">
                    {deal.createdBy.firstName} {deal.createdBy.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{deal.createdBy.email}</p>
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="text-gray-900">
                    {format(new Date(deal.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Modifié le</p>
                  <p className="text-gray-900">
                    {format(new Date(deal.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
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


