let body = JSON.parse($response.body);
delete body["hintsForRecharge"];
body["isPaying"] = 1;
body["payingRemainTime"] = 99999;
body["remainTime"] = 99999;
body["expiredTime"] = 9627401599;
$done({body:JSON.stringify(body)});
