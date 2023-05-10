var obj = {
    "success": true,
    "status": true,
    "name": "John Doe",
    "expiration_date": "2029-12-31",
    "features": [
        "feature1",
        "feature2",
        "feature3"
    ]
}
$done({body:JSON.stringify(obj)});
