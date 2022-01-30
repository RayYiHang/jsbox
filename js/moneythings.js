var obj = JSON.parse($response.body);
var subscriber = [{
"billing_issues_detected_at": null, "expires_date": "2023-10-07T04:30:37Z", "grace_period_expires_date": null, "is_sandbox": false, "original_purchase_date":"2021-09-07T04:30:39Z",
"ownership_type": "PURCHASED", "period_type": "normal",
"purchase_date": "2021-09-07T04:30:37Z",
"store": "app_store",
}];
var entitlement = {
"expires_date": "2023-10-07T04:30:37Z", "grace_period_expires_date": null, "product_identifier":"com.lishaohui.cashflow.monthlysubscription", "purchase_date": "2021-09-07T04:30:37Z"
};
obj["subscriber"]["subscriptions"]["com.lishaohui.cashflow.monthlysubscription"] = subscriber;
obj["subscriber"]["entitlements"]["Premium"] = entitlement;
$done({body:JSON.stringify(obj)});
