'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { calendarConfigApi, usersApi } from '@/lib/api';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [previewMonth, setPreviewMonth] = useState(new Date());

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

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6 overflow-visible">
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

          {/* SÉQUENCE AUTOMATIQUE DE CONFIRMATION */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🔔 SÉQUENCE AUTOMATIQUE DE CONFIRMATION</h3>
            
            {/* Timeline visuelle */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 overflow-visible">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">TIMELINE DES NOTIFICATIONS</h4>
              
              <div className="space-y-4 overflow-visible">
                {/* T+0 */}
                <div className="border-l-2 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">T+0 (Immédiat après réservation)</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 ml-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>📧</span>
                      <span className="flex-1 min-w-0">Email : "RDV confirmé le [date] à [heure]"</span>
                      <label className="flex items-center gap-1 ml-auto whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={config.emailConfirmationImmediate}
                          onChange={(e) =>
                            setConfig({ ...config, emailConfirmationImmediate: e.target.checked })
                          }
                          className="w-3 h-3 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-xs">Actif</span>
                      </label>
                    </div>
                    <div className="text-gray-500 ml-6">├─ Bouton "Ajouter à mon calendrier" (.ics)</div>
                    <div className="text-gray-500 ml-6">├─ Lien visio (si appel dans &lt;48h)</div>
                    <div className="text-gray-500 ml-6">└─ Contact closeuse (email/tel)</div>
                  </div>
                </div>

                {/* T+10min */}
                <div className="border-l-2 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">T+10min</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 ml-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">💬</span>
                      <div className="flex-1">
                        <span className="block">WhatsApp : "Bonjour [Prénom], c'est [Closeuse]. J'ai hâte de vous parler le [date] 🎯"</span>
                      </div>
                      <span className="ml-auto text-gray-400 text-xs whitespace-nowrap">Automatique</span>
                    </div>
                  </div>
                </div>

                {/* J-1 */}
                <div className="border-l-2 border-orange-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">J-1 (24h avant)</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 ml-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>📧</span>
                      <span className="flex-1 min-w-0">Email : "Rappel : RDV demain à [heure]"</span>
                      <label className="flex items-center gap-1 ml-auto whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={config.emailReminder24h}
                          onChange={(e) => setConfig({ ...config, emailReminder24h: e.target.checked })}
                          className="w-3 h-3 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-xs">Actif</span>
                      </label>
                    </div>
                    <div className="text-gray-500 ml-6">├─ Bouton "Confirmer ma présence"</div>
                    <div className="text-gray-500 ml-6">├─ Bouton "Reprogrammer"</div>
                    <div className="text-gray-500 ml-6">└─ Lien visio (généré)</div>
                  </div>
                </div>

                {/* H-1 */}
                <div className="border-l-2 border-purple-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">H-1 (1h avant)</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 ml-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>📧</span>
                      <span className="flex-1 min-w-0">Email : "Votre appel commence dans 1h"</span>
                      <label className="flex items-center gap-1 ml-auto whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={config.emailReminder1h}
                          onChange={(e) => setConfig({ ...config, emailReminder1h: e.target.checked })}
                          className="w-3 h-3 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-xs">Actif</span>
                      </label>
                    </div>
                    <div className="text-gray-500 ml-6">└─ Gros bouton "REJOINDRE L'APPEL" 🎥</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>📱</span>
                      <span className="flex-1 min-w-0">SMS : "RDV dans 1h - Lien..."</span>
                      <label className="flex items-center gap-1 ml-auto whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={config.smsReminder1h}
                          onChange={(e) => setConfig({ ...config, smsReminder1h: e.target.checked })}
                          className="w-3 h-3 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-xs">Actif (+0.05€/SMS)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* T-0 */}
                <div className="border-l-2 border-red-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">T-0 (À l'heure du RDV)</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 ml-4">
                    <div className="flex items-center gap-2">
                      <span>🔔</span>
                      <span className="flex-1">Notification closeuse : "RDV commence!"</span>
                      <span className="ml-auto text-gray-400 text-xs whitespace-nowrap">Automatique</span>
                    </div>
                  </div>
                </div>

                {/* T+15min */}
                <div className="border-l-2 border-gray-400 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">T+15min (Si prospect pas connecté)</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 ml-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">📞</span>
                      <div className="flex-1">
                        <span className="block">Appel auto closeuse : "Le prospect n'est pas venu, marquer comme NO-SHOW ?"</span>
                      </div>
                      <span className="ml-auto text-gray-400 text-xs whitespace-nowrap">Automatique</span>
                    </div>
                  </div>
                </div>
              </div>
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

        {/* Aperçu du calendrier - Design réaliste */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Aperçu du calendrier</h3>
          
          {/* Formulaire de réservation réaliste */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Réservez votre appel stratégique
            </h2>
            <p className="text-center text-gray-600 mb-6">
              avec un expert {user?.organizationName || 'KLOZD'}
            </p>

            {/* Durée et Format */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Durée :</div>
                <div className="text-lg font-semibold text-gray-900">{config.callDuration} minutes</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">📹 Format :</div>
                <div className="text-lg font-semibold text-gray-900">Visioconférence</div>
              </div>
            </div>

            {/* Calendrier */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-3">Sélectionnez une date :</div>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setPreviewMonth(subMonths(previewMonth, 1))}
                    className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  >
                    ←
                  </button>
                  <h4 className="text-base font-semibold text-gray-900">
                    {format(previewMonth, 'MMMM yyyy', { locale: fr }).charAt(0).toUpperCase() + format(previewMonth, 'MMMM yyyy', { locale: fr }).slice(1)}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setPreviewMonth(addMonths(previewMonth, 1))}
                    className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  >
                    →
                  </button>
                </div>
                
                {/* En-têtes des jours */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div key={index} className="text-center text-xs font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Jours du calendrier */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const monthStart = startOfMonth(previewMonth);
                    const monthEnd = endOfMonth(previewMonth);
                    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
                    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
                    
                    return calendarDays.map((day, index) => {
                      const dayOfWeek = day.getDay() === 0 ? 6 : day.getDay() - 1; // Convert to Monday = 0
                      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                      const currentDayKey = dayKeys[dayOfWeek];
                      const hasAvailability = config && config.availability[currentDayKey] && config.availability[currentDayKey].length > 0;
                      const isCurrentMonth = isSameMonth(day, previewMonth);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={!isCurrentMonth || !hasAvailability}
                          className={`aspect-square rounded text-sm flex items-center justify-center transition-colors ${
                            !isCurrentMonth
                              ? 'text-gray-200 cursor-default'
                              : hasAvailability
                                ? isToday
                                  ? 'bg-orange-500 text-white font-semibold ring-2 ring-orange-500 ring-offset-2 cursor-pointer hover:bg-orange-600'
                                  : 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 font-medium'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Badges de sécurité et avantages */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-base">🔒</span>
                <span>Vos données sont sécurisées</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-base">✅</span>
                <span>Confirmation instantanée par email</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-base">📧</span>
                <span>Rappels automatiques avant l'appel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

