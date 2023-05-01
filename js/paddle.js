var string = $request.body;
const requestBody = $request.body;
const params = new URLSearchParams(requestBody);
console.log(params.get('product_id')); 

const obj = {
    "success": true,
    "response": {
        "product_id": params.get('product_id'),
        "activation_id": "admin",
        "type": "personal",
        "expires": 1,
        "expiry_date": 1999999999999
    }
}
$done({body: JSON.stringify(obj)});
