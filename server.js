const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load Google credentials from environment variables (set in Render)
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

// Authenticate with Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to generate temporary link
app.get('/generate-link', async (req, res) => {
  try {
    const fileId = 'YOUR_FILE_ID_HERE'; // Replace with your Google Drive file ID
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    // Create a permission with expiration
    await drive.permissions.create({
      fileId,
      requestBody: {
        type: 'anyone',
        role: 'reader',
        expirationTime,
      },
    });

    // Get the shareable link
    const file = await drive.files.get({
      fileId,
      fields: 'webViewLink',
    });

    res.json({ link: file.data.webViewLink, expiresAt: expirationTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate link' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});