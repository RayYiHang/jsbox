let obj = JSON.parse($response.body);
let resultData = obj["datas"].filter((item) => {
  return item["type"] != 1
})
obj["datas"] = resultData;
$done({body:JSON.stringify(obj)});
