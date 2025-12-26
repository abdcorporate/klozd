'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { schedulingApi } from '@/lib/api';

interface CalendarProps {
  closerId: string;
  leadId: string;
  onSlotSelect: (slot: string) => void;
  selectedSlot?: string;
}

export function Calendar({ closerId, leadId, onSlotSelect, selectedSlot }: CalendarProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await schedulingApi.getAvailability(closerId);
        setAvailableSlots(response.data.availableSlots || []);
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    if (closerId) {
      fetchAvailability();
    }
  }, [closerId]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  const getSlotsForDate = (date: Date): string[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableSlots.filter((slot) => {
      const slotDate = format(parseISO(slot), 'yyyy-MM-dd');
      return slotDate === dateStr;
    });
  };

  const groupSlotsByHour = (slots: string[]): Record<string, string[]> => {
    return slots.reduce((acc, slot) => {
      const hour = format(parseISO(slot), 'HH:mm');
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(slot);
      return acc;
    }, {} as Record<string, string[]>);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSlotClick = (slot: string) => {
    onSlotSelect(slot);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Chargement des disponibilités...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation semaine */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ← Semaine précédente
        </button>
        <div className="text-lg font-semibold text-gray-900">
          {format(weekStart, 'd MMMM', { locale: fr })} - {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
        </div>
        <button
          onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Semaine suivante →
        </button>
      </div>

      {/* Grille de la semaine */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const daySlots = getSlotsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`border rounded-lg p-4 ${
                isSelected ? 'border-black bg-gray-50' : 'border-gray-200'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div
                className={`text-center mb-3 cursor-pointer ${
                  isSelected ? 'font-bold text-black' : 'text-gray-700'
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="text-xs text-gray-500 uppercase">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className={`text-lg ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>

              {isSelected && daySlots.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Créneaux disponibles ({daySlots.length})
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {Object.entries(groupSlotsByHour(daySlots)).map(([hour, slots]) => (
                      <div key={hour} className="space-y-1">
                        <div className="text-xs text-gray-500 font-medium">{hour}</div>
                        {slots.map((slot) => {
                          const isSlotSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => handleSlotClick(slot)}
                              className={`w-full text-xs px-2 py-1 rounded text-left transition-colors ${
                                isSlotSelected
                                  ? 'bg-white text-gray-900'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {format(parseISO(slot), 'HH:mm')}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSelected && daySlots.length === 0 && (
                <div className="text-xs text-gray-600 text-center mt-4">
                  Aucun créneau disponible
                </div>
              )}

              {!isSelected && daySlots.length > 0 && (
                <div className="text-xs text-gray-500 text-center mt-2">
                  {daySlots.length} créneau{daySlots.length > 1 ? 'x' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && getSlotsForDate(selectedDate).length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Aucun créneau disponible pour cette date. Choisissez une autre date.
        </div>
      )}
    </div>
  );
}




