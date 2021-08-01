/**
 * @fileoverview Template to compose HTTP reqeuest.
 * 
 */

const url = `https://user-api.smzdm.com/checkin`;
const method = `POST`;
const headers = {
'Cookie' : `font_size=normal;session_id=3nU6Mffo9Z2h2ZfNe%2BooG9Lk%2BQ%2BYWVUbcAS0WL0uGFMZpVCa%2FFlsgQ%3D%3D.1627829250;deviceid_md5=eb8f70ea453e3e48a64026e06ad710fd;device_s=3nU6Mffo9Z2h2ZfNeooG9LkQYWVUbcAS0WL0uGFN1O3u7kGxfLvWZQ5HC%2Fn2TS1sHK9IjWA%3D;partner_id=1996;partner_name=izhihu96;phone_sort=XR;register_time=1575338725;device_id=3nU6Mffo9Z2h2ZfNe%2BooG9Lk%2BQ%2BYWVUbcAS0WL0uGFMZpVCa%2FFlsgQ%3D%3D;f=iphone;device_name=iPhone%20XR;latitude=477b37944b14026ac6c3fa99cba6d34f3ce4e135b27196f5;is_new_user=0;active_time=1583808829;v=10.1.5;device_smzdm_version_code=101;device_smzdm_version=10.1.5;longitude=cc50708ec7a25413cb86274a2ea465c12637ed59d33d4b41;device_system_version=14.6;sess=OWU1ZmF8MTU4MDUyMjcyNXwzMzg0OTAzMzI2fDEwNmRmMjZmZDlmYTFjMDAzZDM0NTU1Mjg3OTBkMmU5;client_id=3nU6Mffo9Z2h2ZfNe%2BooG9Lk%2BQ%2BYWVUbcAS0WL0uGFMZpVCa%2FFlsgQ%3D%3D.1575337975893;device_idfa=8j7VdzBpKMt0t%2Bmf0nLG1zB7QA89rP1ItFFPU45dn7lpb8blFx%2Byfw%3D%3D;idfa_md5=0;network=1;smzdm_id=3384903326;device_push=notifications_are_disabled;osversion=18F72;device_type=iPhone11%2C8;login=1;ab_test=f;device_smzdm=iphone;`,
'Accept' : `*/*`,
'request_key' : `247303961627829276`,
'Connection' : `keep-alive`,
'Content-Type' : `application/x-www-form-urlencoded`,
'Host' : `user-api.smzdm.com`,
'User-Agent' : `smzdm 10.1.5 rv:101 (iPhone XR; iOS 14.6; zh_CN)/iphone_smzdmapp/10.1.5`,
'Content-Encoding' : `gzip`,
'Accept-Language' : `zh-Hans-CN;q=1, zh-Hant-HK;q=0.9, zh-Hant-CN;q=0.8, en-CN;q=0.7, co-CN;q=0.6`,
'Accept-Encoding' : `gzip, deflate, br`
};
const body = `f=iphone&sign=7CC46B595DFF9E3E8786A8EE730563B6&time=1627831215&v=10.1.5&weixin=1`;

const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(myRequest).then(response => {
    if (response.body["error_code"] == "0") {
     $notify("什么值得买", "✅签到成功");
    } else {
      $notify("什么值得买", "❌签到失败");
    }
    $done();
}, reason => {
    console.log(reason.error);
    $notify("什么值得买","⚠️错误", reason.error)
    $done();
});
