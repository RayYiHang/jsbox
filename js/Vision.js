var obj = JSON.parse($response.body);
var subscriber = [{
"id" : "4ec05ff042",
"is_sandbox" : false,
"purchase_date" : "2021-07-15T14:59:35Z",
"original_purchase_date" : "2021-07-15T14:59:35Z",
"store" : "app_store"
}];
var entitlement = {
"grace_period_expires_date" : null,
"purchase_date" : "2021-07-15T14:59:35Z",
"product_identifier" : "vis_lifetime_unlock",
"expires_date" : null
};
obj["subscriber"]["non_subscriptions"]["vis_lifetime_unlock"] = subscriber;
obj["subscriber"]["entitlements"]["pro"] =entitlement;
$done({body:JSON.stringify(obj)});
