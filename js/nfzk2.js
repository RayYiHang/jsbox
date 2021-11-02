let obj = JSON.parse($response.body);
obj["data"]["user"] = {"islogin":true,"isview":true,"isNewsStand":2,"member_type":5,"expire_time":"2030-05-05","isdigg":true,"isfav":true};
$done({body:JSON.stringify(obj)});
