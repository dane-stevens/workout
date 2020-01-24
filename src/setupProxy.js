const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/.netlify/functions/',
    proxy({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '/.netlify/functions/': '',
      },
    })
  );
};