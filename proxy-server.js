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
    const response = await axios.get(`https://networkcalc.com/api/dns/lookup/${encodedSubdomain}`);

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
