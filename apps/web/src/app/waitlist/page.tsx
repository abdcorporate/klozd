'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { adminWaitlistApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WaitlistEntry {
  id: string;
  email: string;
  firstName: string | null;
  role: string | null;
  leadVolumeRange: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface WaitlistStats {
  total: number;
  recent: number;
  byRole: Array<{ role: string; count: number }>;
  byLeadVolume: Array<{ range: string; count: number }>;
  byUtmSource: Array<{ source: string; count: number }>;
}

export default function AdminWaitlistPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN uniquement
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, isAuthenticated, router, page, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [entriesResponse, statsResponse] = await Promise.all([
        adminWaitlistApi.getEntries({ page, limit, search: search || undefined }),
        adminWaitlistApi.getStats(),
      ]);

      setEntries(entriesResponse.data.data || []);
      setTotalPages(entriesResponse.data.pagination?.totalPages || 1);
      setTotal(entriesResponse.data.pagination?.total || 0);
      setStats(statsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return '-';
    const roleMap: Record<string, string> = {
      it: 'IT / Technologie',
      'real-estate': 'Immobilier',
      finance: 'Finance / Assurance',
      coaching: 'Coaching / Formation',
      ecommerce: 'E-commerce / Retail',
      health: 'Santé / Bien-être',
      automotive: 'Automobile',
      construction: 'BTP / Construction',
      consulting: 'Conseil / Services',
      other: 'Autre',
      // Anciennes valeurs pour rétrocompatibilité
      infopreneur: 'Infopreneur',
      closer: 'Closer',
      setter: 'Setter',
      manager: 'Manager',
    };
    return roleMap[role] || role;
  };

  const getLeadVolumeLabel = (range: string | null) => {
    if (!range) return '-';
    return range.replace('+', '+ leads/mois');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading && !entries.length) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Liste d'attente</h1>
            <p className="text-gray-600 mt-2">
              Gérez les inscriptions à la waitlist KLOZD
            </p>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total d'inscriptions</div>
              <div className="text-3xl font-semibold mt-2">{stats.total}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">7 derniers jours</div>
              <div className="text-3xl font-semibold mt-2">{stats.recent}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Avec secteur</div>
              <div className="text-3xl font-semibold mt-2">
                {stats.byRole.reduce((acc, item) => acc + item.count, 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Avec volume</div>
              <div className="text-3xl font-semibold mt-2">
                {stats.byLeadVolume.reduce((acc, item) => acc + item.count, 0)}
              </div>
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email ou prénom..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Rechercher
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </form>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tableau des entrées */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secteur d'activités
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {search ? 'Aucun résultat trouvé' : 'Aucune inscription pour le moment'}
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{entry.firstName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {getRoleLabel(entry.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {getLeadVolumeLabel(entry.leadVolumeRange)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {format(new Date(entry.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total} entrées
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Détails des statistiques */}
        {stats && (stats.byRole.length > 0 || stats.byLeadVolume.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.byRole.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Par secteur d'activités</h3>
                <div className="space-y-2">
                  {stats.byRole.map((item) => (
                    <div key={item.role} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{getRoleLabel(item.role)}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.byLeadVolume.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Par volume de leads</h3>
                <div className="space-y-2">
                  {stats.byLeadVolume.map((item) => (
                    <div key={item.range} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{getLeadVolumeLabel(item.range)}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </AppLayout>
  );
}
