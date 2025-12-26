'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuthStore } from '@/store/auth-store';
import { sitesApi } from '@/lib/api';

interface SiteSection {
  id: string;
  type: 'text' | 'image' | 'form';
  content?: string;
  imageUrl?: string;
  formId?: string;
  order: number;
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const siteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [site, setSite] = useState<any>(null);
  const [sections, setSections] = useState<SiteSection[]>([]);

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
  }, [siteId, isAuthenticated, user, router]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'DRAFT':
        return 'Brouillon';
      case 'PAUSED':
        return 'En pause';
      case 'ARCHIVED':
        return 'Archivé';
      default:
        return status;
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

  if (error || !site) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
            {site.description && (
              <p className="text-gray-600 mt-2">{site.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(site.status)}`}
            >
              {getStatusLabel(site.status)}
            </span>
            <button
              onClick={() => router.push(`/sites/${siteId}/edit`)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Modifier
            </button>
            <button
              onClick={() => router.push('/sites')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <p className="text-sm text-gray-900">{site.slug}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
              <p className="text-sm text-gray-900">{site.organization?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Créé le</label>
              <p className="text-sm text-gray-900">
                {new Date(site.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modifié le</label>
              <p className="text-sm text-gray-900">
                {new Date(site.updatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Aperçu du site */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu du site</h2>
          <div
            style={{
              backgroundColor: site.backgroundColor || '#ffffff',
              color: site.textColor || '#000000',
              fontFamily: site.fontFamily || 'inherit',
              minHeight: '400px',
              padding: '2rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          >
            {sections.length === 0 ? (
              <p className="text-gray-400 text-center">Aucune section configurée</p>
            ) : (
              sections
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
                          Formulaire: {site.form?.name || 'Non trouvé'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Le formulaire sera intégré ici dans la version publique
                        </p>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

