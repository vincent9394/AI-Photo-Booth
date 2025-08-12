// /api/remove-background.js

// We need to use a library to handle the multipart/form-data from the browser
import { formidable } from 'formidable';
import fs from 'fs';

// This tells Vercel to not use its default body parser, as we are handling it ourselves
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Use formidable to parse the incoming form data
  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);
    
    // The uploaded file will be in the 'files' object
    const imageFile = files.image_file?.[0];

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    // Create a new FormData to send to the remove.bg API
    const apiFormData = new FormData();
    // We need to read the file from its temporary path and append it as a Blob
    const fileContent = fs.readFileSync(imageFile.filepath);
    apiFormData.append('image_file', new Blob([fileContent]), imageFile.originalFilename);
    apiFormData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('remove.bg API Error:', errorData);
      return res.status(response.status).json(errorData);
    }

    // Send the resulting image blob back to the frontend
    const imageBlob = await response.blob();
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);

  } catch (error) {
    console.error('Error in remove-background function:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
/*

### **Why This Fixes the Problem**

1.  **Parsing Form Data:** A browser sending a file uses a format called `multipart/form-data`. The original serverless function wasn't equipped to understand this format. The new code adds the `formidable` library, a standard tool for parsing file uploads in Node.js, to correctly handle the file you send.
2.  **Reconstructing the Request:** The function now correctly takes the uploaded file, reads it from its temporary location on Vercel's server, and then properly reconstructs a *new* `FormData` object to forward to the `remove.bg` API.

After you replace the code in `/api/remove-background.js` and push the change to GitHub, Vercel will automatically redeploy your site, and the background removal should now work correct
   */