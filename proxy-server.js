const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// CORS middleware for cross-origin requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Proxy route for DNS lookup
app.get('/proxy/dns', async (req, res) => {
  const { subdomain } = req.query; // Extract subdomain from query parameters

  if (!subdomain) {
    return res.status(400).json({ error: 'Missing subdomain parameter' });
  }

  try {
    const encodedSubdomain = encodeURIComponent(subdomain);

    // Proxy the request to the target API
    const response = await axios.get(`http://networkcalc.com/api/dns/lookup/${encodedSubdomain}`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://dns-backup-machine.netlify.app/',  // Set a valid origin
        'X-Requested-With': 'XMLHttpRequest', // Standard for cross-origin AJAX requests
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Mimic a browser
        'Host': 'networkcalc.com'  // Correct the Host header
      }
    });

    // Return the API response data to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error during proxy request:', error);
    res.status(500).json({ error: 'Error fetching data from API', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
