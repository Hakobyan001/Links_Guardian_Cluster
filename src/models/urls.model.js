//NPM MODULES
const { groupBy } = require("async");
const { option } = require("../../connectSQL");
const knex = require('knex')(option);


class Data {

  static async addChange(campaign_id) {
    const changeLinks = await knex('links').select('change').where('campaign_id', '=', campaign_id);
    const changeUrls = await knex('urls').select('change').where('campaign_id', '=', campaign_id);

    if (changeLinks.length != 0) {
      if (changeLinks[0].change == 'active') {
        const changedDataToAc = await knex('links').update({ change: 'inactive' }).where('campaign_id', '=', campaign_id)
      } else {
        const changedDataToIn = await knex('links').update({ change: 'active' }).where('campaign_id', '=', campaign_id);
      }

      if (changeUrls[0].change == 'active') {
        const changedUrlDataToAc = await knex('urls').update({ change: 'inactive' }).where('campaign_id', '=', campaign_id);
      } else {
        const changedUrlDataToIn = await knex('urls').update({ change: 'active' }).where('campaign_id', '=', campaign_id);
      }
      return [1, 1, 1, 1];
    } else {
      return [0, 0, 0, 0];
    }
  }


  static async insertUrls(data) {
    for (let int in data) {
      const insertData = await knex('urls').insert({ external_urls: data[int] });

    }
  }

  static async getUrls() {

    const selectNullableData = await knex.from('urls').select('external_urls',).where('robot_tag', null)
      .orderBy('id');

    return selectNullableData;


  }
  static async delData(offset, limit) {
    const del = await knex('urls').del().where('robot_tag', null)
  }


  static async mainLink(domain) {
    const selected = await knex('urls').select('external_urls', 'id').orderBy('id').where('main_link', '=', domain);
    return selected;
  }


  static async getLinksForChange() {
    const changeLinks = await knex.from('links').select('urls', 'id').orderBy('id').where('change', '=', 'active')
    return changeLinks

  }


  static async getLinks() {
    const y = await knex.from('urls').select('external_urls', 'id').orderBy('id').where('change', '=', 'active')
    return y

  }

  static async changeing() {
    const changeWithCr = await knex.from('urls').select('status', 'id', 'created_at', 'updated_at', 'external_urls', 'robot_tag').orderBy('created_at');

    return [changeWithCr]
  }

  static async deleteUrls(ids) {
    const delLinks = await knex.from('links').del().whereIn('id', ids);
    const delUrls = await knex.from('urls').del().whereIn('links_id', ids);
    return [delLinks, delUrls]
  }


  static async getLiveUrls() {
    const getLiveUrlStatus = await knex.from('urls').count().where('status', '=', 200);
    const getLiveUrlChangeingStatus = await knex.from('urls').count().whereRaw('??[1] = ?', ['changeing_status', 200]);

    const getLiveLinkStatus = await knex.from('links').count().where('status', '=', 200);
    const getLiveLinkChangeingStatus = await knex.from('links').count().whereRaw('??[4] = ?', ['changeing', 200]);

    const countLiveUrls = Number(getLiveUrlStatus[0].count) + Number(getLiveUrlChangeingStatus[0].count);
    const countLiveLinks = Number(getLiveLinkStatus[0].count) + Number(getLiveLinkChangeingStatus[0].count);

    return [countLiveUrls, countLiveLinks]
  }


  static async getCrawled() {
    let countupdate = 0;
    let leftcountupdate = 0;
    let date_1 = [];
    let date_2 = [];
    let days;

    const getDofollow = await knex.from('urls').count('id').where('rel', '=', 'dofollow');
    const getNofollow = await knex.from('urls').count('id').where('rel', '=', 'nofollow');
    const selsectTimestamp = await knex.from('urls').select('created_at')

    for (let i = 0; i < selsectTimestamp.length; i++) {
      date_1.push(selsectTimestamp[i].created_at)
      date_2.push(new Date());

      let date_1_elem = date_1[i];
      let date_2_elem = date_2[i];

      days = (date_1_elem, date_2_elem) => {
        let difference = date_1_elem.getTime() - date_2_elem.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
        return TotalDays;
      }

      if (days(date_1_elem, date_2_elem) > 1) {
        leftcountupdate++
      }
    }

    const selectChangeing = await knex.from('urls').select('changeing');

    for (let index = 0; index < selectChangeing.length; index++) {
      if (selectChangeing[index].changeing === null) {
        leftcountupdate += 1
      } else {
        countupdate += 1
      }
    }

    return { "dofollowCount": Number(getDofollow[0].count), "nofollowCount": Number(getNofollow[0].count), "crawledTodayCount": countupdate, "leftForCrawlingCount": leftcountupdate }
  }

