import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { origin, destination, weight, courier } = req.body;

    if (!origin || !destination || !weight || !courier) {
        return res.status(400).json({ error: 'Origin, destination, weight, and courier are required' });
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

        const fetchRajaOngkirCost = async (baseUrl) => {
            return await fetch(`${baseUrl}/cost`, {
                method: 'POST',
                headers: { 
                    'key': apiKey,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ origin, destination, weight, courier }).toString()
            });
        };

        let response = await fetchRajaOngkirCost('https://pro.rajaongkir.com/api');
        let data = await response.json();
        
        if (data?.rajaongkir?.status?.code >= 400) {
            let basicResp = await fetchRajaOngkirCost('https://api.rajaongkir.com/basic');
            data = await basicResp.json();
            if (data?.rajaongkir?.status?.code >= 400) {
                 let starterResp = await fetchRajaOngkirCost('https://api.rajaongkir.com/starter');
                 data = await starterResp.json();
            }
        }
        
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
