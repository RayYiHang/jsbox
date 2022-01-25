let myStatus = 'HTTP/1.1 200 OK';
let obj = {"result":{"isActive":true,"platform":"apple"}};
let myHeaders = $response.headers;
const myResponse = {
    status: myStatus,
    headers: myHeaders,
    body: obj
};

$done(myResponse);
