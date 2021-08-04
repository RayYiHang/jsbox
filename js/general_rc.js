let obj = {
   "request_date_ms":1628081722349,
   "request_date":"2021-08-04T12:55:22Z",
   "subscriber":{
     "non_subscriptions":{
 
     },
     "first_seen":"2021-07-15T11:23:59Z",
     "original_application_version":"49",
     "other_purchases":{
 
     },
     "management_url":null,
     "subscriptions":{
       "atelerix_pro_lifetime":{
         "is_sandbox":false,
         "ownership_type":"PURCHASED",
         "billing_issues_detected_at":null,
         "period_type":"purchase",
         "expires_date":"2029-08-11T12:33:17Z",
         "grace_period_expires_date":null,
         "unsubscribe_detected_at":"2021-07-15T15:08:38Z",
         "original_purchase_date":"2021-07-15T14:59:36Z",
         "purchase_date":"2021-07-15T14:59:35Z",
         "store":"app_store"
       }
     },
     "entitlements":{
       "pro":{
         "grace_period_expires_date":null,
         "purchase_date":"2021-07-15T14:59:35Z",
         "product_identifier":"atelerix_pro_lifetime",
         "expires_date":"2029-08-11T12:33:17Z"
       }
     },
     "original_purchase_date":"2021-07-15T11:23:38Z",
     "original_app_user_id":"$RCAnonymousID:87076e02b2ed41ce9c5fbc0a0e0ac4e5",
     "last_seen":"2021-07-26T04:19:56Z"
   }
 };

$done({body:JSON.stringify(obj)});
