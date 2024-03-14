const config = require('config');
const allowedOrigins = config.get('allowed_origins')

module.exports = allowedOrigins;