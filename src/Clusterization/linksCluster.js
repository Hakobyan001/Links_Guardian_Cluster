// / Modules from this project
const cluster = require('cluster');
const Data = require('../models/urls.model');
const process = require('node:process');
const Change = require('../models/urls.model');
const UrlService = require('../service/url.service');


//downloads modules
const { option } = require("../../connectSQL");
const knex = require('knex')(option);
const numCPUs = require('os').cpus().length;

// variables
let start = 0;
let end = 0;
let worker = [];
let changedInfo;

// cron.schedule('0 0 0 * * *', () => {
//   console.log('will run every day at 12:00 AM ')



// Clusterization function
async function isPrimary() {
  if (cluster.isPrimary) {

    const step = 1;

    const links = await Data.getLinks();
    const limit = links.length


    for (let i = 0; i < numCPUs; i += 1) {
      worker.push(cluster.fork());
      start = step * i;
      end = start + step;

      worker[i].send(links.slice(start, end));

      worker[i].on('message', async (msg) => {

        console.log(msg.data, 'msg');



        if (msg.data[0] !== undefined) {

          changedInfo = await knex
            .from('urls')
            .where('updated_at_for_status', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
            .orWhere('created_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
            .where('external_urls', '=', msg.data[0].url)
            .update({ changeing_status: [msg.data[0].status,msg.data[0].robot_tag ] })
            .update({ updated_at_for_status: new Date() });
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
        console.log(end, '--------------------------', limit);
        const chunk = links.slice(start, end);
        worker[numCPUs - 1].send(chunk);

        worker[numCPUs - 1].on('message', async (msg) => {
          // console.log(msg, 'msg');
          if (msg.data[0] !== undefined) {
            changedInfo = await knex
              .from('urls')
              .where('updated_at_for_status', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
              .orWhere('created_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
              .where('external_urls', '=', msg.data[0].url )
              .update({ changeing_status: [msg.data[0].status,msg.data[0].robot_tag ] })
              .update({ updated_at_for_status: new Date() });
          }
        });


        worker[numCPUs - 1].on('error', (error) => {
          console.log(error);
        });
      }
    });
  } else {
    process.on('message', async (msg) => {
      const data = await UrlService.checkUrls(msg)
      if (data !== undefined) {
        process.send({ data: data });
      }
      process.kill(process.pid);

    });

    console.log(`Worker ${process.pid} started`);



  }
}

isPrimary()
// });
