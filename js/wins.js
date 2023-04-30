var body = $response.body.replace(/.*?/, '{
  "success": true,
  "response": {
    "invoice_id": 1,
    "subscription_id": 1,
    "amount": "10.00",
    "currency": "USD",
    "payment_date": "2023-04-21",
    "receipt_url": "https://my.paddle.com/receipt/1-1/3-chre8a53a2724c6-42781cb91a",
    "status": "success"
  }
}');
$done({ body })
