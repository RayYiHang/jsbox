/**
 * @fileoverview Template to compose HTTP reqeuest.
 * 
 */

const url = `https://youhui.95516.com/newsign/api/daily_sign_in`;
const method = `POST`;
const headers = {
'Connection' : `keep-alive`,
'Accept-Encoding' : `gzip, deflate, br`,
'Content-Type' : `application/json;charset=utf-8`,
'Origin' : `https://youhui.95516.com`,
'x-city' : `441900`,
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/sa-sdk-ios  (com.unionpay.chsp) (cordova 4.5.4) (updebug 0) (version 900) (UnionPay/1.0 CloudPay) (clientVersion 162) (language zh_CN)`,
'Authorization' : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJQMEpQR00xRTgiLCJ0IjoiMjQ5NDEyIiwiaWF0IjoxNjI4MDU3MTM1LCJleHAiOjE2MjgyMjk5MzV9.32Ha9NqVwbDhj67TY2CgNDhsnMLDALAbD99UzT3CwAc`,
'Cookie' : `sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2217ab6f2266d31b-0eeb0aeea228c6-5a1c202e-370944-17ab6f2266e321%22%2C%22%24device_id%22%3A%2217ab6f2266d31b-0eeb0aeea228c6-5a1c202e-370944-17ab6f2266e321%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%7D%7D; dfp_t_c=1601194449655; newInjectAttr=01C3QdtJh6/XmtEkCwVF8FKUV0/moY3bA+trmvjEygcTknwgz5kiuYPbpOwI3tcEze12; pgv_pvi=8299521024`,
'Host' : `youhui.95516.com`,
'Referer' : `https://youhui.95516.com/newsign/public/app/index.html`,
'Accept-Language' : `zh-cn`,
'Accept' : `application/json, text/plain, */*`
};
const body = `{}`;

const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(myRequest).then(response => {
    console.log("云闪付签到💰：" + response.statusCode + "\n\n" + response.body);
    let obj = JSON.parse(response.body);
    if (obj["coins"] != 0) {
       $notify("云闪付",`✅签到成功，获得${obj["coins"]}硬币`)} else {
       $notify("云闪付", "❌签到失败")};
    $done();
}, reason => {
    console.log(reason.error);
    $notify("⚠️云闪付", reason.error)
    $done();
});
