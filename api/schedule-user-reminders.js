import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, phone, whatsapp_reminder_enabled, push_reminder_enabled')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      throw new Error(userError?.message || 'User not found');
    }

    if (!user.whatsapp_reminder_enabled && !user.push_reminder_enabled) {
      return res.status(200).json({ message: 'No reminders enabled for this user.' });
    }

    // 2. Fetch user's rituals
    const { data: rituals, error: ritualsError } = await supabase
      .from('user_rituals')
      .select('*')
      .eq('user_id', user.id);

    if (ritualsError || !rituals || rituals.length === 0) {
      return res.status(200).json({ message: 'No rituals set for this user.' });
    }

    // Get only current date's rituals or the active set
    const latestRitual = rituals.reduce((latest, current) => {
        return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
    }, rituals[0]);

    const latestDate = latestRitual.date;
    const activeRituals = rituals.filter(r => r.date === latestDate);

    const reports = {
      whatsapp_scheduled: [],
      push_scheduled: [],
      errors: []
    };

    // 3. Schedule each active ritual
    for (const ritual of activeRituals) {
      if (!ritual.time || ritual.completed) continue;

      // Parse hours and minutes
      const [hours, minutes] = ritual.time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;

      // Scheduled execution time in WIB (UTC+7)
      const scheduledDate = new Date();
      scheduledDate.setUTCHours(hours - 7, minutes, 0, 0);

      // If scheduled time has already passed today, don't schedule it for today
      if (scheduledDate <= new Date()) {
          continue; // Only schedule future rituals for today
      }

      // A. WhatsApp Fonnte
      if (user.whatsapp_reminder_enabled && user.phone) {
        try {
          let formattedPhone = user.phone.replace(/[^0-9]/g, '');
          if (formattedPhone.startsWith('0')) {
              formattedPhone = '62' + formattedPhone.slice(1);
          }

          const fonnteSchedule = Math.floor(scheduledDate.getTime() / 1000);
          const token = 'x8RfS97xn1sUzdVk5mmP';
          const message = `Halo *${user.name}*, ini pengingat ritual harian Anda:\n\n*${ritual.title.toUpperCase()}*\n⏰ Jam: ${ritual.time} WIB\n\n_${ritual.subtitle || 'Laksanakan protokol kedisiplinan Anda sekarang!'}_`;

          const fonnteRes = await fetch('https://api.fonnte.com/send', {
              method: 'POST',
              headers: { 'Authorization': token },
              body: new URLSearchParams({
                  'target': formattedPhone,
                  'message': message,
                  'schedule': fonnteSchedule.toString(),
                  'countryCode': '62'
              })
          });

          const fonnteData = await fonnteRes.json();
          if (fonnteData.status) {
              reports.whatsapp_scheduled.push({ ritual: ritual.title, time: ritual.time });
          } else {
              throw new Error(fonnteData.reason || 'Fonnte failed');
          }
        } catch (err) {
            reports.errors.push(`WhatsApp Error (${ritual.title}): ${err.message}`);
        }
      }

      // B. OneSignal Push
      if (user.push_reminder_enabled && process.env.ONESIGNAL_REST_API_KEY && process.env.VITE_ONESIGNAL_APP_ID) {
        try {
          const oneSignalRes = await fetch('https://onesignal.com/api/v1/notifications', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
              },
              body: JSON.stringify({
                  app_id: process.env.VITE_ONESIGNAL_APP_ID,
                  contents: {
                      id: `Saatnya ${ritual.title} (${ritual.time})! ${ritual.subtitle || ''}`,
                      en: `Time for ${ritual.title} (${ritual.time})!`
                  },
                  headings: {
                      id: `Pengingat YOUMAN: ${ritual.title}`,
                      en: `YOUMAN: ${ritual.title}`
                  },
                  include_external_user_ids: [user.id],
                  send_after: scheduledDate.toISOString()
              })
          });

          const oneSignalData = await oneSignalRes.json();
          if (oneSignalData.id) {
              reports.push_scheduled.push({ ritual: ritual.title, time: ritual.time });
          } else {
              throw new Error(JSON.stringify(oneSignalData.errors) || 'OneSignal failed');
          }
        } catch (err) {
            reports.errors.push(`OneSignal Error (${ritual.title}): ${err.message}`);
        }
      }
    }

    return res.status(200).json({ message: 'User reminders scheduled successfully.', reports });
  } catch (error) {
    console.error('Schedule reminders error:', error);
    return res.status(500).json({ error: error.message });
  }
}
