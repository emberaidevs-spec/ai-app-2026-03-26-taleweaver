export default async function handler(req, res) {
  try {
    const { method, body } = req;

    if (method === 'OPTIONS') {
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').send();
    }

    if (method !== 'POST') {
      return res.status(405).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Method not allowed' });
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Invalid request body' });
    }

    const { prompt, type, mood } = body;

    if (!prompt || !type || !mood) {
      return res.status(400).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Missing required parameters' });
    }

    const systemPrompt = `You are a creative writer. Generate a ${type} based on the prompt: ${prompt}. The tone of the ${type} should be ${mood}.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Internal server error' });
  }
}