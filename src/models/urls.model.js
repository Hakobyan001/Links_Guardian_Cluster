//NPM MODULES
const { groupBy } = require("async");
const { option } = require("../../connectSQL");
const knex = require('knex')(option);


// const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);



// const formattedDate = oneDayAgo.toISOString().replace('T', ' ').replace('Z', '');
// console.log(formattedDate,545454545);


// console.log(formattedDate); // output: "2023-03-02 08:58:09.63200"




// console.log(oneDayAgo);
//Connect myDB's Tables

class Data {

  static async addChange(campaign_id) {
    const changedData = await knex('links').update({ change: 'inactive' }).where('campaign_id', '=', campaign_id);
    const changedurlData = await knex('urls').update({ change: 'inactive' }).where('campaign_id', '=', campaign_id);
    return {
      success: true
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


  // static async linksChange() {
  //   const changeMain = await knex.from('links').select('urls', 'robot_tag', 'title', 'favicon', 'status', 'id', 'created_at', 'updated_at');
  //   const changeUrl = await knex.from('urls').select('created_at', 'id', 'rel', 'keyword', 'external_urls', 'updated_at');
  //   return [changeMain, changeUrl]

  // }
  static async getLinksForChange() {
    const changeLinks = await knex.from('links').select('urls', 'id').orderBy('id').where('change','=','active')
    return changeLinks

  }



  static async getLinks() {
    const y = await knex.from('urls').select('external_urls', 'id').orderBy('id').where('change','=','active')
    return y

  }


  // static async getIds() {
  //   const z = await knex.from('urls').select('id').orderBy('id').where('change', '=', 'inactive')
  //   return z

  // }
  static async changeing() {
    const changeWithCr = await knex.from('urls').select('status', 'id', 'created_at', 'updated_at', 'external_urls', 'robot_tag').orderBy('created_at');

    return [changeWithCr]
  }

  // static async getLimit() {
  //   const count = await knex.from('urls').select('robot_tag').groupBy('id').where('robot_tag', null)
  //   if (count.length > 0) {
  //     return count.length
  //   } else {
  //     console.log('թարմացնելու  տվյալներ չկան․․․')
  //   }
  // }

  static async deleteUrls(ids) {
    const delLinks = await knex.from('links').del().whereIn('id', ids).returning('*');
    const delUrls = await knex.from('urls').del().whereIn('links_id', ids).returning('*');

    return [delLinks, delUrls]
  }


  static async getLiveUrls() {
    const getLive = await knex.from('urls').count('id').where('status', '=', 200)
    console.log(getLive);

    return getLive
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
    console.log(selsectTimestamp)

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
    const links = await knex.from('links').count('id').where('user_id', '=', userId);
    return links;
  }

  static async getChangesById(userId, campaignId) {
    const joinsLinks = await knex.select('*').from('links').innerJoin('changes', function () {
      this
        .on('links.campaign_id', '=', 'changes.campaign_id')
    });

    const joinsUrls = await knex.select('*').from('urls').innerJoin('changes', function () {
      this
        .on('urls.campaign_id', '=', 'changes.campaign_id')
    }).whereNotNull('changeing');

    return { linksChanges: joinsLinks.length, urlsChanges: joinsUrls.length };
  }


  static async getFailed() {
    const failedData = await knex.from('urls').count('id').whereNotNull('changeing')
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

    const getChangeLinks = await knex.from('links')
      .select('changeing', 'id').orderBy('id');
    const getOtherData = await knex.from('links').select('robot_tag', 'title', 'favicon', 'status', 'id').orderBy('id')
    for (let dat in getOtherData) {
      if (getChangeLinks[dat].changeing !== null) {
        if (getOtherData[dat].favicon != getChangeLinks[dat].changeing[2] && getOtherData[dat].id === getChangeLinks[dat].id) {
          changes.changeMain.push({ id: getChangeLinks[dat].id, oldFavicon: getOtherData[dat].favicon, newFavicon: getChangeLinks[dat].changeing[2] })
        } if (getOtherData[dat].title != getChangeLinks[dat].changeing[0] && getOtherData[dat].id === getChangeLinks[dat].id) {
          changes.changeMain.push({ id: getChangeLinks[dat].id, oldTitle: getOtherData[dat].title, newTitle: getChangeLinks[dat].changeing[0] })
        } if (getOtherData[dat].robot_tag != getChangeLinks[dat].changeing[1] && getOtherData[dat].id === getChangeLinks[dat].id) {
          if (getChangeLinks[dat].changeing[1] != 'indexable') {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldRobot: getOtherData[dat].robot_tag, newRobot: getChangeLinks[dat].changeing[1] })
          }
        } if (getOtherData[dat].status != getChangeLinks[dat].changeing[3] && getOtherData[dat].id === getChangeLinks[dat].id) {
          if (getChangeLinks[dat].changeing[3] != 200) {
            changes.changeMain.push({ id: getChangeLinks[dat].id, oldStatus: getOtherData[dat].status, newStatus: getChangeLinks[dat].changeing[3] })
          }
        }

      }

    }
    const getChangeUrls = await knex.from('urls').select('changeing', 'id').orderBy('id')
    const getOtherDataExternals = await knex.from('urls').select('rel', 'keyword', 'id').orderBy('id')

    for (let dat in getOtherDataExternals) {
      if (getChangeUrls[dat].changeing !== null) {
        if (getOtherDataExternals[dat].rel != getChangeUrls[dat].changeing[0] && getOtherDataExternals[dat].id === getChangeUrls[dat].id) {
          if (getChangeUrls[dat].changeing[0] != 'dofollow') {
            changes.changeExtRelKeyword.push({ id: getChangeUrls[dat].id, oldRel: getOtherDataExternals[dat].rel, newRel: getChangeUrls[dat].changeing[0] })
          }
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
          if (getChangeStatus[dat].changeing_status[1] != 'indexable') {
            changes.changeExtRobotStatus.push({ id: getChangeStatus[dat].id, oldRobot: getOtherExternals[dat].robot_tag, newRobot: getChangeStatus[dat].changeing_status[1] })
          }
        } if (getOtherExternals[dat].status != getChangeStatus[dat].changeing_status[0] && getOtherExternals[dat].id === getChangeStatus[dat].id) {
          if (getChangeStatus[dat].changeing_status[0] != 200) {
            changes.changeExtRobotStatus.push({ id: getChangeStatus[dat].id, oldStatus: getOtherExternals[dat].status, newStatus: getChangeStatus[dat].changeing_status[0] })
          }
        }
      }

    }

    return changes;
  }


