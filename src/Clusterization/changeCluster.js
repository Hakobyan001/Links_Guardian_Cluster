// Modules from this project
const cluster = require('cluster');
const Data = require('../models/urls.model');
const process = require('node:process');
const Change = require('../models/urls.model')
const ChangeMain = require('../service/changeMain');
const cron = require('node-cron');


const { option } = require("../../connectSQL");
const { getLinksForChange } = require('../models/urls.model');
const knex = require('knex')(option);
const numCPUs = require('os').cpus().length;
let start = 0;
let end = 0;
let worker = [];
const step = 1;
let changedInfo;
let changedInfoExternals;



// cron.schedule('0 0 0 * * *', () => {
//   console.log('will run every day at 12:00 AM ')


async function isPrimary() {
  if (cluster.isPrimary) {


    const links = await Data.getLinksForChange()
    const limit = links.length

    for (let i = 0; i < numCPUs; i += 1) {
      worker.push(cluster.fork());
      start = step * i;
      end = start + step;

      worker[i].send(links.slice(start, end));

      worker[i].on('message', async (msg) => {

        if (msg.data !== undefined) {

          changedInfo = await knex
          .from('links')
          .where('updated_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
          .orWhere('created_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
              .andWhere('id', '=', msg.data[4][0])
              .update({ changeing: [msg.data[0],msg.data[1],msg.data[2],msg.data[3] ]})
              .update({ updated_at: new Date() });

              for(let temp in msg.data[5][0]){

                changedInfoExternals = await knex
                .from('urls')
                .where('updated_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
                .orWhere('created_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
                .andWhere('external_urls', '=', JSON.parse(msg.data[5][0][temp]).external_urls)
                .update({ changeing: [JSON.parse(msg.data[5][0][temp]).rel,JSON.parse(msg.data[5][0][temp]).keyword]})
                .update({ updated_at: new Date() });
                }




              
        }

      });


      worker[i].on('error', (error) => {
        console.log(error);
      });
    }

    cluster.on('exit', async (currWorker) => {
      start = end;
      end = start + step;

      if (end <= limit) {
        worker = worker.filter((w) => w.id !== currWorker.id);
        worker.push(cluster.fork());
        const chunk = links.slice(start, end);
        console.log('INIT start, end => ', start, end);
        worker[numCPUs - 1].send(chunk);

        worker[numCPUs - 1].on('message', async (msg) => {

          if (msg.data !== undefined) {
            changedInfo = await knex
            .from('links')
            .where('updated_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
            .orWhere('created_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
                .andWhere('id', '=', msg.data[4][0])
                .update({ changeing: [msg.data[0],msg.data[1],msg.data[2],msg.data[3] ]})
                .update({ updated_at: new Date() });


                for(let temp in msg.data[5][0]){

                  changedInfoExternals = await knex
                  .from('urls')
                  .where('updated_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
                  .orWhere('created_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
                      .andWhere('external_urls', '=', JSON.parse(msg.data[5][0][temp]).external_urls)
                      .update({ changeing: [JSON.parse(msg.data[5][0][temp]).rel,JSON.parse(msg.data[5][0][temp]).keyword]})
                      .update({ updated_at: new Date() });
                  }
          }

        });


        worker[numCPUs - 1].on('error', (error) => {
          console.log(error);
        });
      }
    });
  } else {

    process.on('message', async (msg) => {
      process.send({ data: await ChangeMain.changeMain(msg) });
      process.kill(process.pid);

    });

  }
}

isPrimary();
// });