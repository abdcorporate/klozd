'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuthStore } from '@/store/auth-store';
import { sitesApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SiteSection {
  id: string;
  type: 'text' | 'image' | 'form';
  content?: string;
  imageUrl?: string;
  formId?: string;
  order: number;
}

interface Site {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  backgroundColor?: string | null;
  textColor?: string | null;
  primaryButtonColor?: string | null;
  fontFamily?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentJson?: string | null;
  createdAt: string;
  updatedAt: string;
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

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    const fetchSite = async () => {
      try {
        setLoading(true);
        const response = await sitesApi.getOne(siteId);
        const siteData = response.data;
        setSite(siteData);

        // Parser le contentJson
        if (siteData.contentJson) {
          try {
            const content = JSON.parse(siteData.contentJson);
            if (content.sections && Array.isArray(content.sections)) {
              setSections(content.sections);
            }
          } catch (e) {
            console.error('Erreur lors du parsing du contentJson:', e);
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Site non trouvé');
        } else {
          setError('Erreur lors du chargement du site');
        }
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchSite();
    }
  }, [siteId, user, isAuthenticated, router]);

  const handleStatusChange = async (newStatus: string) => {
    if (!site) return;

    try {
      setUpdatingStatus(true);
      await sitesApi.update(site.id, {
        name: site.name,
        slug: site.slug,
        description: site.description || undefined,
        status: newStatus,
        metaTitle: site.metaTitle || undefined,
        metaDescription: site.metaDescription || undefined,
        backgroundColor: site.backgroundColor || undefined,
        textColor: site.textColor || undefined,
        primaryButtonColor: site.primaryButtonColor || undefined,
        fontFamily: site.fontFamily || undefined,
      });
      // Recharger le site
      const response = await sitesApi.getOne(site.id);
      setSite(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!site) return;

    try {
      setDeleting(true);
      await sitesApi.delete(site.id);
      router.push('/pages?tab=sites');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du site');
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

  if (!site) {
    return (
      <AppLayout>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error || 'Site non trouvé'}
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
            <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (site.status !== 'ACTIVE') {
                  setError('Le site doit être en statut Actif pour être accessible publiquement');
                  setTimeout(() => setError(null), 5000);
                  return;
                }
                setError(null);
                window.open(`/sites/public/${site.slug}`, '_blank');
              }}
              className="px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
            >
              Voir le site public
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </button>
            <button
              onClick={() => router.push('/pages?tab=sites')}
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
                  <dd className="mt-1 text-sm text-gray-900">{site.slug}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd className="mt-1">
                    <select
                      value={site.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className={`pl-3 pr-10 py-1 text-sm rounded border appearance-none bg-no-repeat bg-right ${
                        site.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-300' :
                        site.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                        site.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
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
                {site.metaTitle && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Titre SEO</dt>
                    <dd className="mt-1 text-sm text-gray-900">{site.metaTitle}</dd>
                  </div>
                )}
                {site.metaDescription && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description SEO</dt>
                    <dd className="mt-1 text-sm text-gray-900">{site.metaDescription}</dd>
                  </div>
                )}
                {user?.role === 'SUPER_ADMIN' && site.organization && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organisation</dt>
                    <dd className="mt-1 text-sm text-gray-900">{site.organization.name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Créé le</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(site.createdAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Modifié le</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(site.updatedAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Aperçu visuel du site */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Aperçu du site</h2>
                <button
                  onClick={() => router.push(`/sites/${site.id}/edit`)}
                  className="px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
                >
                  Modifier
                </button>
              </div>
              {sections.length === 0 ? (
                <p className="text-gray-500">Aucune section définie</p>
              ) : (
                <div
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-[600px]"
                  style={{
                    backgroundColor: site.backgroundColor || '#ffffff',
                    color: site.textColor || '#000000',
                    fontFamily: site.fontFamily || 'inherit',
                  }}
                >
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div key={section.id} className="mb-6">
                        {section.type === 'text' && (
                          <div
                            className="prose max-w-none"
                            style={{ color: site.textColor || '#000000' }}
                            dangerouslySetInnerHTML={{
                              __html: (section.content || '').replace(/\n/g, '<br />'),
                            }}
                          />
                        )}
                        {section.type === 'image' && section.imageUrl && (
                          <img
                            src={section.imageUrl}
                            alt="Section"
                            className="w-full rounded-lg"
                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        {section.type === 'form' && section.formId && (
                          <div className="border border-gray-300 rounded-lg p-4 bg-white">
                            <p className="text-sm text-gray-500 mb-2">
                              Formulaire ID: {section.formId}
                            </p>
                            <p className="text-xs text-gray-400">
                              Le formulaire sera intégré ici dans la version publique
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
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
                Supprimer le site
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le site "{site.name}" ? Cette action est irréversible.
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
