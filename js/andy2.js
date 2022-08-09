var body = $response.body.replace(/\"premium\": false/, '"premium": true')
$done({ body })
