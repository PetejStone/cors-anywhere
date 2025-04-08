// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

var cors_proxy = require('./lib/cors-anywhere');

// Create CORS Anywhere server with headers handling
cors_proxy.createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,
  requireHeader: ['origin', 'x-requested-with'],
  checkRateLimit: checkRateLimit,
  removeHeaders: [
    'cookie',
    'cookie2',
    // Strip Heroku-specific headers
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
    // Other Heroku added debug headers
    // 'x-forwarded-for',
    // 'x-forwarded-proto',
    // 'x-forwarded-port',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
    xfwd: false,
  },
  // Modify this function to inject the correct Origin header based on the environment
  onRequest: function(req, res) {
    // Check if the request is coming from localhost
    if (req.headers['origin'] === 'http://localhost:3000') {
      // Allow localhost for testing
      req.headers['origin'] = 'http://localhost:3000'; // Allow requests from localhost
    } else if (!req.headers['origin']) {
      // Set the Origin header dynamically for other requests if it's missing
      req.headers['origin'] = 'https://dns-backup-machine.netlify.app/'; // Default origin
    }

    // Add 'X-Requested-With' header (important for some CORS APIs)
    if (!req.headers['x-requested-with']) {
      req.headers['x-requested-with'] = 'XMLHttpRequest';
    }

    // Now that headers are correctly set, continue with the request
    console.log('Forwarding request with Origin:', req.headers['origin']);
  }
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
