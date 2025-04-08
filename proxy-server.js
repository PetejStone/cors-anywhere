const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Use CORS middleware to allow cross-origin requests from your React app
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Route for handling DNS lookup requests
app.get('/proxy/dns', async (req, res) => {
  const { subdomain } = req.query; // Extract subdomain from query parameters

  if (!subdomain) {
    return res.status(400).json({ error: 'Missing subdomain parameter' });
  }

  try {
    // Proxy the request to the actual API
    const encodedSubdomain = encodeURIComponent(subdomain);
    
    // Send request to target API with correct headers
    const response = await axios.get(`https://networkcalc.com/api/dns/lookup/${encodedSubdomain}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Add a User-Agent to avoid restrictions
        'Accept': 'application/json',
        'Host': 'networkcalc.com',  // Explicitly set the correct Host header
      }
    });

    // Send the API response back to the client
    res.json(response.data);
  } catch (error) {
    // Handle any errors that occur during the request
    res.status(500).json({ error: 'Error fetching data from API', details: error.message });
  }
});

// Set up the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
