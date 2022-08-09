let obj = JSON.parse($response.body);
obj.string.replace(/false/g,'true');
$done({body:JSON.stringify(obj)});
