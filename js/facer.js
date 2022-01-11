let obj = JSON.parse($response.body);
obj["rolesArray"][0] = "All Access";
$done({body:JSON.stringify(obj)});
