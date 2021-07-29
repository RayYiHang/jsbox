let obj = JSON.parse($response.body);
delete obj["ad"];
$done({body:JSON.stringify(obj)});
