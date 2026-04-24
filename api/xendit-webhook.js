import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase (Gunakan Service Role Key agar bisa update database tanpa terhalang RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Ambil token verifikasi dari header Xendit (Opsional tapi direkomendasikan untuk keamanan)
    const xenditCallbackToken = req.headers['x-callback-token'];
    const MY_XENDIT_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN;

    if (MY_XENDIT_TOKEN && xenditCallbackToken !== MY_XENDIT_TOKEN) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const body = req.body;
        console.log('Xendit Webhook Received:', body);

        const { external_id, status, amount } = body;

        // Xendit status untuk Invoice yang sukses adalah 'PAID' atau 'SETTLED'
        if (status === 'PAID' || status === 'SETTLED') {
            // Update status di Supabase
            const { data, error } = await supabase
                .from('transactions')
                .update({ 
                    status: 'Success',
                    updated_at: new Date().toISOString() 
                })
                .eq('id', external_id);

            if (error) {
                console.error('Database Update Error:', error);
                return res.status(500).json({ message: 'Database update failed', error });
            }

            console.log(`Transaction ${external_id} successfully marked as Success`);
            return res.status(200).json({ message: 'Success recorded' });
        }

        return res.status(200).json({ message: 'Payment status not PAID, no action taken' });
    } catch (err) {
        console.error('Webhook processing error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
