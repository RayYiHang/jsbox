let res = JSON.parse($response.body);
let resultData = res["data"]["home"]["elements"]["edges"].filter((item) => !item["node"]["isCreatedFromAdsUi"]);
res["data"]["home"]["elements"]["edges"] = resultData;
}
$done({body:JSON.stringify(res)});
