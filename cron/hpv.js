
/**
 * @fileoverview Template to compose HTTP reqeuest.
 * 
 */

const url = `https://cloud.cn2030.com/sc/wx/HandlerSubscribe.ashx?act=GetCustSubscribeDateAll&pid=35&id=4219&month=202107`;
const method = `GET`;
const headers = {
'Cookie' : `ASP.NET_SessionId=jhwylymf1gjxyk2pekqgv44z`,
'content-type' : `application/json`,
'zftsl' : `2f19938f5f6d32d12638df348c7a9281`,
'Connection' : `keep-alive`,
'Accept-Encoding' : `gzip,compress,br,deflate`,
'Host' : `cloud.cn2030.com`,
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.7(0x18000733) NetType/4G Language/zh_CN`,
'Referer' : `https://servicewechat.com/wx2c7f0f3c30d99445/77/page-frame.html`
};
const body = ``;

const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(myRequest).then(response => {
    // response.statusCode, response.headers, response.body
    let obj = JSON.parse(response.body);
    let result = obj["list"].some((item) => {
      return item["enable"]
    })
    if (result) {
    $notify("HPV检测", "✅有苗")} else {
    $notify("HPV检测", "❌没有苗")};
    $done()
}, reason => {
    // reason.error
    $notify("HPV检测", "❌错误", reason.error); // Error!
    $done();
});
