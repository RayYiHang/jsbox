let myStatus = 'HTTP/1.1 200 OK';
let obj = {"result":{"isActive":true,"platform":"apple"}};
let myHeaders = {"Date": "Tue, 25 Jan 2022 12:22:23 GMT", "Content-Type": "application/json; charset=utf-8", "Transfer-Encoding": "chunked", "Connection": "keep-alive", "Server": "nginx/1.16.1", "X-Powered-By": "Express", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS", "Access-Control-Allow-Headers": "X-Parse-Master-Key, X-Parse-REST-API-Key, X-Parse-Javascript-Key, X-Parse-Application-Id, X-Parse-Client-Version, X-Parse-Session-Token, X-Requested-With, X-Parse-Revocable-Session, Content-Type", "ETag": "W/'2f-YS9hHFTcqDQyoh647Jp22aoHg4w'", "Vary": "Accept-Encoding", "Content-Encoding": "gzip"};
const myResponse = {
    status: myStatus,
    headers: myHeaders,
    body: obj
};

$done(myResponse);
