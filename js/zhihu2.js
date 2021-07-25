let obj = JSON.parse($response.body);
let resultData = obj["data"].filter((item) => "offset" in item);
obj["data"] = resultData;
$done({body:JSON.stringify(obj)});