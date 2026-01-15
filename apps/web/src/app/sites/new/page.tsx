'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuthStore } from '@/store/auth-store';
import { sitesApi, formsApi } from '@/lib/api';

interface Form {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface SiteSection {
  id: string;
  type: 'text' | 'image' | 'form';
  content?: string;
  imageUrl?: string;
  formId?: string;
  order: number;
}

export default function NewSitePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [showPreview, setShowPreview] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'>('DRAFT');
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [primaryButtonColor, setPrimaryButtonColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Charger les formulaires disponibles
    const fetchForms = async () => {
      try {
        const response = await formsApi.getAll();
        // Handle new paginated response format
        const formsList = response.data.items || (Array.isArray(response.data) ? response.data : []);
        setForms(formsList.filter((f: Form) => f.status === 'ACTIVE'));
      } catch (err) {
        console.error('Erreur lors du chargement des formulaires:', err);
      }
    };

    fetchForms();
  }, [isAuthenticated, user, router]);

  // Générer le slug automatiquement depuis le nom
  useEffect(() => {
    if (name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [name, slug]);

  const addSection = (type: 'text' | 'image' | 'form') => {
    const newSection: SiteSection = {
      id: `section-${Date.now()}`,
      type,
      order: sections.length,
      ...(type === 'text' && { content: '' }),
      ...(type === 'image' && { imageUrl: '' }),
      ...(type === 'form' && { formId: '' }),
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id).map((s, idx) => ({ ...s, order: idx })));
  };

  const updateSection = (id: string, updates: Partial<SiteSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    setSections(newSections.map((s, idx) => ({ ...s, order: idx })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('Le nom et le slug sont requis');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const contentJson = JSON.stringify({ sections });
      const siteData = {
        name,
        description: description || undefined,
        slug,
        status,
        contentJson,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        backgroundColor: backgroundColor || undefined,
        textColor: textColor || undefined,
        primaryButtonColor: primaryButtonColor || undefined,
        fontFamily: fontFamily || undefined,
        formId: sections.find((s) => s.type === 'form' && s.formId)?.formId || undefined,
      };

      const response = await sitesApi.create(siteData);
      router.push(`/sites/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du site');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50">
        {/* Header fixe */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nouveau site</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {showPreview ? 'Masquer' : 'Aperçu'}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Canvas en plein écran */}
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
          {/* Palette de sections - Colonne gauche */}
          <div className="col-span-2 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Sections</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => addSection('text')}
                  className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  📝 Texte
                </button>
                <button
                  type="button"
                  onClick={() => addSection('image')}
                  className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  🖼️ Image
                </button>
                <button
                  type="button"
                  onClick={() => addSection('form')}
                  className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  📋 Formulaire
                </button>
              </div>
            </div>
          </div>

          {/* Canvas principal - Colonne centrale */}
          <div className={`${showPreview ? 'col-span-7' : 'col-span-10'} overflow-y-auto bg-gray-50`}>
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex-1 p-6 space-y-4">
                {/* Informations générales */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nom du site *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                        placeholder="Ex: Landing Page Produit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Slug (URL) *
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                        placeholder="landing-page-produit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
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
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 min-h-[500px] p-6">
                  {sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <p className="text-gray-400 text-sm mb-2">Aucune section ajoutée</p>
                      <p className="text-gray-300 text-xs">Cliquez sur les boutons à gauche pour ajouter des sections</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sections.map((section, index) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-medium text-gray-500">
                              Section {index + 1} - {section.type === 'text' ? 'Texte' : section.type === 'image' ? 'Image' : 'Formulaire'}
                            </span>
                            <div className="flex items-center space-x-2">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveSection(index, index - 1)}
                                  className="text-gray-400 hover:text-gray-600 text-sm"
                                >
                                  ↑
                                </button>
                              )}
                              {index < sections.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveSection(index, index + 1)}
                                  className="text-gray-400 hover:text-gray-600 text-sm"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeSection(section.id)}
                                className="text-red-400 hover:text-red-600 text-sm ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {section.type === 'text' && (
                            <textarea
                              value={section.content || ''}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              rows={6}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                              placeholder="Saisissez votre texte ici..."
                            />
                          )}

                          {section.type === 'image' && (
                            <div className="space-y-2">
                              <input
                                type="url"
                                value={section.imageUrl || ''}
                                onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                                placeholder="URL de l'image"
                              />
                              {section.imageUrl && (
                                <img
                                  src={section.imageUrl}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded-md border border-gray-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          )}

                          {section.type === 'form' && (
                            <select
                              value={section.formId || ''}
                              onChange={(e) => updateSection(section.id, { formId: e.target.value })}
                              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                              }}
                            >
                              <option value="">Sélectionner un formulaire</option>
                              {forms.map((form) => (
                                <option key={form.id} value={form.id}>
                                  {form.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Personnalisation du style */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Personnalisation du style</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur de fond
                      </label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="cursor-pointer"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          border: 'none',
                          outline: 'none',
                          padding: 0,
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur du texte
                      </label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="cursor-pointer"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          border: 'none',
                          outline: 'none',
                          padding: 0,
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur du bouton
                      </label>
                      <input
                        type="color"
                        value={primaryButtonColor}
                        onChange={(e) => setPrimaryButtonColor(e.target.value)}
                        className="cursor-pointer"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          border: 'none',
                          outline: 'none',
                          padding: 0,
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Police de caractères
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="">Par défaut</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Times New Roman', Times, serif">Times New Roman</option>
                        <option value="'Courier New', Courier, monospace">Courier New</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre d'actions fixe en bas */}
              <div className="border-t border-gray-200 bg-white px-6 py-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 text-white rounded-lg transition-colors font-medium shadow-sm text-sm"
                    style={{
                      backgroundColor: submitting ? '#9ca3af' : '#000000',
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.backgroundColor = '#1f2937';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.backgroundColor = '#000000';
                      }
                    }}
                  >
                    {submitting ? 'Création...' : 'Créer le site'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar - Aperçu */}
          {showPreview && (
            <div className="col-span-3 border-l border-gray-200 bg-white overflow-y-auto">
              <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
                <h3 className="text-sm font-semibold text-gray-900">Aperçu en temps réel</h3>
              </div>
              <div className="p-4">
                <div
                  style={{
                    backgroundColor: backgroundColor || '#ffffff',
                    color: textColor || '#000000',
                    fontFamily: fontFamily || 'inherit',
                    minHeight: '400px',
                    padding: '2rem',
                  }}
                >
                  {sections.length === 0 ? (
                    <p className="text-gray-400 text-center">Aucune section à prévisualiser</p>
                  ) : (
                    sections.map((section, index) => (
                      <div key={section.id} className="mb-6">
                        {section.type === 'text' && (
                          <div
                            className="prose max-w-none"
                            style={{ color: textColor || '#000000' }}
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
                              Formulaire: {forms.find((f) => f.id === section.formId)?.name || 'Chargement...'}
                            </p>
                            <p className="text-xs text-gray-400">Le formulaire sera intégré ici</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

