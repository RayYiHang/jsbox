let obj = JSON.parse($response.body);
obj["subscriber"]["original_application_version"] = "49";
obj["subscriber"]["original_purchase_date"] = "2021-07-15T11:23:38Z";
obj["subscriber"]["subscriptions"] = {
       "atelerix_pro_lifetime" : {
         "is_sandbox" : false,
         "ownership_type" : "PURCHASED",
         "billing_issues_detected_at" : null,
         "period_type" : "trial",
         "expires_date" : "2029-08-11T12:33:17Z",
         "grace_period_expires_date" : null,
         "unsubscribe_detected_at" : "2021-07-15T15:08:38Z",
         "original_purchase_date" : "2021-07-15T14:59:36Z",
         "purchase_date" : "2021-07-15T14:59:35Z",
         "store" : "app_store"
       }
     };
obj["subscriber"]["entitlements"] = {
       "pro" : {
         "grace_period_expires_date" : null,
         "purchase_date" : "2021-07-15T14:59:35Z",
         "product_identifier" : "atelerix_pro_lifetime",
         "expires_date" : "2029-08-11T12:33:17Z"
       }
     }
$done({body:JSON.stringify(obj)});
