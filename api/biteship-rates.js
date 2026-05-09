export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { origin_area_id, destination_area_id, items } = req.body;
  const apiKey = process.env.VITE_BITESHIP_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Biteship API Key not configured' });
  }

  try {
    const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin_area_id: origin_area_id || 'IDNP3CL10DT42',
        destination_area_id,
        couriers: 'jne,jnt,sicepat,tiki,anteraja,wahana,lion,ninja,grab,gojek',
        items: items || [{
          name: 'Produk Youman',
          description: 'Produk Kesehatan',
          value: 100000,
          weight: 500,
          quantity: 1
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        return res.status(response.status).json({
            message: data.message || 'Gagal mendapatkan ongkir dari Biteship',
            errors: data.errors
        });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Biteship Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
