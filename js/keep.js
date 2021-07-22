/* $response.statusCode =200 */
let obj = JSON.parse($response.body);
obj.data["errorCode"] = 0
obj.data["ok"] = true
obj.data.text = ""
$done({body:JSON.stringify(obj)});
