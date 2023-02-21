// / Modules from this project
const cluster = require('cluster');
const CheckInfo = require('../service/checkInfo');
const Data = require('../models/urls.model');
const process = require('node:process');
const Change = require('../models/urls.model')

const { option } = require("../../connectSQL");
const knex = require('knex')(option);
const numCPUs = require('os').cpus().length;
console.log(numCPUs);
let start = 0;
let end = 0;
let worker = [];


cron.schedule('0 0 0 * * *', () => {
  console.log('will run every day at 12:00 AM ')

let informationalResponses;

async function isPrimary() {
  if (cluster.isPrimary) {

    const limit = await Change.getNull()
    
    const step = limit;

    const links = await Data.getLinks(0, limit);


    for (let i = 0; i < numCPUs; i += 1) {
      worker.push(cluster.fork());
      start = step * i;
      end = start + step;

      worker[i].send(links.slice(start, end));

      worker[i].on('message', async (msg) => {

        const val = Change.changeing().then(async (elem) => {
          if(msg.data[1].length > 0){
  
          for (let r = 0; r < elem[1].length; r++) {
            if(elem[0][r].external_urls === msg.data[3][r] && (elem[0][r].rel !== msg.data[1][r]|| elem[1][r].keyword !== msg.data[2][r])){
            informationalResponses = await knex
              .from('urls')
              .where('id','=', msg.data[0][r])
              .update({ changeing: {"oldRel": `"${elem[0][r].rel}"` , "newRel": `"${msg.data[1][r]}"` , "oldKeyword":`"${elem[1][r].keyword}"` , "newKeyword":`"${msg.data[2][r]}"` }})
              .update({updated_at:new Date()})
              }
           }  
        }
      }
    )
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
        worker[numCPUs - 1].send(chunk);

        worker[numCPUs - 1].on('message', async (msg) => {

          const val = Change.changeing().then(async (elem) => {
            if(msg.data[1].length > 0){
              
                      for (let r = 0; r < elem[1].length; r++) {
            if(elem[0][r].external_urls === msg.data[3][r] && (elem[0][r].rel !== msg.data[1][r] || elem[1][r].keyword !== msg.data[2][r])){
                        informationalResponses = await knex
                          .from('urls')
                          .where('id','=', msg.data[0][r])
                          .update({ changeing: {"oldRel": `"${elem[0][r].rel}"` , "newRel": `"${msg.data[1][r]}"` , "oldKeyword":`"${elem[1][r].keyword}"` , "newKeyword":`"${msg.data[2][r]}"` }})
                          .update({updated_at:new Date()})
                         }
                       }  
                    }
                }
          )

        });


        worker[numCPUs - 1].on('error', (error) => {
          console.log(error);
        });
      }
    });
  } else {
    process.on('message', async (msg) => {
      process.send({ data: await CheckInfo.checkInfo(msg) });
      process.kill(process.pid);
    });
  }
}

isPrimary()

});