  static async getLinksAndUrls(campaignId, userId) {
    const sendLinks = await knex.from('links').select('urls').where('campaign_id', '=', campaignId).andWhere('user_id', '=', userId);
    const sendUrls = await knex.from('urls').select('external_urls').where('campaign_id', '=', campaignId).andWhere('user_id', '=', userId);

    return {
      links: sendLinks,
      urls: sendUrls
    }

  }

  static async getFailedLinks(campaignId) {
    console.log(campaignId);
    const getFailedLinks = await knex.from('links').select('changeing', 'id').orderBy('id').where('campaign_id', '=', campaignId).andWhere(function () {
      this.whereRaw("(changeing ->> 'oldTitle') <> (changeing ->> 'newTitle')")
        .orWhereRaw("(changeing ->> 'oldRobot') <> (changeing ->> 'newRobot')")
        .orWhereRaw("(changeing ->> 'oldFavicon') <> (changeing ->> 'newFavicon')")
        .orWhereRaw("(changeing ->> 'oldStatus') <> (changeing ->> 'newStatus')")
    });
    const getFailedUrls1 = await knex.from('urls').select('changeing', 'id').orderBy('id').where('campaign_id', '=', campaignId).andWhere(function () {
      this.whereRaw("(changeing ->> 'oldRel') <> (changeing ->> 'newRel')")
        .orWhereRaw("(changeing ->> 'oldKeyword') <> (changeing ->> 'newKeyword')")

    })
    const getFailedUrls2 = await knex.from('urls').select('changeing_status', 'id').orderBy('id').where('campaign_id', '=', campaignId).andWhere(function () {
      this.whereRaw("(changeing_status ->> 'oldStatus') <> (changeing_status ->> 'newStatus')")
        .orWhereRaw("(changeing_status ->> 'oldRobot') <> (changeing_status ->> 'newRobot')")

    })


    return {
      failedLinks: getFailedLinks,
      failedUrls: [getFailedUrls1, getFailedUrls2]
    }

  }




}
module.exports = Data

