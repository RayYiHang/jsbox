let obj = $response.body;
obj["ACL"]["*"]["write"] = true;
$done({body: obj});
