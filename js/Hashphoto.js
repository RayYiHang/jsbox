var obj = JSON.parse($response.body);
var inapp = [{
        "quantity" : "1",
        "purchase_date_ms" : "1631631933000",
        "expires_date" : "2021-09-17 15:05:33 Etc/GMT",
        "expires_date_pst" : "2021-09-17 08:05:33 America/Los_Angeles",
        "is_in_intro_offer_period" : "false",
        "transaction_id" : "300000924722495",
        "is_trial_period" : "false",
        "original_transaction_id" : "300000924722495",
        "purchase_date" : "2021-09-14 15:05:33 Etc/GMT",
        "product_id" : "com.kobaltlab.HashPhotos",
        "original_purchase_date_pst" : "2021-09-14 08:05:33 America/Los_Angeles",
        "in_app_ownership_type" : "PURCHASED",
        "original_purchase_date_ms" : "1631631933000",
        "web_order_line_item_id" : "300000398984079",
        "expires_date_ms" : "1631891133000",
        "purchase_date_pst" : "2021-09-14 08:05:33 America/Los_Angeles",
        "original_purchase_date" : "2021-09-14 15:05:33 Etc/GMT"
      }];
obj["receipt"]["in_app"] = inapp;
$done({body:JSON.stringify(obj)});
