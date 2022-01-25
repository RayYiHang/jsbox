let myStatus = 'HTTP/1.1 200 OK';
let obj = {"result":{"isActive":true,"platform":"apple"}}

const myResponse = {
    status: myStatus,
    body: obj
};

$done(myResponse);
