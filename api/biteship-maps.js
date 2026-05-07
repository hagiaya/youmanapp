export default async function handler(req, res) {
  // --- CORS HEADERS ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for dev simplicity
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { input } = req.query;
  const apiKey = process.env.VITE_BITESHIP_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Biteship API Key not configured' });
  }

  if (!input || input.length < 3) {
    return res.status(400).json({ message: 'Input must be at least 3 characters' });
  }

  try {
    const response = await fetch(
      `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(input)}&type=single`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Biteship Maps Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
