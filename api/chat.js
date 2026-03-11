// api/chat.js — DSF Studio backend proxy
// API key stays here, never sent to the browser

const VALID_USER_IDS = [
    'DATASCAN-001',
    'DATASCAN-002',
    'DATASCAN-003',
    'JOHN-001',
    // Add more IDs here as you issue them to clients
    // Format: 'DATASCAN-XXX' or any string you choose
  ];

export default async function handler(req, res) {
    // CORS — allow requests from any origin (tighten this to your domain in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID');

  if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate UserID
  const userId = req.headers['x-user-id'];
    if (!userId || !VALID_USER_IDS.includes(userId)) {
          return res.status(401).json({ error: 'Invalid or missing User ID. Contact your administrator.' });
    }

  // Forward request to Anthropic
  const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server configuration error.' });

  try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                          'Content-Type': 'application/json',
                          'anthropic-version': '2023-06-01',
                          'x-api-key': apiKey,
                },
                body: JSON.stringify(req.body),
        });

      const data = await anthropicRes.json();
        return res.status(anthropicRes.status).json(data);
  } catch (err) {
        return res.status(500).json({ error: 'Upstream API error: ' + err.message });
  }
}
