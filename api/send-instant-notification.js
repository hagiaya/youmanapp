export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, title, body } = req.body;
  const oneSignalAppId = process.env.VITE_ONESIGNAL_APP_ID;
  const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!oneSignalAppId || !oneSignalApiKey) {
    return res.status(500).json({ message: 'OneSignal credentials not configured' });
  }

  if (!userId || !title || !body) {
    return res.status(400).json({ message: 'userId, title, and body are required' });
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalApiKey}`
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        contents: {
          en: body,
          id: body
        },
        headings: {
          en: title,
          id: title
        },
        include_external_user_ids: [userId]
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('OneSignal Send Notification Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
