const fetch = require('node-fetch');

class RedirectedLinks {
    static async linkTest(link, param = []) {
        let url;
        let status;

        await fetch(link, {
            redirect: 'manual'
        }).then((res) => {
            url = res.link; status = res.status;
            param.push({ url, status }); if (res.status !== 200 && res.headers.get('location') !== null) {
                return RedirectedLinks.linkTest(res.headers.get('location'), param);
            }
        }).catch((err) => {
            console.log(err);
            return param.push({
                                link,
                                error: "This is invalid link."
                            });
        });
        return param;
    }
}
module.exports = RedirectedLinks;