  static async getCrawledById(userId) {
    let countupdate = 0;
    let leftcountupdate = 0;
    let date_1 = [];
    let date_2 = [];
    let days;

    const getDofollow = await knex.from('urls').count('id').where('rel', '=', 'dofollow').andWhere('user_id', '=', userId);
    const getNofollow = await knex.from('urls').count('id').where('rel', '=', 'nofollow').andWhere('user_id', '=', userId);
    const selsectTimestamp = await knex.from('urls').select('created_at');

    for (let i = 0; i < selsectTimestamp.length; i++) {
      date_1.push(selsectTimestamp[i].created_at)
      date_2.push(new Date());

      let date_1_elem = date_1[i];
      let date_2_elem = date_2[i];

      days = (date_1_elem, date_2_elem) => {
        let difference = date_1_elem.getTime() - date_2_elem.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
        return TotalDays;
      }

      if (days(date_1_elem, date_2_elem) > 1) {
        leftcountupdate++
      }
    }

    const selectChangeing = await knex.from('urls').select('changeing').where('user_id', '=', userId);

    for (let index = 0; index < selectChangeing.length; index++) {
      if (selectChangeing[index].changeing === null) {
        leftcountupdate += 1
      } else {
        countupdate += 1
      }
    }

    return { "dofollowCount": Number(getDofollow[0].count), "nofollowCount": Number(getNofollow[0].count), "crawledTodayCount": countupdate, "leftForCrawlingCount": leftcountupdate }
  }


