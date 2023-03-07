const UrlsModel = require('../models/urls.model.js')
const LinkService = require('../service/link.service')
const CheckerLinks = require('../service/linksChecker');
const RedirectedLinks = require('../service/links.redirected')
const UrlService = require('../service/url.service');
const child_process = require('child_process');
const insertTable = require('../inserttable/inserttable');
const OnlyStatusChecker = require('../service/mainLinks.redirect');
const { LogError } = require('concurrently');
const SuccessHandlerUtil = require('../utils/success-handler.util.js');


class UrlsController {

  static async addChange(req, res, next) {
    try {
      const { campaign_id } = req.body
      const urls = await UrlsModel.addChange(campaign_id);
      res.send('success')
    } catch (error) {
      next(error);
    }
  }

  static async test(req, res, next) {
    try {
      const val = req.body;
      const url = Object.values(val);
      const results = await Promise.allSettled(url.map((url) => CheckerLinks.linkTest(url)));
      const worker = child_process.fork('src/Clusterization/cluster.js')
      worker.on('message', async function (msg) {
        let array = msg.flat(2);
        var extrs;
        const data = results.map((result, i) => {
          if (result.status === 'fulfilled') {
            extrs = result.value[0].externalInfo ? result.value[0].externalInfo : result.value;
            let arr3 = extrs = extrs.map(obj1 => {
              const matchingObj2 = array.find(obj2 => obj1.url === obj2.url || obj1.url + '/' === obj2.url || obj1.url === obj2.url + '/');
              return { ...obj1, ...matchingObj2 };
            });
            result.value[0].link = url[i]
            result.value[0].externalInfo = arr3
            return result.value;
          } else {
            console.log(`Error fetching URL ${url[i]}`);
          }
        });
        res.send(data)
      });
    } catch (error) {
      next(error);
    }
  }

  static async addLinks(req, res, next) {
    try {
      const val = req.body;
      const url = await insertTable.insertTable(val);
      // res.send({ success: true })
      SuccessHandlerUtil.handleAdd(res, next, { success: true });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUrls(req, res, next) {
    try {
      const { id } = req.body;
      const url = await UrlsModel.deleteUrls(id);
      // res.send(url)
      SuccessHandlerUtil.handleDelete(res, next, { success: true });
    } catch (error) {
      next(error);
    }
  }
  static async getLiveUrls(req, res, next) {
    try {
      const url = await UrlsModel.getLiveUrls();
      res.send(url)
    } catch (error) {
      next(error);
    }
  }

  static async getCrawled(req, res, next) {
    try {

      const url = await UrlsModel.getCrawled();
      res.send(url)
    } catch (error) {
      next(error);
    }
  }

  static async getCrawledById(req, res, next) {
    try {
      const userId = req.query.userId;

      const url = await UrlsModel.getCrawledById(userId);
      res.send(url)
    } catch (error) {
      next(error);
    }
  }


  static async getCrawledLinksCountById(req, res, next) {
    try {
      const userId = req.query.userId;

      const url = await UrlsModel.getCrawledLinksCountById(userId);
      res.send(url)
    } catch (error) {
      next(error);
    }
  }

  static async getChangesById(req, res, next) {
    try {
      const userId = req.query.userId;
      const campaignId = req.query.campaignId;

      const url = await UrlsModel.getChangesById(userId, campaignId);
      res.send(url)
    } catch (error) {
      next(error);
    }
  }

  static async fullOnlyStatus(req, res, next) {
    let data;
    let dataOfExternals = [];
    try {
      const urls = req.body;
      for (let e = 0; e < urls.length; e++) {
        data = await OnlyStatusChecker.linkTest(urls[e]);
        dataOfExternals.push(data)
      }
      if (dataOfExternals[0][0].error === "We don't have access for information" || dataOfExternals[0][0].status === 404) {
        res.send(500, dataOfExternals)
      } else {
        res.send(dataOfExternals)
      // SuccessHandlerUtil.handleGet(res, next, { success: true });

      }
      dataOfExternals = []
      data = []
    } catch (error) {
      next(error)
    }
  }



  static async getFailed(req, res, next) {
    try {

      const url = await UrlsModel.getFailed();
      res.send(url)
    } catch (error) {
      next(error);
    }
  }
  static async getChangeData(req, res, next) {
    try {

      const changesData = await UrlsModel.getChangeData();
      res.send(changesData)
    } catch (error) {
      next(error);
    }
  }
  static async getLinks(req, res, next) {
    try {
      const userId = req.query.userId;
      const campaignId = req.query.campaignId;
      const changesData = await UrlsModel.getLinksAndUrls(userId,campaignId);
      res.send(changesData)
    } catch (error) {
      next(error);
    }
  }

  
  static async getFailedLinks(req, res, next) {
    try {
      const campaignId = req.query.campaignId;
      const changesData = await UrlsModel.getFailedLinks(campaignId);
      res.send(changesData)
    } catch (error) {
      next(error);
    }
  }

}

module.exports = UrlsController;