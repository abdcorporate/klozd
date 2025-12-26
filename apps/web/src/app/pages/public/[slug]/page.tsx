'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api, formsApi } from '@/lib/api';
import { format } from 'date-fns';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  optionsJson?: string | null;
  options?: string[];
}

interface Form {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  formFields: FormField[];
  qualifiedRedirectUrl?: string | null;
  disqualifiedRedirectUrl?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  primaryButtonColor?: string | null;
  fontFamily?: string | null;
  borderRadius?: string | null;
  captureAbandons?: boolean;
  abandonmentDelay?: number; // en secondes
}

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTime = useRef<Date>(new Date());
  const formDataRef = useRef<Record<string, any>>({});
  const abandonTrackedRef = useRef<boolean>(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  // Surveiller les changements du formulaire
  const formValues = watch();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        // Récupérer le formulaire par slug (endpoint public)
        const response = await api.get(`/forms/public/${slug}`);
        const formData = response.data;
        
        // Parser les options JSON pour chaque champ
        const formFieldsWithOptions = formData.formFields.map((field: any) => ({
          ...field,
          options: field.optionsJson ? JSON.parse(field.optionsJson) : undefined,
        }));
        
        setForm({
          ...formData,
          formFields: formFieldsWithOptions,
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          setError('Formulaire non trouvé');
        } else {
          setError('Erreur lors du chargement du formulaire');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchForm();
    }
  }, [slug]);

  // Détection d'inactivité et fermeture de fenêtre
  useEffect(() => {
    if (!form || !form.captureAbandons) {
      return;
    }

    const abandonmentDelay = (form.abandonmentDelay || 60) * 1000; // Par défaut 60 secondes (1 minute)

    const resetTimer = () => {
      lastActivityTime.current = new Date();
      
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      inactivityTimer.current = setTimeout(() => {
        handleAbandon();
      }, abandonmentDelay);
    };

    // Écouter les événements utilisateur
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'input', 'change'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Détecter la fermeture de fenêtre
    const handleBeforeUnload = () => {
      if (!abandonTrackedRef.current) {
        handleAbandon(true); // beforeunload ne permet pas d'attendre async, donc on envoie de manière synchrone
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [form]);

  // Sauvegarder les données partielles
  useEffect(() => {
    if (form && Object.keys(formValues).length > 0) {
      formDataRef.current = formValues;
    }
  }, [formValues, form]);

  const calculateCompletionPercentage = (data: Record<string, any>): number => {
    if (!form || form.formFields.length === 0) {
      return 0;
    }

    const totalFields = form.formFields.length;
    let filledFields = 0;

    form.formFields.forEach((field) => {
      const value = data[field.id];
      if (value !== undefined && value !== null && value !== '') {
        // Pour les checkboxes, vérifier que c'est un tableau non vide
        if (field.type === 'CHECKBOX') {
          if (Array.isArray(value) && value.length > 0) {
            filledFields++;
          }
        } else {
          filledFields++;
        }
      }
    });

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  };

  const hasEmailOrPhone = (data: Record<string, any>): boolean => {
    // Chercher l'email dans les données
    const emailField = form?.formFields.find(f => f.type === 'EMAIL');
    const phoneField = form?.formFields.find(f => f.type === 'PHONE');
    
    const email = emailField ? data[emailField.id] : null;
    const phone = phoneField ? data[phoneField.id] : null;

    // Vérifier aussi dans les valeurs brutes (au cas où les clés sont différentes)
    const hasEmail = email || Object.values(data).some(v => 
      typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    );
    const hasPhone = phone || Object.values(data).some(v => 
      typeof v === 'string' && /[\d\s\+\-\(\)]{8,}/.test(v)
    );

    return !!(hasEmail || hasPhone);
  };

  const handleAbandon = async (isBeforeUnload: boolean = false) => {
    if (!form || abandonTrackedRef.current) {
      return;
    }

    const data = formDataRef.current;
    
    // Vérifier qu'il y a des données et qu'au moins l'email OU le téléphone est présent
    if (Object.keys(data).length === 0 || !hasEmailOrPhone(data)) {
      return;
    }

    // Calculer le pourcentage de complétion
    const completionPercentage = calculateCompletionPercentage(data);

    // Extraire l'email et le téléphone pour l'API
    const emailField = form.formFields.find(f => f.type === 'EMAIL');
    const phoneField = form.formFields.find(f => f.type === 'PHONE');
    
    const email = emailField ? data[emailField.id] : null;
    const phone = phoneField ? data[phoneField.id] : null;

    // Utiliser l'email en priorité, sinon le téléphone
    const contactInfo = email || phone;

    try {
      if (isBeforeUnload) {
        // Pour beforeunload, utiliser fetch avec keepalive pour envoyer de manière asynchrone mais fiable
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/leads/forms/${form.id}/abandon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: contactInfo,
            dataJson: JSON.stringify(data),
            completionPercentage,
          }),
          keepalive: true, // Permet d'envoyer même après la fermeture de la page
        }).catch(() => {
          // Ignorer les erreurs silencieusement pour beforeunload
        });
        abandonTrackedRef.current = true;
      } else {
        // Envoyer les données partielles au backend pour créer un FormAbandon
        await formsApi.trackAbandon(form.id, contactInfo, JSON.stringify(data), completionPercentage);
        abandonTrackedRef.current = true;
      }
    } catch (error) {
      console.error('Error tracking abandon:', error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!form) return;

    try {
      setSubmitting(true);
      setError(null);

      // Arrêter le timer d'abandon et marquer comme complété
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      abandonTrackedRef.current = true; // Empêcher le tracking d'abandon après soumission

      // Transformer les données pour correspondre au DTO attendu
      // Les données arrivent avec les IDs des champs comme clés
      const transformedData: any = {
        email: '',
        data: {},
      };

      // Parcourir les champs du formulaire pour extraire les données
      form.formFields.forEach((field) => {
        const value = data[field.id];
        
        if (value !== undefined && value !== null && value !== '') {
          // Extraire les champs spéciaux (email, firstName, lastName, phone, company)
          const labelLower = field.label.toLowerCase();
          
          if (field.type === 'EMAIL') {
            transformedData.email = String(value);
          } else if (labelLower.includes('prénom') || labelLower.includes('first name') || labelLower.includes('prenom')) {
            transformedData.firstName = String(value);
          } else if (labelLower.includes('nom') && !labelLower.includes('prénom') && !labelLower.includes('prenom') || labelLower.includes('last name')) {
            transformedData.lastName = String(value);
          } else if (field.type === 'PHONE' || labelLower.includes('téléphone') || labelLower.includes('telephone') || labelLower.includes('phone')) {
            transformedData.phone = String(value);
          } else if (labelLower.includes('entreprise') || labelLower.includes('company') || labelLower.includes('société')) {
            transformedData.company = String(value);
          }
          
          // Toutes les réponses vont dans data (utiliser le label comme clé pour le scoring)
          transformedData.data[field.label] = value;
          // Aussi avec l'ID pour compatibilité
          transformedData.data[field.id] = value;
        }
      });

      // Vérifier que l'email est présent
      if (!transformedData.email || transformedData.email.trim() === '') {
        setError('L\'email est requis');
        setSubmitting(false);
        return;
      }

      const response = await formsApi.submit(form.id, transformedData);

      // Extraire le leadId depuis la réponse
      const leadId = response.data.lead?.id || response.data.leadId;

      // Rediriger selon le résultat
      // Si le lead est qualifié, rediriger systématiquement vers le calendrier de réservation
      if (response.data.qualified && leadId) {
        router.push(`/book/${leadId}`);
      } else if (!response.data.qualified && form.disqualifiedRedirectUrl) {
        window.location.href = form.disqualifiedRedirectUrl;
      } else if (response.data.qualified && form.qualifiedRedirectUrl && !leadId) {
        // Fallback : si pas de leadId mais qualifiedRedirectUrl configuré
        window.location.href = form.qualifiedRedirectUrl;
      } else if (leadId) {
        // Si leadId existe, rediriger vers le calendrier même si pas qualifié
        router.push(`/book/${leadId}`);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Chargement du formulaire...</div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulaire soumis !</h2>
          <p className="text-gray-600">
            Merci pour votre intérêt. Nous vous contacterons bientôt.
          </p>
        </div>
      </div>
    );
  }

  // Styles personnalisés
  const containerStyle: React.CSSProperties = {
    backgroundColor: form.backgroundColor || '#f9fafb',
    color: form.textColor || '#111827',
    fontFamily: form.fontFamily || undefined,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: form.backgroundColor === '#f9fafb' || !form.backgroundColor ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: form.borderRadius || '8px',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: form.primaryButtonColor || '#4b5563',
    borderRadius: form.borderRadius || '8px',
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: form.borderRadius || '8px',
  };

  return (
    <div className="min-h-screen py-12" style={containerStyle}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="shadow-lg p-8" style={cardStyle}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: form.textColor || '#111827' }}>{form.name}</h1>
            {form.description && (
              <p style={{ color: form.textColor ? `${form.textColor}CC` : '#4b5563' }}>{form.description}</p>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {form.formFields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1" style={{ color: form.textColor || '#374151' }}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'TEXT' && (
                  <input
                    {...register(field.id, { required: field.required })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    style={inputStyle}
                  />
                )}

                {field.type === 'EMAIL' && (
                  <input
                    {...register(field.id, {
                      required: field.required,
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide',
                      },
                    })}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    style={inputStyle}
                  />
                )}

                {field.type === 'PHONE' && (
                  <input
                    {...register(field.id, { required: field.required })}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    style={inputStyle}
                  />
                )}

                {field.type === 'NUMBER' && (
                  <input
                    {...register(field.id, {
                      required: field.required,
                      valueAsNumber: true,
                    })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    style={inputStyle}
                  />
                )}

                {field.type === 'SELECT' && (
                  <select
                    {...register(field.id, { required: field.required })}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
                    style={{
                      ...inputStyle,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Sélectionnez...</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'TEXTAREA' && (
                  <textarea
                    {...register(field.id, { required: field.required })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    style={inputStyle}
                  />
                )}

                {field.type === 'RADIO' && (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          {...register(field.id, { required: field.required })}
                          type="radio"
                          value={option}
                          className="mr-2"
                        />
                        <span style={{ color: form.textColor || '#374151' }}>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'CHECKBOX' && (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          {...register(field.id, { required: field.required })}
                          type="checkbox"
                          value={option}
                          className="mr-2"
                        />
                        <span style={{ color: form.textColor || '#374151' }}>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'DATE' && (
                  <input
                    {...register(field.id, { required: field.required })}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    style={inputStyle}
                  />
                )}

                {field.type === 'BUDGET' && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      {...register(field.id, {
                        required: field.required,
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                      style={inputStyle}
                      placeholder="0.00"
                    />
                  </div>
                )}

                {field.type === 'RATING' && (
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setValue(field.id, star.toString());
                        }}
                        className="text-2xl focus:outline-none"
                        style={{ color: watch(field.id) && parseInt(watch(field.id) as string) >= star ? '#fbbf24' : '#d1d5db' }}
                      >
                        ⭐
                      </button>
                    ))}
                    <input
                      {...register(field.id, { required: field.required })}
                      type="hidden"
                    />
                  </div>
                )}

                {errors[field.id] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.id]?.message as string || 'Ce champ est requis'}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (!submitting && form.primaryButtonColor) {
                  // Assombrir la couleur au survol
                  const color = form.primaryButtonColor;
                  const rgb = color.match(/\d+/g);
                  if (rgb && rgb.length === 3) {
                    const r = Math.max(0, parseInt(rgb[0]) - 20);
                    const g = Math.max(0, parseInt(rgb[1]) - 20);
                    const b = Math.max(0, parseInt(rgb[2]) - 20);
                    e.currentTarget.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = form.primaryButtonColor || '#4b5563';
                }
              }}
            >
              {submitting ? 'Envoi en cours...' : 'Soumettre'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

