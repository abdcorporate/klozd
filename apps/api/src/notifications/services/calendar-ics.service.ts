import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarIcsService {
  /**
   * Génère un fichier .ics pour ajouter un rendez-vous au calendrier
   */
  generateIcsFile(
    summary: string,
    description: string,
    startDate: Date,
    duration: number,
    location?: string,
    organizerEmail?: string,
    attendeeEmail?: string,
  ): string {
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    
    // Formater les dates au format iCalendar (YYYYMMDDTHHmmssZ)
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KLOZD//Appointment//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).substring(7)}@klozd.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${this.escapeText(summary)}`,
      `DESCRIPTION:${this.escapeText(description)}`,
      ...(location ? [`LOCATION:${this.escapeText(location)}`] : []),
      ...(organizerEmail ? [`ORGANIZER;CN=KLOZD:mailto:${organizerEmail}`] : []),
      ...(attendeeEmail ? [`ATTENDEE;CN=${attendeeEmail};RSVP=TRUE:mailto:${attendeeEmail}`] : []),
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Rappel: Rendez-vous dans 15 minutes',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return icsContent;
  }

  /**
   * Échappe les caractères spéciaux pour iCalendar
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * Génère une URL data pour télécharger le fichier .ics
   */
  generateIcsDataUrl(icsContent: string): string {
    const base64 = Buffer.from(icsContent).toString('base64');
    return `data:text/calendar;charset=utf-8;base64,${base64}`;
  }
}
