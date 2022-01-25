let modifiedStatus = 'HTTP/1.1 200 OK';
let obj = {"result":{"isActive":true,"platform":"apple"}}
$done({body:JSON.stringify(obj), statusCode: modifiedStatus});
