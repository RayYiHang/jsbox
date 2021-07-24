let obj = JSON.parse($response.body);
let resultData = [];
obj["data"].forEach(function(obj) {
  if ("offset" in obj) {
    resultData.push(obj)
  }
});
obj["data"] = resultData;
$done({body:JSON.stringify(obj)});
