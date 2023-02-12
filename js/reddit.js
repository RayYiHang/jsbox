let res = JSON.parse($response.body);
if (res["data"]["home"]) {
let obj = res["data"]["home"]["elements"]["edges"]
for( var i = 0; i < obj.length-1; i++){ 
   if ( obj[i]["node"]["isCreatedFromAdsUi"] === true) {
     obj.splice(i, 1); 
   }
}
res["data"]["home"]["elements"]["edges"] = obj;
$done({body:JSON.stringify(res)});
}
$done()
