const requestBody = $request.body;
const params = {};
requestBody.split('&').forEach(pair => {
  const [key, value] = pair.split('=');
  params[decodeURIComponent(key)] = decodeURIComponent(value);
});
console.log(params.product_id); 

const obj = {
    "success": true,
    "response": {
        "product_id": params.product_id,
        "activation_id": "admin",
        "type": "personal",
        "expires": 1,
        "expiry_date": 1999999999999
    }
}
$done({body: JSON.stringify(obj)});
