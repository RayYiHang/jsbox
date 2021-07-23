/*
[rewrite_local]
https://ars.alar.my/api/v2/user/sync

[mimt]
ars.alar.my
*/
let obj = {
   "env": "PROD",
   "userID": "B58AF73F-5063-4253-B577-894AD599153B",
   "subscription": [{
     "originalTransactionID": "300000884913078",
     "productID": "droom.sleepIfUCanFree.premium.yearly.4",
     "willAutoRenew": true,
     "isActive": true,
     "expiresDateMs": 9627653050000,
     "periodType": "PREMIUM",
     "latestPurchaseDateMs": 1627048250000,
     "originalPurchaseDateMs": 1627048250000
   }],
   "syncDateMs": JSON.parse($response.body)["syncDateMs"]
 };

$done({body:JSON.stringify(obj)});
