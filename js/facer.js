let obj = JSON.parse($response.body);
obj["ACL"]["*"]["write"] = true;
$done({body:JSON.stringify(obj)});
