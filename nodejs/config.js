// Connection settings shared by every example.
//
// Inside Docker (docker compose up) the environment variables below are set in
// docker-compose.yml, so the examples talk to the "db" and "mongo" containers.
// Running locally with your own Node install (node week04/...), nothing is set,
// so the defaults point at the ports Docker publishes on your machine.

module.exports = {
  // Port for the example you are running. server.js (the landing page) owns 3000,
  // so examples default to 3001. Both ports are published by docker-compose.yml.
  port: Number(process.env.PORT) || 3001,

  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 13306,
    user: process.env.MYSQL_USER || 'appuser',
    password: process.env.MYSQL_PASSWORD || 'apppassword',
    database: process.env.MYSQL_DATABASE || 'appdb',
  },

  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  mongoDb: 'inet',
};
