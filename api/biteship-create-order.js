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
    // Validate items - Biteship requires at least one item
    const finalItems = (items && Array.isArray(items) && items.length > 0) 
      ? items.map(item => ({
          name: item.name || 'Produk Youman',
          description: item.description || 'Kesehatan Maskulin',
          value: Number(item.price || item.value || 299000),
          weight: Number(item.weight || 1000),
          quantity: Number(item.quantity || 1)
        }))
      : [{
          name: 'Produk Youman',
          description: 'Kesehatan Maskulin',
          value: 299000,
          weight: 1000,
          quantity: 1
        }];

    console.log('Sending to Biteship:', {
      order_id,
      destination_area_id,
      items: finalItems
    });

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
        destination_contact_name: destination_name || 'Pelanggan Youman',
        destination_contact_phone: destination_phone || '08123456789',
        destination_address: destination_address || 'Alamat tidak lengkap (Hubungi Admin)',
        destination_area_id: destination_area_id,
        destination_postal_code: destination_postal_code || undefined,
        courier_company: courier_company || 'jne',
        courier_type: courier_type || 'reg',
        delivery_type: 'now',
        reference_id: order_id,
        items: finalItems
      })
    });

    const data = await response.json();
    console.log('Biteship API Response:', data);
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Biteship Create Order Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
}