  static async getCrawledLinksCountById(userId) {
    const crawledTodayCount = await knex('links').count()
      .where('updated_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
      .orWhere('created_at', '<', knex.raw('NOW() - INTERVAL \'1 DAY\''))
      .whereNotNull('changeing').where('user_id', '=', userId);

    return { crawledTodayLinksCount: Number(crawledTodayCount[0].count) };
  }

  static async getChangesById(userId, campaignId) {
    const countOfChangeingLinks = await knex.from('links').count().whereNotNull('changeing').andWhere('user_id', '=', userId).andWhere('campaign_id', '=', campaignId);
    const countOfChangeingUrls = await knex.from('urls').count().whereNotNull('changeing').andWhere('user_id', '=', userId).andWhere('campaign_id', '=', campaignId);;
    const countOfUrls = Number(countOfChangeingUrls[0].count);
    const countOfLinks = Number(countOfChangeingLinks[0].count);

    return { countOfChangeLinks: countOfLinks, countOfChangeUrls: countOfUrls };
  }


  static async getFailed() {
    const failedData = await knex.from('urls').count('id').whereNotNull('changeing').orWhereNotNull('changeing_status');
    return failedData

  }

  static async getChanges() {
    const changeLinks = await knex.from('links').select('campaign_id', 'user_id').where('changeing', null);

    return changeLinks
  }

  static async getExternalWithCheck() {
    const externalUrls = await knex.from('urls').select('external_urls', 'id').orderBy('id').where('changeing', null)//.where('status','=','active').andWhere('updated_at','-',new Date(),'<',24 );
    return externalUrls
  }


  static async getChangeData() {
    const changes = {
      changeMain: [],
      changeExtRobotStatus: [],
      changeExtRelKeyword: []
    };

    let title = '';

    const getChangeLinks = await knex.from('links').select('changeing', 'id').orderBy('id');

    const getOtherData = await knex.from('links').select('robot_tag', 'title', 'favicon', 'status', 'id').orderBy('id')

    for (let dat in getOtherData) {
      if (getChangeLinks[dat].changeing !== null) {
        if (getChangeLinks[dat].changeing.length == 4) {
          if (getOtherData[dat].favicon != getChangeLinks[dat].changeing[2] && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldFavicon: getOtherData[dat].favicon, newFavicon: getChangeLinks[dat].changeing[2] })
          }
        } else {
          if (getOtherData[dat].favicon != getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 2] && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldFavicon: getOtherData[dat].favicon, newFavicon: getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 2] })
          }
        }

        if (getChangeLinks[dat].changeing.length == 4) {
          if (getOtherData[dat].robot_tag != getChangeLinks[dat].changeing[1] && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldRobot: getOtherData[dat].robot_tag, newRobot: getChangeLinks[dat].changeing[1] })
          }
        } else {
          if (getOtherData[dat].robot_tag != getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 3] && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldRobot: getOtherData[dat].robot_tag, newRobot: getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 3] })
          }
        }

        if (getChangeLinks[dat].changeing.length == 4) {
          if (getOtherData[dat].status != getChangeLinks[dat].changeing[3] && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldStatus: getOtherData[dat].status, newStatus: getChangeLinks[dat].changeing[3] })
          }
        } else {
          if (getOtherData[dat].status != getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 1] && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldStatus: getOtherData[dat].status, newStatus: getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 1] })
          }
        }

        if (getChangeLinks[dat].changeing.length == 4) {
          if (getOtherData[dat].title != getChangeLinks[dat].changeing[0] && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldTitle: getOtherData[dat].title, newTitle: getChangeLinks[dat].changeing[0] })
          }
        } else {
          for (let i = 0; i < 3; i++) {
            getChangeLinks[dat].changeing.pop();
          }
          for (let k = 0; k < getChangeLinks[dat].changeing.length; k++) {
            if (getChangeLinks[dat].changeing[k] !== undefined) {
              if (k == getChangeLinks[dat].changeing.length - 1) {
                title += getChangeLinks[dat].changeing[k]
              } else {
                title += getChangeLinks[dat].changeing[k] + ', '
              }
            }

          }

          if (getOtherData[dat].title != title && getOtherData[dat].id === getChangeLinks[dat].id) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldTitle: getOtherData[dat].title, newTitle: title })
          }
        }
      }
    }

    const getChangeUrls = await knex.from('urls').select('changeing', 'id').orderBy('id')
    const getOtherDataExternals = await knex.from('urls').select('rel', 'keyword', 'id').orderBy('id')

    for (let dat in getOtherDataExternals) {
      if (getChangeUrls[dat].changeing !== null) {
        if (getOtherDataExternals[dat].rel != getChangeUrls[dat].changeing[0] && getOtherDataExternals[dat].id === getChangeUrls[dat].id) {
          changes.changeExtRelKeyword.push({ id: getChangeUrls[dat].id, oldRel: getOtherDataExternals[dat].rel, newRel: getChangeUrls[dat].changeing[0] })
        } if (getOtherDataExternals[dat].keyword != getChangeUrls[dat].changeing[1] && getOtherDataExternals[dat].id === getChangeUrls[dat].id) {
          changes.changeExtRelKeyword.push({ id: getChangeUrls[dat].id, oldKeyword: getOtherDataExternals[dat].keyword, newKeyword: getChangeUrls[dat].changeing[1] })
        }
      }

    }

    const getChangeStatus = await knex.from('urls').select('changeing_status', 'id').orderBy('id')
    const getOtherExternals = await knex.from('urls').select('robot_tag', 'status', 'id').orderBy('id')

    for (let dat in getOtherExternals) {
      if (getChangeStatus[dat].changeing_status !== null) {
        if (getOtherExternals[dat].robot_tag != getChangeStatus[dat].changeing_status[1] && getOtherExternals[dat].id === getChangeStatus[dat].id) {
          changes.changeExtRobotStatus.push({ id: getChangeStatus[dat].id, oldRobot: getOtherExternals[dat].robot_tag, newRobot: getChangeStatus[dat].changeing_status[1] })
        } if (getOtherExternals[dat].status != getChangeStatus[dat].changeing_status[0] && getOtherExternals[dat].id === getChangeStatus[dat].id) {
          changes.changeExtRobotStatus.push({ id: getChangeStatus[dat].id, oldStatus: getOtherExternals[dat].status, newStatus: getChangeStatus[dat].changeing_status[0] })
        }
      }

    }

    return changes;
  }


  static async getLinksAndUrls(campaignId) {
    const sendLinks = await knex.from('links').select('urls').where('campaign_id', '=', campaignId);
    const sendUrls = await knex.from('urls').select('external_urls').where('campaign_id', '=', campaignId);

    return {
      links: sendLinks,
      urls: sendUrls
    }
  }

  static async getFailedLinks(userId, page, limit) {

    const changes = [];

    let title = '';

    const getChangeLinks = await knex.from('links').select('changeing', 'id', 'urls').orderBy('id').where('user_id', '=', userId);

    const getOtherData = await knex.from('links').select('robot_tag', 'title', 'favicon', 'status', 'id').orderBy('id').where('user_id', '=', userId);

    for (let dat in getOtherData) {
      if (getChangeLinks[dat].changeing !== null) {
        if (getOtherData[dat].favicon != getChangeLinks[dat].changeing[2] && getOtherData[dat].id === getChangeLinks[dat].id) {
          if (getChangeLinks[dat].changeing.length == 4) {
            changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldFavicon: getOtherData[dat].favicon, newFavicon: getChangeLinks[dat].changeing[2] })
          } else {
            changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldFavicon: getOtherData[dat].favicon, newFavicon: getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 2] })
          }
        }
        if (getOtherData[dat].robot_tag != getChangeLinks[dat].changeing[1] && getOtherData[dat].id === getChangeLinks[dat].id) {
          if (getChangeLinks[dat].changeing.length == 4) {
            if (getChangeLinks[dat].changeing[1] != 'indexable') {
              changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldRobot: getOtherData[dat].robot_tag, newRobot: getChangeLinks[dat].changeing[1] })
            }
          } else {
            if (getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 3] != 'indexable') {
              changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldRobot: getOtherData[dat].robot_tag, newRobot: getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 3] })
            }
          }
        } if (getOtherData[dat].status != getChangeLinks[dat].changeing[3] && getOtherData[dat].id === getChangeLinks[dat].id) {
          if (getChangeLinks[dat].changeing.length == 4) {
            if (getChangeLinks[dat].changeing[3] != 200) {
              changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldStatus: getOtherData[dat].status, newStatus: getChangeLinks[dat].changeing[3] })
            }
          } else {
            if (getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 1] != 200) {
              changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldStatus: getOtherData[dat].status, newStatus: getChangeLinks[dat].changeing[getChangeLinks[dat].changeing.length - 1] })
            }
          }
        }
        if (getOtherData[dat].title != getChangeLinks[dat].changeing[0] && getOtherData[dat].id === getChangeLinks[dat].id) {
          if (getChangeLinks[dat].changeing.length == 4) {
            changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldTitle: getOtherData[dat].title, newTitle: getChangeLinks[dat].changeing[0] })
          } else {
            for (let i = 0; i < 3; i++) {
              getChangeLinks[dat].changeing.pop();
            }
            for (let k = 0; k < getChangeLinks[dat].changeing.length; k++) {
              if (getChangeLinks[dat].changeing[k] !== undefined) {
                if (k == getChangeLinks[dat].changeing.length - 1) {
                  title += getChangeLinks[dat].changeing[k]
                } else {
                  title += getChangeLinks[dat].changeing[k] + ', '
                }
              }
            }
            changes.push({ link: getChangeLinks[dat].urls, id: getChangeLinks[dat].id, oldTitle: getOtherData[dat].title, newTitle: title })
          }
        }
      }
    }

    const getChangeUrls = await knex.from('urls').select('changeing', 'id', 'external_urls').orderBy('id').where('user_id', '=', userId);
    const getOtherDataExternals = await knex.from('urls').select('rel', 'keyword', 'id').orderBy('id').where('user_id', '=', userId);

    for (let dat in getOtherDataExternals) {
      if (getChangeUrls[dat].changeing !== null) {
        if (getOtherDataExternals[dat].rel != getChangeUrls[dat].changeing[0] && getOtherDataExternals[dat].id === getChangeUrls[dat].id) {
          if (getChangeUrls[dat].changeing[0] != 'dofollow') {
            changes.push({ url: getChangeUrls[dat].external_urls, id: getChangeUrls[dat].id, oldRel: getOtherDataExternals[dat].rel, newRel: getChangeUrls[dat].changeing[0] })
          }
        } if (getOtherDataExternals[dat].keyword != getChangeUrls[dat].changeing[1] && getOtherDataExternals[dat].id === getChangeUrls[dat].id) {
          changes.push({ url: getChangeUrls[dat].external_urls, id: getChangeUrls[dat].id, oldKeyword: getOtherDataExternals[dat].keyword, newKeyword: getChangeUrls[dat].changeing[1] })
        }
      }

    }

    const getChangeStatus = await knex.from('urls').select('changeing_status', 'id', 'external_urls').orderBy('id').where('user_id', '=', userId);
    const getOtherExternals = await knex.from('urls').select('robot_tag', 'status', 'id').orderBy('id').where('user_id', '=', userId);

    for (let dat in getOtherExternals) {
      if (getChangeStatus[dat].changeing_status !== null) {
        if (getOtherExternals[dat].robot_tag != getChangeStatus[dat].changeing_status[1] && getOtherExternals[dat].id === getChangeStatus[dat].id) {
          if (getChangeStatus[dat].changeing_status[1] != 'indexable') {
            changes.push({ url: getChangeStatus[dat].external_urls, id: getChangeStatus[dat].id, oldRobot: getOtherExternals[dat].robot_tag, newRobot: getChangeStatus[dat].changeing_status[1] })
          }
        } if (getOtherExternals[dat].status != getChangeStatus[dat].changeing_status[0] && getOtherExternals[dat].id === getChangeStatus[dat].id) {
          if (getChangeStatus[dat].changeing_status[0] != 200) {
            changes.push({ url: getChangeStatus[dat].external_urls, id: getChangeStatus[dat].id, oldStatus: getOtherExternals[dat].status, newStatus: getChangeStatus[dat].changeing_status[0] })
          }
        }
      }
    }

    // calculating the starting and ending index
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalPages = Math.ceil(changes.length/limit);

    const results = {};

    if (startIndex == 0 || startIndex) {
      results.current_page = Number(page),
      results.limit = Number(limit),
      results.totalPages = totalPages
    }
    
    results.results = changes.slice(startIndex, endIndex);

    return results;
  }

}



module.exports = Data

