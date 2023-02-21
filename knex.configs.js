const config = require('./config/variables.config');

const { PSQL } = config;

const {
  PORT, HOST, DATABASE, USER, PASSWORD
} = PSQL;

module.exports = {
  development: {
    client: 'pg',
    useNullAsDefault: true,
    seeds: { directory: 'seeds/dev' },
    connection: {
      port: PORT,
      host: HOST,
      database: DATABASE,
      user: USER,
      password: PASSWORD
    }
  },

  production: {
    client: 'pg',
    useNullAsDefault: true,
    connection: {
      port: PORT,
      host: HOST,
      database: DATABASE,
      user: USER,
      password: PASSWORD
    }
  }
};
