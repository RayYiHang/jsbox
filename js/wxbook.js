let body = JSON.parse($response.body);
delete body["hintsForRecharge"];
body["isPaying"] = 1;
body["payingRemainTime"] = 9627401599;
body["remainTime"] = 9627401599;
body["expiredTime"] = 9627401599;
body["permanent"] = 1;
body["totalFreeReadDay"] = 9999;
$done({body:JSON.stringify(body)});
