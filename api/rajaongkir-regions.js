import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: settingsData } = await supabase.from('settings').select('value').eq('id', 'payment_settings').single();
        let apiKey = settingsData?.value?.rajaongkir_api_key || '';
        
        if (!apiKey) {
            return res.status(500).json({ error: 'RajaOngkir API Key not configured in Admin settings' });
        }

        // Rajaongkir Basic/Pro/Starter URL
        // Pro: pro.rajaongkir.com/api
        // Basic: api.rajaongkir.com/basic
        // Let's proxy through api.rajaongkir.com/starter as fallback if not Pro
        const fetchRajaOngkir = async (baseUrl) => {
            const url = req.query.province ? `${baseUrl}/city?province=${req.query.province}` : `${baseUrl}/province`;
            return await fetch(url, {
                headers: { 'key': apiKey }
            });
        };

        let response = await fetchRajaOngkir('https://pro.rajaongkir.com/api');
        let data = await response.json();
        
        if (data?.rajaongkir?.status?.code >= 400) {
            let basicResp = await fetchRajaOngkir('https://api.rajaongkir.com/basic');
            data = await basicResp.json();
            if (data?.rajaongkir?.status?.code >= 400) {
                 let starterResp = await fetchRajaOngkir('https://api.rajaongkir.com/starter');
                 data = await starterResp.json();
            }
        }
        
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
