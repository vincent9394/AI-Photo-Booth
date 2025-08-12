// /api/generate-background.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.GOOGLE_AI_API_KEY; // Use the environment variable
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

        const payload = {
            instances: [{ prompt: prompt }],
            parameters: { "sampleCount": 1 }
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const error = await apiResponse.json();
            console.error('API Error Response:', error);
            return res.status(apiResponse.status).json({ error: error.error?.message || 'Failed to get a valid response from the AI service.' });
        }

        const result = await apiResponse.json();
        res.status(200).json(result);

    } catch (error) {
        console.error('Error in generate-background function:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}