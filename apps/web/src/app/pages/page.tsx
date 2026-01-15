'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { formsApi, sitesApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Form {
  id: string;
  name: string;
  description: string | null;
  status: string;
  slug: string;
  _count: {
    submissions: number;
    leads: number;
  };
}

interface Site {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  slug: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
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

export default function FormsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'sites'>('sites');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Les utilisateurs non-ADMIN/SUPER_ADMIN ne peuvent pas accéder à cette page
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    // Par défaut, afficher l'onglet "sites" pour les ADMIN/SUPER_ADMIN
    setActiveTab('sites');

    const fetchData = async () => {
      try {
        setLoading(true);
        const [formsResponse, sitesResponse] = await Promise.all([
          formsApi.getAll({ limit: 100 }).catch(() => ({ data: { items: [], pageInfo: null } })),
          (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') 
            ? sitesApi.getAll({ limit: 100 }).catch(() => ({ data: { items: [], pageInfo: null } }))
            : Promise.resolve({ data: { items: [], pageInfo: null } }),
        ]);
        
        // Handle new paginated response format
        if (formsResponse.data.items) {
          setForms(formsResponse.data.items);
        } else {
          setForms(Array.isArray(formsResponse.data) ? formsResponse.data : []);
        }
        
        if (sitesResponse.data.items) {
          setSites(sitesResponse.data.items);
        } else {
          setSites(Array.isArray(sitesResponse.data) ? sitesResponse.data : []);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-600 mt-2">
              {activeTab === 'forms' ? 'Gérez vos formulaires de qualification' : 'Gérez vos landing pages'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {activeTab === 'forms' ? (
              <Link
                href="/forms/new"
                className="px-4 py-2 text-white rounded-md transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
              >
                + Nouveau formulaire
              </Link>
            ) : (
              (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <button
                  onClick={() => router.push('/sites/new')}
                  className="px-4 py-2 text-white rounded-md transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
                >
                  + Nouveau site
                </button>
              )
            )}
          </div>
        </div>

        {/* Onglets */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sites')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sites'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sites web
              </button>
              <button
                onClick={() => setActiveTab('forms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forms'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Formulaires
              </button>
            </nav>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === 'sites' ? (
          /* Section Sites */
          (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') ? (
            <div className="space-y-4">
              {sites.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-lg border border-gray-200 text-center">
                  <p className="text-gray-600 mb-4">Aucun site créé</p>
                  <button
                    onClick={() => router.push('/sites/new')}
                    className="inline-block px-4 py-2 text-white rounded-md transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
                  >
                    Créer votre premier site
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sites.map((site) => (
                    <div key={site.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden hover:border-brand-orange transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{site.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          site.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          site.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          site.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getStatusLabel(site.status)}
                        </span>
                      </div>
                      {site.description && (
                        <p className="text-gray-600 text-sm mb-4">{site.description}</p>
                      )}
                      {user?.role === 'SUPER_ADMIN' && site.organization && (
                        <div className="text-xs text-gray-500 mb-4">
                          {site.organization.name}
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <Link
                          href={`/sites/${site.id}`}
                          className="text-sm text-brand-orange hover:underline font-medium"
                        >
                          Voir les détails →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null
        ) : (
          /* Section Formulaires */
          <div className="space-y-4">
            {forms.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-lg border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">Aucun formulaire pour le moment</p>
              <Link
                href="/forms/new"
                className="inline-block px-4 py-2 text-white rounded-md transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
              >
                Créer votre premier formulaire
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div key={form.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden hover:border-brand-orange transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{form.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      form.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      form.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusLabel(form.status)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{form._count.submissions} soumissions</span>
                    <span>{form._count.leads} leads</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <Link
                      href={`/forms/${form.id}`}
                      className="text-sm text-brand-orange hover:underline font-medium"
                    >
                      Voir les détails →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}


