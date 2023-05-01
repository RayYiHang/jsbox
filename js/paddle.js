const requestBody = $request;
console.log(typeof requestBody)
console.log(requestBody)




const obj = {
    "success": true,
    "response": {
        "product_id": 827382,
        "activation_id": "admin",
        "type": "personal",
        "expires": 1,
        "expiry_date": 1999999999999
    }
}
$done({body: JSON.stringify(obj)});
