/* $response.statusCode =200 */
let obj = JSON.parse($response.body);
obj.errorCode = 0
obj.ok = true
obj.text = ""
$done(body:JSON.stringify(obj));
