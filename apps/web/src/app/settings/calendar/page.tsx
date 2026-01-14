'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { calendarConfigApi, usersApi } from '@/lib/api';

interface CalendarConfig {
  id: string;
  eventType: string;
  callDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  availability: {
    [key: string]: Array<{ start: string; end: string }>;
  };
  assignedClosers: string[];
  attributionMethod: 'ROUND_ROBIN' | 'AI_INTELLIGENT' | 'MANUAL';
  emailConfirmationImmediate: boolean;
  emailReminder24h: boolean;
  emailReminder1h: boolean;
  smsReminder1h: boolean;
}

interface Closer {
  id: string;
  firstName: string;
  lastName: string;
  closerSettings?: {
    closingRate?: number;
  };
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

export default function CalendarConfigPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [config, setConfig] = useState<CalendarConfig | null>(null);
  const [closers, setClosers] = useState<Closer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Seul l'ADMIN peut accéder
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, isAuthenticated, router]);

  const fetchData = async () => {
    try {
      const [configResponse, closersResponse] = await Promise.all([
        calendarConfigApi.get(),
        usersApi.getAll(),
      ]);

      setConfig(configResponse.data);
      
      // Filtrer les closers actifs avec leurs settings
      // Handle new paginated response format: { items, pageInfo }
      const usersData = closersResponse.data.items || closersResponse.data || [];
      const activeClosers = Array.isArray(usersData)
        ? usersData
            .filter((u: any) => u.role === 'CLOSER' && u.status === 'ACTIVE')
            .map((u: any) => ({
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              closerSettings: u.closerSettings || null,
            }))
        : [];
      setClosers(activeClosers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const updateData = {
        callDuration: config.callDuration,
        bufferBefore: config.bufferBefore,
        bufferAfter: config.bufferAfter,
        availabilityJson: JSON.stringify(config.availability),
        assignedClosersJson: JSON.stringify(config.assignedClosers),
        attributionMethod: config.attributionMethod,
        emailConfirmationImmediate: config.emailConfirmationImmediate,
        emailReminder24h: config.emailReminder24h,
        emailReminder1h: config.emailReminder1h,
        smsReminder1h: config.smsReminder1h,
      };

      await calendarConfigApi.update(updateData);
      alert('Configuration sauvegardée avec succès !');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addTimeSlot = (dayKey: string) => {
    if (!config) return;
    const dayAvailability = config.availability[dayKey] || [];
    setConfig({
      ...config,
      availability: {
        ...config.availability,
        [dayKey]: [...dayAvailability, { start: '09:00', end: '12:00' }],
      },
    });
  };

  const removeTimeSlot = (dayKey: string, index: number) => {
    if (!config) return;
    const dayAvailability = config.availability[dayKey] || [];
    setConfig({
      ...config,
      availability: {
        ...config.availability,
        [dayKey]: dayAvailability.filter((_, i) => i !== index),
      },
    });
  };

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end', value: string) => {
    if (!config) return;
    const dayAvailability = [...(config.availability[dayKey] || [])];
    dayAvailability[index] = { ...dayAvailability[index], [field]: value };
    setConfig({
      ...config,
      availability: {
        ...config.availability,
        [dayKey]: dayAvailability,
      },
    });
  };

  const toggleCloser = (closerId: string) => {
    if (!config) return;
    const isSelected = config.assignedClosers.includes(closerId);
    setConfig({
      ...config,
      assignedClosers: isSelected
        ? config.assignedClosers.filter((id) => id !== closerId)
        : [...config.assignedClosers, closerId],
    });
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

  if (!config) {
    return (
      <AppLayout>
        <div className="text-red-600">Erreur lors du chargement de la configuration</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration du Calendrier</h1>
          <p className="text-gray-600 mt-2">Paramétrez votre calendrier de rendez-vous</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6">
          {/* Type d'événement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'événement
            </label>
            <input
              type="text"
              value={config.eventType}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          {/* Durée */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">DURÉE</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée de l'appel
                </label>
                <select
                  value={config.callDuration}
                  onChange={(e) => setConfig({ ...config, callDuration: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                >
                  {[15, 30, 45, 60, 90, 120].map((min) => (
                    <option key={min} value={min}>
                      {min} min
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buffer avant
                </label>
                <select
                  value={config.bufferBefore}
                  onChange={(e) => setConfig({ ...config, bufferBefore: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                >
                  {[0, 5, 10, 15, 20, 30].map((min) => (
                    <option key={min} value={min}>
                      {min} min
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buffer après
                </label>
                <select
                  value={config.bufferAfter}
                  onChange={(e) => setConfig({ ...config, bufferAfter: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                >
                  {[0, 5, 10, 15, 20, 30].map((min) => (
                    <option key={min} value={min}>
                      {min} min
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Disponibilités */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">📅 DISPONIBILITÉS</h3>
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900"
                disabled
              >
                Importer depuis Google Calendar
              </button>
            </div>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const dayAvailability = config.availability[day.key] || [];
                const isUnavailable = dayAvailability.length === 0;

                return (
                  <div key={day.key} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{day.label}</span>
                      {isUnavailable ? (
                        <span className="text-sm text-gray-500">Indisponible</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addTimeSlot(day.key)}
                          className="text-sm text-black hover:underline"
                        >
                          + Ajouter un créneau
                        </button>
                      )}
                    </div>
                    {isUnavailable ? (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day.key)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        + Ajouter des créneaux
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {dayAvailability.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(day.key, index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addTimeSlot(day.key)}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          + Ajouter un créneau
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attribution des closers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">👥 ATTRIBUTION DES CLOSEURS</h3>
            <div className="border border-gray-200 rounded-md p-4 space-y-2 max-h-64 overflow-y-auto">
              {closers.map((closer) => {
                const isSelected = config.assignedClosers.includes(closer.id);
                const closingRate = closer.closerSettings?.closingRate || 0;
                const isTop = closingRate >= 75;

                return (
                  <label
                    key={closer.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCloser(closer.id)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <span className="text-sm text-gray-900">
                      {closer.firstName} {closer.lastName}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({closingRate}% taux closing{isTop ? ' - TOP' : ''})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Méthode d'attribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Méthode d'attribution :</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="attributionMethod"
                  value="ROUND_ROBIN"
                  checked={config.attributionMethod === 'ROUND_ROBIN'}
                  onChange={() => setConfig({ ...config, attributionMethod: 'ROUND_ROBIN' })}
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <span className="text-sm text-gray-900">Round Robin (équitable)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="attributionMethod"
                  value="AI_INTELLIGENT"
                  checked={config.attributionMethod === 'AI_INTELLIGENT'}
                  onChange={() => setConfig({ ...config, attributionMethod: 'AI_INTELLIGENT' })}
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <span className="text-sm text-gray-900">
                  IA Intelligente (recommandé) 🤖
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  └─ Analyse profil prospect + force closeur
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="attributionMethod"
                  value="MANUAL"
                  checked={config.attributionMethod === 'MANUAL'}
                  onChange={() => setConfig({ ...config, attributionMethod: 'MANUAL' })}
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <span className="text-sm text-gray-900">Manuelle</span>
              </label>
            </div>
          </div>

          {/* Confirmations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🔔 CONFIRMATIONS</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailConfirmationImmediate}
                  onChange={(e) =>
                    setConfig({ ...config, emailConfirmationImmediate: e.target.checked })
                  }
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-900">Email confirmation immédiate</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailReminder24h}
                  onChange={(e) => setConfig({ ...config, emailReminder24h: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-900">Email rappel 24h avant</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailReminder1h}
                  onChange={(e) => setConfig({ ...config, emailReminder1h: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-900">Email rappel 1h avant</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.smsReminder1h}
                  onChange={(e) => setConfig({ ...config, smsReminder1h: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-900">
                  SMS rappel 1h avant (+0.05€/SMS)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-black border-gray-300 rounded"
                />
                <span className="text-sm text-gray-500">WhatsApp confirmation (Phase 2)</span>
              </label>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

