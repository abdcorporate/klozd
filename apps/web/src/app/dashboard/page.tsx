'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { dashboardApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardData {
  overview: {
    totalLeads: number;
    qualifiedLeads: number;
    appointments: number;
    completedAppointments: number;
    wonDeals: number;
    pipelineValue?: number; // Optionnel (ADMIN seulement)
    wonValue?: number; // Optionnel (ADMIN seulement)
  };
  conversions?: {
    qualificationRate: number;
    appointmentRate: number;
    showRate: number;
    noShowRate: number;
    closingRate: number;
  };
  closerPerformance: Array<{
    id: string;
    name: string;
    totalCalls: number;
    wonDeals: number;
    closingRate: number;
    revenue?: number; // Optionnel (ADMIN seulement)
  }>;
  upcomingAppointments: Array<{
    id: string;
    scheduledAt: string;
    lead: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    closer: {
      id: string;
      firstName: string;
      lastName: string;
    };
    closingProbability: number;
  }>;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated || !user) {
      console.log('Non authentifié, redirection vers login...');
      router.push('/login');
      return;
    }

    console.log('Utilisateur authentifié, chargement du dashboard...', user.role);

    const fetchData = async () => {
      try {
        console.log('Appel API dashboard...');
        let response;
        switch (user.role) {
          case 'SUPER_ADMIN':
            response = await dashboardApi.getAdmin();
            break;
          case 'ADMIN':
            response = await dashboardApi.getCeo();
            break;
          case 'MANAGER':
            response = await dashboardApi.getManager();
            break;
          case 'SETTER':
            response = await dashboardApi.getSetter();
            break;
          case 'CLOSER':
          default:
            response = await dashboardApi.getCloser();
            break;
        }
        console.log('Données dashboard reçues:', response.data);
        console.log('Type de données:', typeof response.data);
        console.log('Overview:', response.data?.overview);
        console.log('Conversions:', response.data?.conversions);
        setData(response.data);
      } catch (error: any) {
        console.error('Erreur lors du chargement du dashboard:', error);
        if (error.response?.status === 401) {
          // Token invalide, rediriger vers login
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="text-center text-gray-600">Erreur de chargement</div>
      </AppLayout>
    );
  }

  // Vue ADMIN
  if (user.role === 'ADMIN' && 'overview' in data) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-2 text-sm">Vue d'ensemble de votre activité</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads totaux</div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{data.overview.totalLeads}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads qualifiés</div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{data.overview.qualifiedLeads}</div>
              {data.conversions && (
                <div className="text-sm text-slate-700 mt-2 font-medium">
                  {data.conversions.qualificationRate}% de qualification
                </div>
              )}
            </div>
            {/* Pipeline et CA seulement pour ADMIN */}
            {user?.role === 'ADMIN' && data.overview.pipelineValue !== undefined && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline</div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.overview.pipelineValue)}
                </div>
              </div>
            )}
            {user?.role === 'ADMIN' && data.overview.wonValue !== undefined && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: '#b85f00' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CA ce mois</div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef3e7' }}>
                    <svg className="w-5 h-5" style={{ color: '#b85f00' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.overview.wonValue)}
                </div>
              </div>
            )}
          </div>

          {/* Conversions */}
          {data.conversions && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Taux de conversion</h2>
                  <p className="text-sm text-slate-500 mt-1">Performance globale du pipeline</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Qualification</div>
                  <div className="text-2xl font-bold text-slate-900">{data.conversions.qualificationRate}%</div>
                </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">RDV</div>
                <div className="text-2xl font-bold text-slate-900">{data.conversions.appointmentRate}%</div>
              </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Show</div>
                  <div className="text-2xl font-bold text-slate-900">{data.conversions.showRate}%</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No-show</div>
                  <div className="text-2xl font-bold text-slate-900">{data.conversions.noShowRate}%</div>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: '#fef3e7', borderColor: '#fed7aa' }}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#b85f00' }}>Closing</div>
                  <div className="text-2xl font-bold" style={{ color: '#b85f00' }}>{data.conversions.closingRate}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Performance par closer */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Performance par closeur</h2>
                <p className="text-sm text-slate-500 mt-1">Statistiques individuelles du mois</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Closeur</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Appels</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Signés</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Taux</th>
                    {user?.role === 'ADMIN' && (
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">CA</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.closerPerformance.map((closer) => (
                    <tr key={closer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-slate-800">
                              {closer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900">{closer.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{closer.totalCalls}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{closer.wonDeals}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          closer.closingRate >= 30 
                            ? 'bg-emerald-200 text-emerald-900' 
                            : closer.closingRate >= 20
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-200 text-slate-900'
                        }`}>
                          {closer.closingRate}%
                        </span>
                      </td>
                      {/* Revenue seulement pour ADMIN */}
                      {user?.role === 'ADMIN' && closer.revenue !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold" style={{ color: '#b85f00' }}>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(closer.revenue)}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prochains appels */}
          {data.upcomingAppointments && data.upcomingAppointments.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Prochains appels aujourd'hui</h2>
              <div className="space-y-3">
                {data.upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <div>
                      <div className="font-medium text-gray-900">
                        {apt.lead.firstName} {apt.lead.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(apt.scheduledAt), 'PPp', { locale: fr })} avec {apt.closer.firstName} {apt.closer.lastName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {apt.closingProbability}% prob.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Vue Closeuse
  if ('todayAppointments' in data) {
    const closerData = data as any;
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Mon Dashboard</h1>
            <p className="text-gray-600 mt-2">Vue opérationnelle</p>
          </div>

          {/* Appels aujourd'hui */}
          {closerData.todayAppointments && closerData.todayAppointments.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Mes appels aujourd'hui</h2>
              <div className="space-y-3">
                {closerData.todayAppointments.map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <div>
                      <div className="font-medium text-gray-900">
                        {apt.lead.firstName} {apt.lead.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(apt.scheduledAt), 'PPp', { locale: fr })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {apt.closingProbability}% prob.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats mensuelles */}
          {closerData.monthlyStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Appels ce mois</div>
                <div className="text-3xl font-semibold mt-2">{closerData.monthlyStats.appointments}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Signés</div>
                <div className="text-3xl font-semibold mt-2">{closerData.monthlyStats.wonDeals}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Taux de closing</div>
                <div className="text-3xl font-semibold mt-2">{closerData.monthlyStats.closingRate}%</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">CA généré</div>
                <div className="text-3xl font-semibold mt-2">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(closerData.monthlyStats.revenue)}
                </div>
              </div>
            </div>
          )}

          {/* Follow-ups */}
          {closerData.pendingFollowUps && closerData.pendingFollowUps.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Follow-ups à faire</h2>
              <div className="space-y-2">
                {closerData.pendingFollowUps.map((followUp: any) => (
                  <div key={followUp.id} className="p-3 bg-yellow-50 rounded">
                    <div className="font-medium">{followUp.title}</div>
                    <div className="text-sm text-gray-600">{followUp.lead.email}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Vue Manager (même structure que ADMIN mais sans les montants en euros)
  if (user.role === 'MANAGER' && 'overview' in data) {
    console.log('[Manager Dashboard] Données:', data);
    console.log('[Manager Dashboard] Overview:', data.overview);
    console.log('[Manager Dashboard] Conversions:', data.conversions);
    
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="border-b border-slate-200 pb-6">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-700 mt-2">Vue d'ensemble de votre activité</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads totaux</div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {data.overview?.totalLeads ?? 0}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads qualifiés</div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {data.overview?.qualifiedLeads ?? 0}
              </div>
              <div className="text-sm text-slate-700 mt-2 font-medium">
                {data.conversions?.qualificationRate ?? 0}% de qualification
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-emerald-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deals signés</div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {data.overview?.wonDeals ?? 0}
              </div>
            </div>
          </div>

          {/* Conversions - Toujours afficher, même si les valeurs sont à 0 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Taux de conversion</h2>
                <p className="text-sm text-slate-500 mt-1">Performance globale du pipeline</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Qualification</div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.conversions?.qualificationRate ?? 0}%
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">RDV</div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.conversions?.appointmentRate ?? 0}%
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Show</div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.conversions?.showRate ?? 0}%
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No-show</div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.conversions?.noShowRate ?? 0}%
                </div>
              </div>
              <div className="p-4 rounded-lg border" style={{ backgroundColor: '#fef3e7', borderColor: '#fed7aa' }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#b85f00' }}>Closing</div>
                <div className="text-2xl font-bold" style={{ color: '#b85f00' }}>
                  {data.conversions?.closingRate ?? 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Performance par closer */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Performance par closeur</h2>
                <p className="text-sm text-slate-500 mt-1">Statistiques individuelles du mois</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Closeur</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Appels</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Signés</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Taux</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.closerPerformance.map((closer) => (
                    <tr key={closer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-slate-800">
                              {closer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900">{closer.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{closer.totalCalls}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{closer.wonDeals}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          closer.closingRate >= 30 
                            ? 'bg-emerald-200 text-emerald-900' 
                            : closer.closingRate >= 20
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-200 text-slate-900'
                        }`}>
                          {closer.closingRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prochains appels */}
          {data.upcomingAppointments && data.upcomingAppointments.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Prochains appels aujourd'hui</h2>
              <div className="space-y-3">
                {data.upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <div>
                      <div className="font-medium text-gray-900">
                        {apt.lead.firstName} {apt.lead.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(apt.scheduledAt), 'PPp', { locale: fr })}
                      </div>
                      {apt.closer && (
                        <div className="text-xs text-gray-500 mt-1">
                          Closeur: {apt.closer.firstName} {apt.closer.lastName}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {apt.closingProbability}% prob.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Vue Setter
  if (user.role === 'SETTER' && 'leadsToQualify' in data) {
    const setterData = data as any;
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard Setter</h1>
            <p className="text-gray-600 mt-2">Qualification et planification</p>
          </div>

          {/* Stats */}
          {setterData.stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Qualifiés ce mois</div>
                <div className="text-3xl font-semibold mt-2">{setterData.stats.qualifiedThisMonth || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">RDV planifiés ce mois</div>
                <div className="text-3xl font-semibold mt-2">{setterData.stats.scheduledThisMonth || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Taux de qualification</div>
                <div className="text-3xl font-semibold mt-2">{setterData.stats.qualificationRate || 0}%</div>
              </div>
            </div>
          )}

          {/* Leads à qualifier */}
          {setterData.leadsToQualify && setterData.leadsToQualify.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Leads à qualifier</h2>
              <div className="space-y-3">
                {setterData.leadsToQualify.slice(0, 10).map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <div>
                      <div className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{lead.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Score: {lead.qualificationScore || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.closingProbability || 0}% prob.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads à planifier */}
          {setterData.leadsToSchedule && setterData.leadsToSchedule.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Leads à planifier (RDV)</h2>
              <div className="space-y-3">
                {setterData.leadsToSchedule.slice(0, 10).map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{lead.email} • {lead.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Score: {lead.qualificationScore || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.closingProbability || 0}% prob.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Vue Admin
  if (user.role === 'SUPER_ADMIN' && 'overview' in data) {
    const adminData = data as any;
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard Super Admin</h1>
            <p className="text-gray-600 mt-2">Vue globale KLOZD</p>
          </div>

          {/* KPIs globaux */}
          {adminData.overview && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Organisations</div>
                <div className="text-3xl font-semibold mt-2">{adminData.overview.totalOrganizations || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Utilisateurs</div>
                <div className="text-3xl font-semibold mt-2">{adminData.overview.totalUsers || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Leads</div>
                <div className="text-3xl font-semibold mt-2">{adminData.overview.totalLeads || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Deals</div>
                <div className="text-3xl font-semibold mt-2">{adminData.overview.totalDeals || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Deals gagnés</div>
                <div className="text-3xl font-semibold mt-2">{adminData.overview.totalWonDeals || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Revenus totaux</div>
                <div className="text-3xl font-semibold mt-2">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(adminData.overview.totalRevenue || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Top organisations */}
          {adminData.topOrganizations && adminData.topOrganizations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Top organisations par revenus</h2>
              <div className="space-y-3">
                {adminData.topOrganizations.map((org: any, index: number) => (
                  <div key={org.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-semibold text-gray-600">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-gray-600">{org.userCount} users • {org.leadCount} leads</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(org.revenue || 0)}
                      </div>
                      <div className="text-xs text-gray-500">{org.dealCount} deals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Fallback si aucun format ne correspond
  return (
    <AppLayout>
      <div className="space-y-8">
          <div>
          <h1 className="text-3xl font-semibold text-gray-900">Mon Dashboard</h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">Format de données non reconnu pour le rôle {user.role}</p>
          <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto text-gray-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </AppLayout>
  );
}

