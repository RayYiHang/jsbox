const obj = {
    "success": true,
    "response": {
        "product_id": $persistentStore.read($request.id),
        "activation_id": "admin",
        "type": "personal",
        "expires": 1,
        "expiry_date": 1999999999999
    }
}
$done({body:JSON.stringify(obj)});
