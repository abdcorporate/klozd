'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { schedulingApi, leadsApi, usersApi } from '@/lib/api';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.leadId as string;

  const [lead, setLead] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [closer, setCloser] = useState<any>(null);
  const [closerId, setCloserId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [closerInfo, setCloserInfo] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Utiliser l'endpoint public pour récupérer le lead
        const response = await leadsApi.getOnePublic(leadId);
        const leadData = response.data;
        setLead(leadData);
        setOrganization(leadData.organization);

        // Si le lead a déjà un closer assigné, l'utiliser
        if (leadData.assignedCloserId) {
          setCloserId(leadData.assignedCloserId);
        } else {
          // Sinon, essayer d'attribuer automatiquement un closer
          try {
            const assignResponse = await leadsApi.assignCloser(leadId);
            if (assignResponse.data.success && assignResponse.data.lead.assignedCloserId) {
              setCloserId(assignResponse.data.lead.assignedCloserId);
              // Recharger les données du lead pour avoir les infos complètes
              const updatedResponse = await leadsApi.getOnePublic(leadId);
              setLead(updatedResponse.data);
            } else {
              setCloserId(null);
            }
          } catch (assignError) {
            console.error('Error assigning closer:', assignError);
            setCloserId(null);
          }
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchData();
    }
  }, [leadId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!closerId) return;
      try {
        const response = await schedulingApi.getAvailability(closerId);
        setAvailableSlots(response.data.availableSlots || []);
        // L'API retourne aussi les infos du closer
        if (response.data.closer) {
          setCloserInfo(response.data.closer);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    if (closerId) {
      fetchAvailability();
    }
  }, [closerId]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
  };

  const getSlotsForDate = (date: Date): string[] => {
    if (!selectedDate || !isSameDay(date, selectedDate)) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableSlots.filter((slot) => {
      const slotDate = format(parseISO(slot), 'yyyy-MM-dd');
      return slotDate === dateStr;
    });
  };

  const groupSlotsByHour = (slots: string[]): string[] => {
    return slots.sort((a, b) => {
      const timeA = format(parseISO(a), 'HH:mm');
      const timeB = format(parseISO(b), 'HH:mm');
      return timeA.localeCompare(timeB);
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfMonth = monthStart.getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Lundi = 0

  const handleSubmit = async () => {
    if (!selectedSlot || !closerId) {
      alert('Veuillez sélectionner un créneau');
      return;
    }

    try {
      setSubmitting(true);
      await schedulingApi.createPublic({
        leadId,
        assignedCloserId: closerId,
        scheduledAt: selectedSlot,
        duration: 30,
      });

      // TODO: Envoyer message WhatsApp au closer
      // if (closer?.phone) {
      //   await sendWhatsAppConfirmation(closer.phone, lead, selectedSlot);
      // }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">Lead non trouvé</div>
      </div>
    );
  }

  if (!closerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Aucun closer disponible pour le moment</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
          <p className="text-gray-600 mb-4">
            Votre rendez-vous a été réservé pour le{' '}
            {selectedSlot && format(new Date(selectedSlot), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
          <p className="text-sm text-gray-500">
            Vous allez recevoir un email de confirmation avec tous les détails.
          </p>
        </div>
      </div>
    );
  }

  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : [];
  const groupedSlots = groupSlotsByHour(selectedDateSlots);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header avec logo */}
          <div className="text-center mb-8">
            {organization?.logoUrl && (
              <div className="mb-4 flex justify-center">
                <Image
                  src={organization.logoUrl}
                  alt={organization.name || 'Logo'}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Réservez votre appel stratégique
            </h1>
            <p className="text-lg text-gray-600">
              avec un expert {organization?.name || 'Lady Boss Booster'}
            </p>
          </div>

          {/* Informations du RDV */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <span>Durée :</span>
                <span className="font-semibold">30 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📹 Format :</span>
                <span className="font-semibold">Visioconférence</span>
              </div>
            </div>
          </div>

          {/* Calendrier */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sélectionnez une date :</h2>
            <div className="border border-gray-200 rounded-lg p-4">
              {/* Navigation du mois */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                >
                  →
                </button>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <div key={index} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1">
                {/* Jours vides avant le premier jour du mois */}
                {Array.from({ length: adjustedFirstDay }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square"></div>
                ))}

                {/* Jours du mois */}
                {monthDays.map((day) => {
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const hasSlots = availableSlots.some((slot) => {
                    const slotDate = format(parseISO(slot), 'yyyy-MM-dd');
                    return slotDate === format(day, 'yyyy-MM-dd');
                  });

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      disabled={!hasSlots}
                      className={`aspect-square rounded-md text-sm transition-colors ${
                        isSelected
                          ? 'bg-black text-white font-semibold'
                          : isToday
                          ? 'bg-blue-100 text-blue-900 font-semibold'
                          : hasSlots
                          ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Créneaux disponibles */}
          {selectedDate && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Créneaux disponibles ({format(selectedDate, "EEEE d MMMM", { locale: fr })}) :
              </h2>
              {groupedSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {groupedSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    const timeStr = format(parseISO(slot), 'HH:mm');
                    return (
                      <button
                        key={slot}
                        onClick={() => handleSlotClick(slot)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">Aucun créneau disponible pour cette date</p>
              )}
            </div>
          )}

          {/* Bouton de confirmation */}
          {selectedSlot && (
            <div className="mb-8">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Confirmation en cours...' : `Confirmer le RDV à ${format(parseISO(selectedSlot), 'HH:mm', { locale: fr })}`}
              </button>
            </div>
          )}

          {/* Informations de sécurité */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>🔒</span>
                <span>Vos données sont sécurisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Confirmation instantanée par email</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span>Rappels automatiques avant l'appel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
