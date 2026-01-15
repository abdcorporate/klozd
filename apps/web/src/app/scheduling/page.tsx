'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { schedulingApi, calendarConfigApi, usersApi } from '@/lib/api';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Appointment {
  id: string;
  lead: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    closingProbability?: number | null;
  };
  assignedCloser: {
    id: string;
    firstName: string;
    lastName: string;
  };
  scheduledAt: string;
  duration: number;
  status: string;
  visioUrl?: string;
  visioProvider?: string;
}

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

export default function AppointmentsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'config'>('appointments');
  
  // Configuration du calendrier
  const [config, setConfig] = useState<CalendarConfig | null>(null);
  const [closers, setClosers] = useState<Closer[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [showRoundRobinInfo, setShowRoundRobinInfo] = useState(false);
  const [previewMonth, setPreviewMonth] = useState(new Date());
  const [updatingCloser, setUpdatingCloser] = useState<string | null>(null);
  const [allClosers, setAllClosers] = useState<Closer[]>([]);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isManager = user?.role === 'MANAGER';
  const canChangeCloser = isAdmin || isManager;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Vérifier les rôles autorisés
    if (!user || !['ADMIN', 'CLOSER', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    fetchAppointments();
    
    // Charger la configuration si admin
    if (isAdmin) {
      fetchConfig();
    }
    
    // Charger tous les closers si admin ou manager
    if (canChangeCloser) {
      fetchAllClosers();
    }
  }, [user, isAuthenticated, router, isAdmin, canChangeCloser]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await schedulingApi.getAppointments({
        limit: 100, // Get more appointments for calendar view
        sortBy: 'scheduledAt',
        sortOrder: 'asc',
      });
      
      // Handle new paginated response format: { items, pageInfo }
      if (response.data.items && response.data.pageInfo) {
        setAppointments(response.data.items);
      } else {
        // Fallback for old format
        const appointmentsData = response?.data?.data || response?.data || [];
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    setConfigLoading(true);
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
      console.error('Error fetching config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchAllClosers = async () => {
    try {
      const response = await usersApi.getAll();
      // Handle new paginated response format: { items, pageInfo }
      const usersData = response.data.items || response.data || [];
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
      setAllClosers(activeClosers);
    } catch (error) {
      console.error('Error fetching closers:', error);
      setAllClosers([]);
    }
  };

  const handleCloserChange = async (appointmentId: string, closerId: string | null) => {
    setUpdatingCloser(appointmentId);
    try {
      await schedulingApi.update(appointmentId, { assignedCloserId: closerId });
      // Recharger les rendez-vous
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating closer:', error);
      alert('Erreur lors de la mise à jour du closer');
    } finally {
      setUpdatingCloser(null);
    }
  };

  const handleSaveConfig = async () => {
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SCHEDULED: 'Planifié',
      CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',
      NO_SHOW: 'Absent',
      CANCELLED: 'Annulé',
      RESCHEDULED: 'Reprogrammé',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      NO_SHOW: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-yellow-100 text-yellow-800',
      RESCHEDULED: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
            <p className="text-gray-600 mt-2">
              {activeTab === 'appointments' ? 'Gérez vos rendez-vous' : 'Paramétrez votre calendrier'}
            </p>
          </div>
        </div>

        {/* Onglets */}
        {isAdmin && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rendez-vous
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'config'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configuration
              </button>
            </nav>
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === 'appointments' ? (
          <>
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Aucun rendez-vous pour le moment</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Heure
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prospect
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Closer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prob. Closing
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durée
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {format(new Date(appointment.scheduledAt), 'd MMM yyyy', { locale: fr })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(appointment.scheduledAt), 'HH:mm', { locale: fr })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.lead.firstName} {appointment.lead.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{appointment.lead.email}</div>
                            {appointment.lead.phone && (
                              <div className="text-sm text-gray-500">{appointment.lead.phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {canChangeCloser ? (
                              <select
                                value={appointment.assignedCloser.id}
                                onChange={async (e) => {
                                  const closerId = e.target.value || null;
                                  await handleCloserChange(appointment.id, closerId);
                                }}
                                disabled={updatingCloser === appointment.id}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                  backgroundPosition: 'right 0.5rem center',
                                  backgroundSize: '1.5em 1.5em',
                                  backgroundRepeat: 'no-repeat',
                                  paddingRight: '2.5rem',
                                  minWidth: '150px'
                                }}
                              >
                                {allClosers.map((closer) => (
                                  <option key={closer.id} value={closer.id}>
                                    {closer.firstName} {closer.lastName}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-sm text-gray-900">
                                {appointment.assignedCloser.firstName} {appointment.assignedCloser.lastName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {appointment.lead.closingProbability !== null && appointment.lead.closingProbability !== undefined ? (
                              <span className="text-sm font-medium text-gray-900">{Math.round(appointment.lead.closingProbability)}%</span>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.duration} min</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                appointment.status,
                              )}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => router.push(`/leads/${appointment.lead.id}`)}
                                className="text-black hover:text-gray-700"
                              >
                                Voir le lead
                              </button>
                              {appointment.visioUrl && (
                                <a
                                  href={appointment.visioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Rejoindre
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {configLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Chargement de la configuration...</div>
              </div>
            ) : !config ? (
              <div className="text-red-600">Erreur lors du chargement de la configuration</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <h3 className="text-lg font-semibold text-gray-900">Durée :</h3>
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
                  <h3 className="text-lg font-semibold text-gray-900">Disponibilités :</h3>
                  <div className="space-y-3">
                    {DAYS.map((day) => {
                      const dayAvailability = config.availability[day.key] || [];
                      const isUnavailable = dayAvailability.length === 0;

                      return (
                        <div key={day.key} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{day.label}</span>
                            {isUnavailable && (
                              <span className="text-sm text-gray-500">Indisponible</span>
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

                {/* Méthode d'attribution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Méthode d'attribution :</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer relative">
                      <input
                        type="radio"
                        name="attributionMethod"
                        value="ROUND_ROBIN"
                        checked={config.attributionMethod === 'ROUND_ROBIN'}
                        onChange={() => setConfig({ ...config, attributionMethod: 'ROUND_ROBIN' })}
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                      />
                      <span className="text-sm text-gray-900">Round Robin (équitable)</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowRoundRobinInfo(!showRoundRobinInfo)}
                          className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          i
                        </button>
                        {showRoundRobinInfo && (
                          <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                            Répartit les leads de manière équitable entre tous les closers disponibles
                            <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
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
                        IA Intelligente (recommandé)
                      </span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowAiInfo(!showAiInfo)}
                          className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          i
                        </button>
                        {showAiInfo && (
                          <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                            Analyse le profil du prospect & attribut le closer automatiquement
                            <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
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
                  <h3 className="text-lg font-semibold text-gray-900">Notifications :</h3>
                  
                  {/* Timeline visuelle */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 overflow-visible">
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
                          <div className="text-gray-500 ml-6">├─ Bouton "Ajouter à mon calendrier"</div>
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
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="px-6 py-2.5 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
                  </button>
                </div>
                </div>

                {/* Aperçu du calendrier - Design réaliste */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
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
                        <div className="text-lg font-semibold text-gray-900">{config?.callDuration || 30} minutes</div>
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
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
