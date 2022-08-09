let obj = JSON.parse($response.body);
obj.str.replace(/false/g,'true');
$done({body:JSON.stringify(obj)});
