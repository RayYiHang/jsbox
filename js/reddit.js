let obj = JSON.parse($response.body);
let resultData = obj["data"]["home"]["elements"]["edges"].filter((item) => !item["node"]["isCreatedFromAdsUi"]);
obj["data"]["home"]["elements"]["edges"] = resultData;
$done({body:JSON.stringify(obj)});
