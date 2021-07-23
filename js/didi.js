/*
[rewrite_local]
https://dida365.com/api/v2/user/status

[mimt]
dida365.com
*/
let obj = {
   "userId" : "1011834019",
   "proEndDate" : "2029-01-26T07:54:10.000+0000",
   "pro" : true,
   "ds" : false,
   "needSubscribe" : false,
   "username" : "leiyihang1234@163.com",
   "teamUser" : false,
   "proStartDate" : "2018-12-26T07:54:10.000+0000",
   "activeTeamUser" : false,
   "inboxId" : "inbox1011834019",
   "freeTrial" : false
 };
$done({body:JSON.stringify(obj)});
