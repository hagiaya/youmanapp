export default async function handler(req, res) {
  // --- CORS HEADERS ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_BITESHIP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Biteship API Key not configured' });
  }

  const {
    origin_area_id,
    destination_area_id,
    destination_name,
    destination_phone,
    destination_address,
    courier_company,
    courier_type,
    items,
    order_id
  } = req.body;

  try {
    const response = await fetch('https://api.biteship.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipper_contact_name: 'Youman App',
        shipper_contact_phone: '08123456789',
        origin_contact_name: 'Youman App',
        origin_contact_phone: '08123456789',
        origin_address: 'Jakarta Pusat, DKI Jakarta', // Default origin
        origin_area_id: origin_area_id || 'IDNP3CL10DT42', // Default Jakarta Pusat
        destination_contact_name: destination_name,
        destination_contact_phone: destination_phone,
        destination_address: destination_address,
        destination_area_id: destination_area_id,
        courier_company: courier_company || 'jne',
        courier_type: courier_type || 'reg',
        delivery_type: 'now',
        reference_id: order_id,
        items: items || [{
          name: 'Produk Youman',
          description: 'Kesehatan Maskulin',
          value: 299000,
          weight: 1000,
          quantity: 1
        }]
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Biteship Create Order Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
