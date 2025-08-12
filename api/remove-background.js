// /api/remove-background.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        // Use the environment variable here
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      body: req.body, // Pass the form data from the frontend
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    // Send the resulting image blob back to the frontend
    const imageBlob = await response.blob();
    res.setHeader('Content-Type', 'image/png');
    // To send a blob, we need to convert it to a buffer first
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    res.send(buffer);

  } catch (error) {
    console.error('Error in remove-background function:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Vercel needs to know to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};