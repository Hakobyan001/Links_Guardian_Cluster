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
const { userInfo } = require('os');


class UrlsController {

  static async addChange(req, res, next) {
    try {
      const campaign_id = req.query.campaign_id;
      const urls = await UrlsModel.addChange(campaign_id);

      if (urls[0] == 0 && urls[1] == 0) {
        res.send({ success: false })
      } else {
        res.send({ success: true })
      }
    } catch (error) {
      next(error);
    }
  }
  static async test(req, res, next) {
    try {
      const val = req.body;
      let data = [];
      const url = Object.values(val);
      let info2;
      let domains = [];
      for (let i = 0; i < url.length; i++) {
        domains.push(url[i])
        info2 = await CheckerLinks.linkTest(url[i]);
        data.push(info2)
      }
      const worker = child_process.fork('src/Clusterization/cluster.js')
      worker.on('message', async function (msg) {
        let array = msg.flat(2);
        for (let i = 0; i < url.length; i++) {
          var extrs = data[i][0].externalInfo ;
          let arr3 = extrs = extrs.map(obj1 => {
            const matchingObj2 = array.find(obj2 => obj1.url === obj2.url || obj1.url + '/' === obj2.url || obj1.url === obj2.url + '/');
            return { ...obj1, ...matchingObj2 };
          });
          data[i][0].link = domains[i];
          data[i][0].externalInfo = arr3
        }
        res.send(data)
        data = null
      })
    } catch (error) {
      next(error);
    }
  }

  static async addLinks(req, res, next) {
    try {
      const val = req.body;
      const url = await insertTable.insertTable(val);
      if(url == undefined) {
      SuccessHandlerUtil.handleAdd(res, next, { success: false });
      }else {
      SuccessHandlerUtil.handleAdd(res, next, { success: true });
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteUrls(req, res, next) {
    try {
      const { id } = req.body;
      const url = await UrlsModel.deleteUrls(id);
      if (url[0] == 0 && url[1] == 0) {
        SuccessHandlerUtil.handleDelete(res, next, { success: false });
      } else {
        SuccessHandlerUtil.handleDelete(res, next, { success: true });
      }
    } catch (error) {
      next(error);
    }
  }
  static async getLiveUrls(req, res, next) {
    try {
      const url = await UrlsModel.getLiveUrls();
      res.send({countOfLiveUrls: url[0], countOfLiveLinks: url[1]})
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
        SuccessHandlerUtil.handleGet(res, next, dataOfExternals);

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
      const campaignId = req.query.campaignId;
      const changesData = await UrlsModel.getLinksAndUrls(campaignId);
      res.send(changesData)
    } catch (error) {
      next(error);
    }
  }


  static async getFailedLinks(req, res, next) {
    try {
      const userId = req.query.userId;
      const page = req.query.page;
      const limit = req.query.limit;

      const changesData = await UrlsModel.getFailedLinks(userId, page, limit);
      SuccessHandlerUtil.handleGet(res, next, changesData);
    } catch (error) {
      next(error);
    }
  }

}

module.exports = UrlsController;