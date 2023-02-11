let obj = JSON.parse($response.body);
let obj["data"]["home"]["elements"]["edges"] = obj["data"]["home"]["elements"]["edges"].filter((item) => !item["node"]["isCreatedFromAdsUi"]);
$done({body:JSON.stringify(obj)});
