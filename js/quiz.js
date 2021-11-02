let obj = JSON.parse($response.body);
obj["responses"][0]["models"]["user"][0]["type"] = 1;
//obj["responses"][0]["models"]["user"][0]["_isEligibleForFreeTrial"] = false;
$done({body:JSON.stringify(obj)});
