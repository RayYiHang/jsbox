
obj = {
   "request_date": "2021-07-15T15:09:52Z",
   "request_date_ms": 1626361792620,
   "subscriber": {
     "entitlements": {
       "pro": {
         "expires_date": "2025-07-22T14:59:35Z",
         "grace_period_expires_date": null,
         "product_identifier": "com.moneywiz.personalfinance",
         "purchase_date": "2021-07-15T14:59:35Z"
       }
     },
     "first_seen": "2021-07-15T11:23:59Z",
     "last_seen": "2021-07-15T11:23:59Z",
     "management_url": "itms-apps://apps.apple.com/account/subscriptions",
     "non_subscriptions": {},
     "original_app_user_id": "$RCAnonymousID:3333573777f64abab6ce284aec2b1bf2",
     "original_application_version": "92",
     "original_purchase_date": "2021-07-15T11:23:38Z",
     "other_purchases": {},
     "subscriptions": {
       "com.moneywiz.personalfinance": {
         "billing_issues_detected_at": null,
         "expires_date": "2025-07-22T14:59:35Z",
         "grace_period_expires_date": null,
         "is_sandbox": false,
         "original_purchase_date": "2021-07-15T14:59:36Z",
         "ownership_type": "PURCHASED",
         "period_type": "normal",
         "purchase_date": "2021-07-15T14:59:35Z",
         "store": "app_store",
         "unsubscribe_detected_at": null
       }
     }
   }
 };
$done({body:JSON.stringify(obj)});