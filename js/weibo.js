let obj = JSON.parse($response.body);
let resultData = obj["statuses"].filter((item) => {
  return item["readtimetype"] == "mblog"
})
obj["statuses"] = resultData;
$done({body:JSON.stringify(obj)});

