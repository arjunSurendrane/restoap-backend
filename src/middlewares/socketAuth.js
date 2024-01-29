const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { userService } = require('../services');

const authenticatication = async (socket, next) => {
  try {
    const { token } = socket.handshake.auth; // Extract token from query parameter
    const decode = jwt.verify(token, config.jwt.secret);
    const user = await userService.getUserById(decode.sub);
    if (!user) throw new Error();
    socket.user = user;
    next();
  } catch (error) {
    socket.on('error', (err) => {
      if (err && err.message === 'unauthorized event') {
        socket.disconnect();
      }
    });
  }

  // Authenticate the user using the extracted token
};

module.exports = authenticatication;
