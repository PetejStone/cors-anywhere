var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8080;

var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);
var cors_proxy = require('./lib/cors-anywhere');

// List of trusted origins
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://dns-backup-machine.netlify.app', // Your production site
];

cors_proxy.createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,
  requireHeader: ['origin', 'x-requested-with'],
  checkRateLimit: checkRateLimit,
  removeHeaders: [
    'cookie',
    'cookie2',
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: false,
  },
  onRequest: function(req, res) {
    // Ensure the Origin header is set dynamically
    if (allowedOrigins.includes(req.headers['origin'])) {
      console.log('Origin is allowed:', req.headers['origin']);
    } else {
      req.headers['origin'] = allowedOrigins[1]; // Default to your production site if Origin is not allowed
    }

    // Add 'X-Requested-With' header if missing
    if (!req.headers['x-requested-with']) {
      req.headers['x-requested-with'] = 'XMLHttpRequest';
    }

    console.log('Forwarding request with Origin:', req.headers['origin']);
  }
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
