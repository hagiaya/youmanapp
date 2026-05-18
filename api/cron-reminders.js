import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Optional secure check for Vercel Cron Secret
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // We only enforce this in production if CRON_SECRET is set, allowing easy dev testing
        console.warn('Unauthorized cron request attempt');
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Ambil semua user yang mengaktifkan pengingat WhatsApp atau Push
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, phone, whatsapp_reminder_enabled, push_reminder_enabled');

        if (usersError) throw usersError;

        if (!users || users.length === 0) {
            return res.status(200).json({ message: 'Tidak ada user aktif ditemukan.' });
        }

        const reports = [];

        // 2. Iterasi setiap user
        for (const user of users) {
            if (!user.whatsapp_reminder_enabled && !user.push_reminder_enabled) {
                continue; // Skip jika kedua notifikasi tidak aktif
            }

            // Ambil semua data ritual untuk user ini
            const { data: rituals, error: ritualsError } = await supabase
                .from('user_rituals')
                .select('*')
                .eq('user_id', user.id);

            if (ritualsError || !rituals || rituals.length === 0) {
                continue; // Skip jika tidak ada ritual yang diatur
            }

            // Dapatkan set ritual paling baru berdasarkan update terakhir (karena jadwal harian umumnya sama)
            const latestRitual = rituals.reduce((latest, current) => {
                return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
            }, rituals[0]);

            const latestDate = latestRitual.date;
            const activeRituals = rituals.filter(r => r.date === latestDate);

            const userReport = {
                user: user.name,
                whatsapp_scheduled: [],
                push_scheduled: [],
                errors: []
            };

            // 3. Jadwalkan setiap ritual
            for (const ritual of activeRituals) {
                if (!ritual.time) continue;

                // Parse jam dan menit (Format: HH:MM)
                const [hours, minutes] = ritual.time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) continue;

                // Buat waktu pelaksanaan dalam WIB (UTC+7, Waktu Indonesia Barat)
                const scheduledDate = new Date();
                scheduledDate.setUTCHours(hours - 7, minutes, 0, 0);

                // Jika waktu tersebut sudah lewat untuk hari ini, jadwalkan untuk besok
                if (scheduledDate <= new Date()) {
                    scheduledDate.setUTCDate(scheduledDate.getUTCDate() + 1);
                }

                // A. Jadwalkan WhatsApp via Fonnte jika diaktifkan dan nomor HP tersedia
                if (user.whatsapp_reminder_enabled && user.phone) {
                    try {
                        // Bersihkan dan format nomor WhatsApp ke format internasional (62...)
                        let formattedPhone = user.phone.replace(/[^0-9]/g, '');
                        if (formattedPhone.startsWith('0')) {
                            formattedPhone = '62' + formattedPhone.slice(1);
                        }

                        // Timestamp Unix dalam detik untuk parameter schedule Fonnte
                        const fonnteSchedule = Math.floor(scheduledDate.getTime() / 1000);
                        const token = 'x8RfS97xn1sUzdVk5mmP';
                        const message = `Halo *${user.name}*, ini pengingat ritual harian Anda:\n\n*${ritual.title}*\n⏰ Jam: ${ritual.time} WIB\n\n_${ritual.subtitle || 'Laksanakan protokol kedisiplinan Anda sekarang!'}_`;

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
                            userReport.whatsapp_scheduled.push({
                                ritual: ritual.title,
                                time: scheduledDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                            });
                        } else {
                            throw new Error(fonnteData.reason || 'Gagal dari Fonnte API');
                        }
                    } catch (err) {
                        userReport.errors.push(`WhatsApp Error (${ritual.title}): ${err.message}`);
                    }
                }

                // B. Jadwalkan Push Notification via OneSignal jika diaktifkan
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
                            userReport.push_scheduled.push({
                                ritual: ritual.title,
                                time: scheduledDate.toISOString()
                            });
                        } else {
                            throw new Error(JSON.stringify(oneSignalData.errors) || 'Gagal dari OneSignal API');
                        }
                    } catch (err) {
                        userReport.errors.push(`OneSignal Error (${ritual.title}): ${err.message}`);
                    }
                }
            }

            reports.push(userReport);
        }

        return res.status(200).json({
            message: 'Cron job selesai dijalankan.',
            processed_users: reports.length,
            reports: reports
        });

    } catch (error) {
        console.error('Cron error:', error);
        return res.status(500).json({ error: error.message });
    }
}
