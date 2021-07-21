/*https://cubox.pro/c/api/userPay*/

const obj = {
   "message" : "",
   "data" : {
     "nickName" : "雷 奕航",
     "thirdNickName" : "雷 奕航",
     "active" : true,
     "isThirdUser" : true,
     "thirdType" : null,
     "payTime" : "2021-01-01T08:00:00+08:00",
     "paymentSource" : 2,
     "admin" : false,
     "bind" : false,
     "thirdAccounts" : [
       {
         "userId" : null,
         "uid" : null,
         "id" : null,
         "appleEmail" : "leiyihang1234@163.com",
         "bind" : false,
         "token" : null,
         "type" : 1,
         "nickName" : "雷 奕航"
       }
     ],
     "id" : "ff8080817abd6850017abdba31ce0ea6",
     "level" : 1,
     "email" : null,
     "sync" : null,
     "mobile" : null,
     "isExpire" : false,
     "userName" : "leiyihang1234@163.com",
     "password" : null,
     "expireTime" : "2025-01-01T08:00:00+08:00",
     "weixinOpenid" : null,
     "receipt" : null
   },
   "code" : 200
 };
$done({body: JSON.stringify(obj)});
