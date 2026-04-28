import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { waybill, courier } = req.query;

    if (!waybill || !courier) {
        return res.status(400).json({ error: 'Waybill and courier are required' });
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Supabase URL or Key not set in environment variables' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch Rajaongkir API Key from Supabase settings
        const { data: settingsData, error } = await supabase
            .from('settings')
            .select('value')
            .eq('id', 'payment_settings')
            .single();

        let apiKey = '';
        if (settingsData && settingsData.value && settingsData.value.rajaongkir_api_key) {
            apiKey = settingsData.value.rajaongkir_api_key;
        }

        if (!apiKey) {
             return res.status(500).json({ error: 'RajaOngkir API Key not configured in Admin settings' });
        }

        // Try PRO endpoint first
        let response = await fetch('https://pro.rajaongkir.com/api/waybill', {
            method: 'POST',
            headers: {
                'key': apiKey,
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ waybill, courier }).toString()
        });
        
        let data = await response.json();
        
        // If it fails because of invalid API type (code 400 with Invalid key/API message), try basic endpoint
        if(data?.rajaongkir?.status?.code >= 400) {
            const basicResponse = await fetch('https://api.rajaongkir.com/basic/waybill', {
                method: 'POST',
                headers: {
                    'key': apiKey,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ waybill, courier }).toString()
            });
            
            const basicData = await basicResponse.json();
            if (basicData?.rajaongkir?.status?.code !== 400 || basicData?.rajaongkir?.status?.description !== 'Invalid key. Require pro account.') {
                 data = basicData; // Use basic data if it succeeds or gives a different error
            }
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("RajaOngkir proxy error:", error);
        return res.status(500).json({ error: error.message });
    }
}
