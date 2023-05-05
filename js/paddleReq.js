const requestBody = $request.body

const params = {};
requestBody.split('&').forEach(pair => {
  const [key, value] = pair.split('=');
  params[decodeURIComponent(key)] = decodeURIComponent(value);
});

$persistentStore.write(params.product_id,$request.id)

$done({})
