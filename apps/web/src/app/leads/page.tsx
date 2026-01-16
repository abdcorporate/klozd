'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { leadsApi, exportsApi, usersApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { useCursorPagination } from '@/lib/pagination/useCursorPagination';

interface Lead {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  qualificationScore: number | null;
  closingProbability: number | null;
  budget: number | null;
  sector: string | null;
  urgency: string | null;
  assignedCloser: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
}

interface Closer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

function LeadsPageContent() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pagination = useCursorPagination<Lead>();
  const { items: leads, pageInfo, loading, error, limit, cursor, sortBy, sortOrder, q, setQuery, setSort, nextPage } = pagination;
  const [closers, setClosers] = useState<Closer[]>([]);
  const [updatingCloser, setUpdatingCloser] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const response = await exportsApi.exportLeads();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

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
  }, [user, isAuthenticated, router]);

  // Fetch leads with pagination
  useEffect(() => {
    if (!isAuthenticated || user?.role === 'CLOSER') return;

    const fetchLeads = async () => {
      pagination.setLoading(true);
      pagination.setError(null);
      try {
        const response = await leadsApi.getAll({
          limit,
          cursor: cursor || undefined,
          sortBy,
          sortOrder,
          q: q || undefined,
        });
        
        // Handle new paginated response format: { items, pageInfo }
        if (response.data.items && response.data.pageInfo) {
          // Si cursor existe, ajouter les items aux existants (charger plus)
          // Sinon, remplacer les items (nouvelle recherche/filtre)
          if (cursor) {
            pagination.setItems([...pagination.items, ...response.data.items]);
          } else {
            pagination.setItems(response.data.items);
          }
          pagination.setPageInfo(response.data.pageInfo);
        } else {
          // Fallback for old format
          const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          if (cursor) {
            pagination.setItems([...pagination.items, ...items]);
          } else {
            pagination.setItems(items);
          }
          pagination.setPageInfo({
            limit: items.length,
            nextCursor: null,
            hasNextPage: false,
          });
        }
      } catch (err: any) {
        console.error('Error fetching leads:', err);
        pagination.setError(err);
        // Ne pas réinitialiser les items en cas d'erreur lors du chargement de la page suivante
        if (!cursor) {
          pagination.setItems([]);
        }
      } finally {
        pagination.setLoading(false);
      }
    };

    fetchLeads();
  }, [limit, cursor, sortBy, sortOrder, q, isAuthenticated, user?.role]);

  // Fetch closers (only once, not paginated)
  useEffect(() => {
    if (!isAuthenticated || user?.role === 'CLOSER') return;

    const fetchClosers = async () => {
      // Seulement pour SUPER_ADMIN, MANAGER et ADMIN
      if (user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER' || user?.role === 'ADMIN') {
        try {
          const response = await usersApi.getAll({ limit: 100 }); // Get all closers (reasonable limit)
          // Handle paginated response
          const users = response.data.items || response.data.data || response.data || [];
          const closersList = users.filter((u: any) => u.role === 'CLOSER' && u.status === 'ACTIVE');
          setClosers(closersList);
        } catch (error) {
          console.error('Error fetching closers:', error);
          setClosers([]);
        }
      }
    };

    fetchClosers();
  }, [user?.role, isAuthenticated]);

  // Rediriger les closers
  if (user?.role === 'CLOSER') {
    return null; // Le useEffect va rediriger
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
      case 'WON':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualificationExplanation = (lead: Lead): string => {
    // Cas spécial pour les leads abandonnés
    if (lead.status === 'ABANDONED') {
      const parts: string[] = ['Formulaire abandonné'];
      
      if (lead.budget) {
        parts.push(`budget ${lead.budget.toLocaleString('fr-FR')}€`);
      }
      
      if (lead.sector) {
        parts.push(`secteur ${lead.sector}`);
      }
      
      // Si le lead a un score de qualification (même si abandonné), on peut l'afficher
      if (lead.qualificationScore !== null && lead.qualificationScore > 0) {
        parts.push(`score partiel ${lead.qualificationScore}/100`);
      }
      
      return parts.join(', ');
    }
    
    // Pour les autres statuts
    const parts: string[] = [];
    
    if (lead.status === 'QUALIFIED') {
      parts.push('Score élevé');
    } else if (lead.status === 'DISQUALIFIED') {
      parts.push('Score insuffisant');
    }
    
    if (lead.budget) {
      parts.push(`budget ${lead.budget.toLocaleString('fr-FR')}€`);
    }
    
    if (lead.sector) {
      parts.push(`secteur ${lead.sector}`);
    }
    
    if (lead.urgency) {
      const urgencyLabels: Record<string, string> = {
        high: 'déjà engagé',
        medium: 'engagement moyen',
        low: 'engagement faible',
      };
      parts.push(urgencyLabels[lead.urgency] || lead.urgency);
    }
    
    if (lead.assignedCloser) {
      parts.push(`bon fit avec ${lead.assignedCloser.firstName}`);
    }
    
    return parts.length > 1 ? parts.join(', ') : (parts[0] || '');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600 mt-2">Gérez vos prospects</p>
          </div>
          <button
            onClick={handleExport}
            className="px-5 py-2.5 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
          >
            Exporter CSV
          </button>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Rechercher par email, nom, entreprise..."
              value={q}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            <select
              value={sortBy}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="createdAt">Date de création</option>
              <option value="updatedAt">Date de modification</option>
              <option value="qualificationScore">Score</option>
            </select>
            <button
              onClick={() => setSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Erreur lors du chargement: {error.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {loading && (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          )}
          {!loading && (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Explication</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-brand-orange transition-colors"
                        >
                          {lead.firstName} {lead.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.qualificationScore !== null ? (
                          <span className="text-sm font-medium text-gray-900">{lead.qualificationScore}/100</span>
                        ) : (
                          <span className="text-sm text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="text-xs italic">
                          {getQualificationExplanation(lead) || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(lead.createdAt), 'd MMM yyyy HH:mm', { locale: fr })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length === 0 && !loading && (
                <div className="p-12 text-center text-gray-500">
                  Aucun lead trouvé
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination controls */}
        {pageInfo && (
          <div className="flex justify-between items-center bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              {leads.length} résultat{leads.length > 1 ? 's' : ''} affiché{leads.length > 1 ? 's' : ''}
            </div>
            {pageInfo.hasNextPage && (
              <button
                onClick={nextPage}
                disabled={loading}
                className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    }>
      <LeadsPageContent />
    </Suspense>
  );
}
