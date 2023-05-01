let str = JSON.stringify($request.body);
console.log(str);
const regex = /product_id=(\d{6})/g;
const matches = str.match(regex);

console.log(matches); // ["123abc", "456def", "789ghi"]
const obj = {
    "success": true,
    "response": {
        "product_id": matches[1],
        "activation_id": "admin",
        "type": "personal",
        "expires": 1,
        "expiry_date": 1999999999999
    }
}
$done({body: JSON.stringify(obj)});