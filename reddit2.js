let obj = JSON.parse($response.body);
let resultData = [];
obj["data"]["home"]["elements"]["edges"].forEach(function(obj) {
  if (!obj["node"]["isCreatedFromAdsUi"]) {
    resultData.push(obj)
  }
});
obj["data"]["home"]["elements"]["edges"] = resultData;
$done({body:JSON.stringify(obj)});
