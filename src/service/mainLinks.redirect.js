const UrlService = require('./url.service')

class OnlyStatusChecker {
    static async linkTest(urls, param = [], fullInfo = []) {
        var url;
        let status;
        let links = [];
        
     
        await fetch(urls, {
            redirect: 'manual'
        }).then(async (res) => {

            url = res.url; status = res.status;
           if (res.status !== 200 && res.headers.get('location') !== null) {
            param.push({ url, status }); 
             
                return OnlyStatusChecker.linkTest(res.headers.get('location'), param,fullInfo);


            } else {
                param.push({ url, status }); 
                links = []
                links.push(res.url)
                let data = await UrlService.checkInfoFromMain(links);
                data[0].redirected_chains.push(param)

                fullInfo.push(data)

                return fullInfo
            }
        }).catch((err) => {
            if(err.message === "Cannot read properties of undefined (reading 'push')" || err.message === "Cannot read properties of undefined (reading 'code')"){
                return fullInfo.push({
                    url,
                    status: "There is the problem with this link"
                })
            }
            else if (err.cause.code === 'ECONNRESET' || String(err.cause) === "Error: certificate has expired") {
                return fullInfo.push({
                    urls,
                    status: 503
                 })
                }
            else if(err.cause.code === 'ENOTFOUND' ){
                    return fullInfo.push({
                        urls,
                        status: 404
                     })
                }     
            else if(err.cause.code === 'UND_ERR_CONNECT_TIMEOUT' ){
                        return fullInfo.push({
                            urls,
                            status: 408
                      })
                }
            else{
            return fullInfo.push({
                url,
                status:"We don't have access for information"
            })
            }
        });
        const info = fullInfo.flat(3)
        return info;
    }
}


module.exports = OnlyStatusChecker