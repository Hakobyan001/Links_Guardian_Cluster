const robot = require('../enum/robot.enum');
const rel = require('../enum/rel.enum');
const axios = require("axios").default;
const DecodeService = require('./decoding.entities.js');
const UrlService = require('./url.service')
const Insert = require("../inserttable/inserttable")
const urlsModel = require('../models/urls.model')

class LinkService {
  static async test(furls) {
    const aRegex = /<a[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/g;
    const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/;
    const robotsRegex = /<meta[^>]*?name=["']robots["'][^>]*?>/i;
    const faviconRegex = /<link[^>]*(?:rel\s*=\s*['"](?:shortcut icon|icon)['"][^>]*)\s*href\s*=\s*['"]([^'"]*)['"][^>]*>/i;
    const hrefRegex = /(?<=href=")[^"]+/g;
    const aTags = [];
    const htmlOfLinks = [];
    const mainStatuses = [];
    const title = [];
    const robots = [];
    const favicons = [];
    const externalInfo = [];
    const aTagOfExternals = []
    const unique = [];
    const sorted = [];
    const hrefs = [];
    const unique2 = [];
    const uniqueArray = [];
    const replaced = [];
    let info = [];
    let hrefValues = [];
    let FullInfoExternals = [];


    try {
      let counter = Math.floor(Math.random() * 999999999999999);
      const links = furls.map((el) => el + `?v=${counter}`)
      var dataMain = await Promise.all(links.map((elem) => fetch(elem)))
      for (let elem of dataMain) {
        if(elem.status === 404) {
          const vil = await Promise.all(furls.map((elem) => fetch(elem)))
          for (let element of vil) {
            let mainText = await element.text();
            htmlOfLinks.push(mainText);
            mainStatuses.push(element.status);
        }
      }else {
          let mainText = await elem.text();
          htmlOfLinks.push(mainText);
          mainStatuses.push(elem.status);
            }
        }
  }catch (err) {
    console.log(err, "perviy err");
      if(err instanceof TypeError || err.message === 'terminated') {
        let counter = Math.floor(Math.random() * 999999999999999);
        const links = furls.map((el) => el + `?v=${counter}`)
        var dataMain = await Promise.all(links.map((elem) => 
        axios.get(`${elem}`).then((response)=>{
            return response
          })));
  
        for (let elem of dataMain) {
          //Receive statuses of Links
            let mainText = elem.data;
            htmlOfLinks.push(mainText);
            mainStatuses.push(elem.status);
        }
      }
      else{
        return "Problem"
      }
    }
    try {
    for (let i = 0; i < furls.length; i++) {
      // //Getting External links
      var domains = furls.map((el) => new URL(el).hostname.replace('www.', ''));
      externalInfo.push([]);
      // console.log(htmlOfLinks[i]);
      aTags.push(htmlOfLinks[i].match(aRegex));
      aTagOfExternals.push([...new Set(aTags[i])].filter((el) => !el.includes(domains[i]) && el.includes('href="http') && !el.includes('@') && !el.includes('.js') && !el.includes('.css')))
      sorted.push(aTagOfExternals[i].map((el) => el.split(' ').sort().join(' ')));
      unique.push(sorted[i].filter((elem, index, array) => elem.includes('http')));
      replaced.push(aTagOfExternals[i].map((elem) => elem.replaceAll(/<\/?[^>]+(>|$)/gi, "")));
      hrefs.push(unique[i].map(aTag => {
        const matches = aTag.match(hrefRegex);
        return matches ? matches[0] : null;
      }));
      hrefValues = hrefs[i].filter((el) => el.startsWith('http') && !el.startsWith('http://https') && !el.startsWith('https://http'));

      for (let k = 0; k < hrefValues.length; k++) {
        uniqueArray.push([...new Set(unique[i].filter(str => str.includes(hrefValues[k])))][0]);
      }
      unique2.push(uniqueArray)
      title.push(htmlOfLinks[i].match(titleRegex));
      robots.push(String(htmlOfLinks[i].match(robotsRegex)));
      favicons.push(htmlOfLinks[i].match(faviconRegex));
          //Pushing Information about external links
        for (let x = 0; x < hrefValues.length; x++) {
              externalInfo[i].push(JSON.stringify({
              url: hrefValues[x],
              rel: uniqueArray[x].includes('nofollow') ? rel.nofollow : rel.dofollow,
              keyword: aTagOfExternals[i][x].includes(replaced[i][x]) && replaced[i][x] !== '' && !replaced[i][x].includes('/') ? await DecodeService.decodingEntities(replaced[i][x]) : "-",
            }))
        }

        let a = externalInfo[i];
        let a1 = [...new Set(a)];
        FullInfoExternals = a1.map((el) => JSON.parse(el));
        // Creating object for All Information of Main link
        info.push(
          {
            link: furls[i],
            externals: [FullInfoExternals.length],
            redirected_chains: [],
            title: title[i] === null ? title[i] : await DecodeService.decodingEntities(title[i][1]),
            robot_tag: robots[i] === undefined || !robots[i].includes('noindex') || robots[i] === "null" ? robot.indexable : robot.noindexable,
            favicon: (!favicons[i] || favicons[i][1].includes(','))  ? null : (favicons[i][1].includes('https://') ? favicons[i][1] : `https://${domains[i]}` + '/' + favicons[i][1]),
            status: mainStatuses[i],
            externalInfo: FullInfoExternals.length > 0 ? FullInfoExternals : []   
          }
        )
      } 
      } catch (err) {
        console.log(err);
        if (err instanceof TypeError && err.message === 'terminated') {
            return "Problem";
        }
        else{
          return "Problem"
        }
      }
         const infoLinks = await urlsModel.insertUrls(hrefValues);
         return info;
  }
}  

module.exports = LinkService
