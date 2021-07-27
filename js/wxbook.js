let body = JSON.parse($response.body);
delete body["hintsForRecharge"];
body["isPaying"] = 1;
body["payingRemainTime"] = 9627401599;
body["remainTime"] = 9627401599;
body["expiredTime"] = 9627401599;
$done({body:JSON.stringify(body)});
