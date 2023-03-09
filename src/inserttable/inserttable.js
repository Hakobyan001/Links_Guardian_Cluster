//connect DB use knex.js
const { json } = require("express");
const { option } = require("../../connectSQL");
const { changeing } = require("../models/urls.model");


const knex = require('knex')(option);
const uniqueUrls = [];

//inserting table , first subprocess
// let campaign_id = 0;

class Insert {



    static async insertTable(info) {


        const links = Object.keys(info)

        const alfa = Object.values(info)

        let takeExistIds;
        let linksDatas = [];
        let urlsDatas;
        for (let ur = 0; ur < alfa.length; ur++) {
    
            linksDatas.push([
                { urls: links[ur], robot_tag: alfa[ur].robot_tag, title: alfa[ur].title, favicon: alfa[ur].favicon, status: alfa[ur].status, created_at: new Date(), campaign_id: alfa[ur].campaign_id, user_id: alfa[ur].user_id, 
                new_price: alfa[ur].details.new_price,
                client_price: alfa[ur].details.client_price,
                platform: alfa[ur].details.platform,
                link_type: alfa[ur].details.link_type,
                seller_name: alfa[ur].details.seller_name,
                screenshots: alfa[ur].details.screenshots,
                comment: alfa[ur].details.comment,
                provider_email: alfa[ur].details.provider_email,
                }
            ])


            const mainLinkCount = await knex('links').count('urls').where('urls', '=', links[ur]).where('campaign_id', '=', alfa[ur].campaign_id);


            if (Number(mainLinkCount[0].count) == 0) {
                const alfaAboutJoinsLinks = await knex('links')
                    .insert(linksDatas[ur])
                    .returning(['urls', 'id']);
            

            let insertUrls = alfa[ur].externalInfo

            for (let lin = 0; lin < insertUrls.length; lin++) {
                let uniqueUrl = insertUrls[lin].url.split('?v=')
                uniqueUrls.push(uniqueUrl);

                urlsDatas = [
                    {
                        external_urls: uniqueUrl[0],
                        rel: insertUrls[lin].rel,
                        keyword: insertUrls[lin].keyword,
                        created_at: new Date(),
                        links_id: alfaAboutJoinsLinks[0].id,
                        main_link: alfaAboutJoinsLinks[0].urls,
                        robot_tag: insertUrls[lin].robot_tag,
                        status: insertUrls[lin].status,
                        campaign_id: alfa[ur].campaign_id,
                        user_id: alfa[ur].user_id,
                    }

                ]

                //insert Unique data
                 takeExistIds = await knex('urls').count('campaign_id').where('campaign_id', '=', alfa[ur].campaign_id)

                if (Number(takeExistIds[0].count) == 0 || Number(takeExistIds[0].count) < insertUrls.length ) {
                    const alfaAboutJoinsUrls = await knex('urls')
                    .insert(urlsDatas)

                }

            }
            return [mainLinkCount, takeExistIds];
            }
        }
    }


}

module.exports = Insert