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
        origin_area_id,
        destination_area_id,
        couriers: 'jne,jnt,sicepat,tiki,anteraja,wahana',
        items: items || [{
          name: 'Produk Youman',
          description: 'Produk Kesehatan',
          value: 299000,
          weight: 1000,
          quantity: 1
        }]
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Biteship Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
