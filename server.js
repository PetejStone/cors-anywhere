var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8080;

var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) return [];
  return env.split(',');
}

var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);
var cors_proxy = require('./lib/cors-anywhere');

// List of trusted origins
const allowedOrigins = [
  'http://localhost:3000',  // Allow localhost
  'https://dns-backup-machine.netlify.app',  // Allow your prod site
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
  httpProxyOptions: { xfwd: false },
  onRequest: function(req, res) {
    if (allowedOrigins.includes(req.headers['origin'])) {
      console.log('Allowed Origin:', req.headers['origin']);
    } else {
      req.headers['origin'] = allowedOrigins[1];  // Default to your production site if Origin is not allowed
      console.log('Defaulting Origin to:', req.headers['origin']);
    }

    if (!req.headers['x-requested-with']) {
      req.headers['x-requested-with'] = 'XMLHttpRequest';
      console.log('Added X-Requested-With header');
    }

    console.log('Forwarding request with Origin:', req.headers['origin']);
  }
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
