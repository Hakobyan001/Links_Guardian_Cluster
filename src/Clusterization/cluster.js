
// Modules from this project
const cluster = require('cluster');
const UrlService = require('../service/url.service');
const Data = require('../models/urls.model');
const { LOADIPHLPAPI } = require('dns');


const numCPUs = require('os').cpus().length;

let start = 0;
let end = 0;
let worker = [];
const array = [];


async function isPrimary() {

  if (cluster.isPrimary) {
    
    let step;
    const links = await Data.getUrls();
    if(links.length < numCPUs){
      step = 1
    }else{
      step = 5
    }
    const limit = links.length;
    if(limit === 0) {
      process.send([]);
    }

    await Data.delData()


    for (let i = 0; i < numCPUs; i += 1) {
      worker.push(cluster.fork());
      start = step * i;
      end = start + step;

      worker[i].send(links.slice(start, end));
      worker[i].on('message', async (msg) => {
        if(msg.data[0]){
          array.push(msg.data)
          if(array.length*step >= limit) {
            process.send(array);
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
      if (end <= limit + step) {
        worker = worker.filter((w) => w.id !== currWorker.id);

        worker.push(cluster.fork());

        const chunk = links.slice(start, end);
      
        worker[numCPUs - 1].send(chunk);

        worker[numCPUs - 1].on('message', async (msg) => {
          if(msg.data[0]){ 
            array.push(msg.data);
            if(array.length*step  >= limit) {
              process.send(array);
              
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
        process.send({ data: await UrlService.anotherChecking(msg) });
        process.kill(process.pid);
        
    });
  }
}
isPrimary()