/* $response.statusCode =200 */
var obj = JSON.parse($response.body);
obj.errorCode = 0
obj.ok = true
obj.text = ""
$done({body:JSON.stringify(obj)});
