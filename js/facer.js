var modifiedStatus = 'HTTP/1.1 200 OK';
let obj;
obj = ["result"]["isActive"] = true;
$done({body:JSON.stringify(obj), status: modifiedStatus});
