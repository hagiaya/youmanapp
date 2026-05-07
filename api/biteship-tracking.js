export default async function handler(req, res) {
  const { waybill, courier } = req.query;
  const apiKey = process.env.VITE_BITESHIP_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Biteship API Key not configured' });
  }

  if (!waybill || !courier) {
    return res.status(400).json({ message: 'Waybill and courier are required' });
  }

  try {
    const response = await fetch(
      `https://api.biteship.com/v1/trackings/${waybill}/couriers/${courier}`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Biteship Tracking Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
