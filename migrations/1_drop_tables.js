// NPM Modules
const knex = require('knex');
const knexConfigs = require('../knex.configs');

// Local Modules

function down(pg) {
    return pg.schema
      .dropTableIfExists('links')
      .dropTableIfExists('urls')
      .dropTableIfExists('changes');
  }
  
async function init() {
    try {
        const options = process.env.NODE_ENV === 'production'
            ? knexConfigs.production
            : knexConfigs.development;
        const pg = knex(options);
        await down(pg);
        console.log('Successfully dropped all tables ... ');
    } catch (error) {
        console.log("Error!!!");
    }
}

init();
