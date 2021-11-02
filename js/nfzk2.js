let obj = JSON.parse($response.body);
obj["data"]["user"] = {
        "isview":true,
        "isdigg":true,
        "isNewsStand":2,
        "islogin":true,
        "expire_time":"2030-05-05",
        "isfav":true,
        "member_type":5
};
$done({body:JSON.stringify(obj)});
