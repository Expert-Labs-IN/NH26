import { google } from 'googleapis';

/**
 * Creates a Google Calendar event from a triage payload.
 * @param {object} oauth2Client - Authenticated Google OAuth2 client.
 * @param {object} payload - Calendar payload from AI triage.
 * @param {string} payload.title
 * @param {string} payload.date - "YYYY-MM-DD"
 * @param {string} payload.time - "HH:MM"
 * @param {string} [payload.endTime] - "HH:MM" (defaults to 1 hour after start)
 * @param {string[]} [payload.attendees] - Array of email strings
 * @param {string} [payload.location]
 * @param {string} [payload.description]
 * @returns {object} The created Google Calendar event resource.
 */
export async function createCalendarEvent(oauth2Client, payload) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startDateTime = `${payload.date}T${payload.time || '09:00'}:00`;

  // Default end time: 1 hour after start
  let endTime = payload.endTime;
  if (!endTime) {
    const [h, m] = (payload.time || '09:00').split(':').map(Number);
    const endHour = String(h + 1).padStart(2, '0');
    endTime = `${endHour}:${String(m).padStart(2, '0')}`;
  }
  const endDateTime = `${payload.date}T${endTime}:00`;

  const attendees = (payload.attendees || []).map(email => ({ email }));

  const event = {
    summary: payload.title || 'Meeting (via NexMail)',
    location: payload.location || '',
    description: payload.description || 'Automatically scheduled by NexMail AI.',
    start: {
      dateTime: startDateTime,
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Asia/Kolkata',
    },
    attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 60 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    sendUpdates: attendees.length > 0 ? 'all' : 'none',
  });

  return response.data;
}

/**
 * Fetches upcoming events from the user's primary Google Calendar.
 * @param {object} oauth2Client - Authenticated Google OAuth2 client.
 * @param {number} [maxResults=10] - Number of events to return.
 * @returns {object[]} Array of calendar event resources.
 */
export async function listUpcomingEvents(oauth2Client, maxResults = 10) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}
