let obj = JSON.parse($response.body);
delete obj["reward_info"];
$done({body:JSON.stringify(obj)});