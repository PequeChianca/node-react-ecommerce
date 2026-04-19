const proxy = require('http-proxy-middleware');

// In local dev (npm start on the host) this defaults to the api-gateway exposed port.
// In the dockerized dev container (docker.compose.dev.yml) API_GATEWAY_URL is set to
// http://api-gateway:80 so the CRA server can reach the gateway by container name.
const TARGET = process.env.API_GATEWAY_URL || 'http://127.0.0.1:5000';

module.exports = function (app) {
  // SSE endpoint — registered first so it takes priority
  app.use(
    '/api/notifications/stream',
    proxy({
      target: TARGET,
      changeOrigin: true,
      // Remove Accept-Encoding so the upstream never compresses the stream
      onProxyReq: (proxyReq) => {
        proxyReq.removeHeader('accept-encoding');
      },
      onProxyRes: (proxyRes) => {
        proxyRes.headers['x-accel-buffering'] = 'no';
        proxyRes.headers['cache-control'] = 'no-cache';
      },
    })
  );

  // All other /api/* routes — standard proxy
  app.use(
    '/api',
    proxy({
      target: TARGET,
      changeOrigin: true,
    })
  );
};
