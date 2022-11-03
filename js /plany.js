var obj = JSON.parse($response.body);
var subscriber = [{
"is_sandbox" : false,
"ownership_type" : "PURCHASED",
"billing_issues_detected_at" : null,
"period_type" : "purchase",
"expires_date" : "2029-08-11T12:33:17Z",
"grace_period_expires_date" : null,
"unsubscribe_detected_at" : "2021-07-15T15:08:38Z",
"original_purchase_date" : "2021-07-15T14:59:36Z",
"purchase_date" : "2021-07-15T14:59:35Z",
"store" : "app_store"
       }];
var entitlement = {
"grace_period_expires_date" : null,
"purchase_date" : "2021-07-15T14:59:35Z",
"product_identifier" : "com.kevinreutter.Sagittarius.PremiumLifetime",
"expires_date": "2029-08-11T12:33:17Z"
};
obj["subscriber"]["subscriptions"]["com.kevinreutter.Sagittarius.PremiumLifetime"] = subscriber;
obj["subscriber"]["entitlements"]["pro"] = entitlement;
$done({body:JSON.stringify(obj)});
