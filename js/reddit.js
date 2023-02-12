let obj = JSON.parse($response.body);
for( var i = 0; i < obj.length-1; i++){ 
   if ( obj["data"]["home"]["elements"]["edges"][i]["node"]["isCreatedFromAdsUi"] === true) {
     obj.data.home.elements.edges.splice(i, 1); 
   }
}
$done({body:JSON.stringify(obj)});
