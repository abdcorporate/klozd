'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formsApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuthStore } from '@/store/auth-store';
import { DraggableFieldList } from '@/components/forms/draggable-field-list';
import { FormPreview } from '@/components/forms/form-preview';
import { FormTemplates } from '@/components/forms/form-templates';
import { FieldPalette } from '@/components/forms/field-palette';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Le slug est requis').regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']),
  minScore: z.number().min(0).max(100),
  qualifiedRedirectUrl: z.string().url().optional().or(z.literal('')),
  disqualifiedRedirectUrl: z.string().url().optional().or(z.literal('')),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  primaryButtonColor: z.string().optional(),
  fontFamily: z.string().optional(),
  borderRadius: z.string().optional(),
  formFields: z.array(
    z.object({
      label: z.string().min(1, 'Le label est requis'),
      type: z.enum(['TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'DATE', 'BUDGET', 'RATING']),
      required: z.boolean(),
      order: z.number(),
      options: z.string().optional(),
      scoringRulesJson: z.string().optional(),
    }),
  ).min(1, 'Au moins un champ est requis'),
});

type FormData = z.infer<typeof formSchema>;

// Composant pour la zone de drop du canvas
function CanvasDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] ${isOver ? 'bg-blue-50 border-2 border-blue-400 border-dashed' : ''}`}
    >
      {children}
    </div>
  );
}

export default function NewFormPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'DRAFT' as const,
      minScore: 70,
      backgroundColor: '',
      textColor: '',
      primaryButtonColor: '',
      fontFamily: '',
      borderRadius: '',
      formFields: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    getValues,
  } = methods;

  // Surveiller les valeurs de couleur pour la synchronisation
  const backgroundColor = watch('backgroundColor');
  const textColor = watch('textColor');
  const primaryButtonColor = watch('primaryButtonColor');

  const { fields, append, remove, move: moveField } = useFieldArray({
    control,
    name: 'formFields',
  });

  const onSubmit = async (data: FormData) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Transformer les données pour l'API
      const formData = {
        name: data.name,
        description: data.description,
        slug: data.slug,
        status: data.status,
        minScore: data.minScore,
        qualifiedRedirectUrl: data.qualifiedRedirectUrl || undefined,
        disqualifiedRedirectUrl: data.disqualifiedRedirectUrl || undefined,
        backgroundColor: data.backgroundColor || undefined,
        textColor: data.textColor || undefined,
        primaryButtonColor: data.primaryButtonColor || undefined,
        fontFamily: data.fontFamily || undefined,
        borderRadius: data.borderRadius || undefined,
        formFields: data.formFields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          order: index,
          optionsJson: field.options ? JSON.stringify(field.options.split('\n').filter(opt => opt.trim())) : undefined,
          scoringRulesJson: field.scoringRulesJson || undefined,
        })),
      };

      const response = await formsApi.create(formData);
      router.push(`/pages/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du formulaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectTemplate = (template: any) => {
    reset({
      name: template.name,
      description: template.description,
      minScore: 70,
      formFields: template.fields.map((field: any, index: number) => ({
        ...field,
        order: index,
        options: field.options || undefined,
        scoringRulesJson: field.scoringRulesJson || undefined,
      })),
    });
    setShowTemplates(false);
  };

  const handleAddField = (fieldType?: string) => {
    append({
      label: '',
      type: (fieldType as any) || 'TEXT',
      required: false,
      order: fields.length,
    });
  };

  // Configuration des capteurs pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Délai de 8px avant activation pour éviter les conflits avec le clic
      },
    }),
  );

  // Gestion du drop depuis la palette vers le canvas et réordonnancement
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Si on drop depuis la palette vers le canvas
    if (active.id.toString().startsWith('palette-') && over.id === 'form-canvas') {
      const fieldType = active.data.current?.fieldType;
      if (fieldType) {
        handleAddField(fieldType);
      }
      return;
    }

    // Si on réorganise les champs existants
    if (!active.id.toString().startsWith('palette-') && !over.id.toString().startsWith('palette-') && over.id !== 'form-canvas') {
      // Utiliser l'ID pour trouver les indices
      const activeId = active.id.toString();
      const overId = over.id.toString();
      
      const oldIndex = fields.findIndex((field: any, idx: number) => {
        const fieldId = field.id || `field-${idx}`;
        return fieldId === activeId || fieldId.toString() === activeId;
      });
      
      const newIndex = fields.findIndex((field: any, idx: number) => {
        const fieldId = field.id || `field-${idx}`;
        return fieldId === overId || fieldId.toString() === overId;
      });

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Utiliser moveField de useFieldArray pour réorganiser
        moveField(oldIndex, newIndex);
        
        // Mettre à jour les ordres
        setTimeout(() => {
          const currentFields = getValues('formFields');
          if (currentFields) {
            currentFields.forEach((field: any, idx: number) => {
              setValue(`formFields.${idx}.order`, idx);
            });
          }
        }, 0);
      }
    }
  };

  return (
    <AppLayout>
      <FormProvider {...methods}>
        <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50">
          {/* Header fixe */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nouveau formulaire</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {showTemplates ? 'Masquer' : 'Templates'}
              </button>
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
              {/* Palette de champs - Colonne gauche */}
              <div className="col-span-2 border-r border-gray-200 bg-white overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Champs</h3>
                  <FieldPalette />
                </div>
              </div>

              {/* Canvas principal - Colonne centrale */}
              <div className={`${showPreview ? 'col-span-7' : 'col-span-10'} overflow-y-auto bg-gray-50`}>
                <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                  <div className="flex-1 p-6 space-y-4">
                    {/* Informations générales - Barre supérieure compacte */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nom du formulaire *
                          </label>
                          <input
                            {...register('name')}
                            type="text"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                            placeholder="Ex: Qualification Programme LBB"
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Slug (URL) *
                          </label>
                          <input
                            {...register('slug')}
                            type="text"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                            placeholder="qualification-programme-lbb"
                          />
                          {errors.slug && (
                            <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Statut
                          </label>
                          <select
                            {...register('status')}
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

                    {/* Canvas pour les champs */}
                    <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 min-h-[500px] p-6">
                      <CanvasDropZone>
                        {fields.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <p className="text-gray-400 text-sm mb-2">Glissez les champs depuis la palette</p>
                            <p className="text-gray-300 text-xs">ou cliquez sur un type de champ pour l'ajouter</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <DraggableFieldList onRemove={remove} onAddField={handleAddField} fields={fields} />
                          </div>
                        )}
                        {errors.formFields && (
                          <p className="mt-4 text-sm text-red-600">{errors.formFields.message}</p>
                        )}
                      </CanvasDropZone>
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
                            value={backgroundColor || '#f9fafb'}
                            onChange={(e) => setValue('backgroundColor', e.target.value)}
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
                            value={textColor || '#111827'}
                            onChange={(e) => setValue('textColor', e.target.value)}
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
                            value={primaryButtonColor || '#4b5563'}
                            onChange={(e) => setValue('primaryButtonColor', e.target.value)}
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
                            {...register('fontFamily')}
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
                            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                            <option value="Impact, sans-serif">Impact</option>
                            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rayon des bordures
                          </label>
                          <select
                            {...register('borderRadius')}
                            className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1.5em 1.5em',
                              paddingRight: '2.5rem'
                            }}
                          >
                            <option value="">Par défaut</option>
                            <option value="0">Aucun (0px)</option>
                            <option value="4px">Petit (4px)</option>
                            <option value="8px">Moyen (8px)</option>
                            <option value="12px">Grand (12px)</option>
                            <option value="16px">Très grand (16px)</option>
                            <option value="999px">Rond (999px)</option>
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
                      {submitting ? 'Création...' : 'Créer le formulaire'}
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
                  <FormPreview />
                </div>
              </div>
            )}
            </div>
          </DndContext>

          {/* Modal Templates */}
          {showTemplates && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Templates de formulaires</h2>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  <FormTemplates onSelectTemplate={handleSelectTemplate} />
                </div>
              </div>
            </div>
          )}
        </div>
      </FormProvider>
    </AppLayout>
  );
}
