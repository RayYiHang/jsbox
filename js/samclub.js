let obj = JSON.parse($response.body);
obj["data"]["userInfo"]["isMember"] = 1;
obj["data"]["userInfo"]["idType"] = 1;
obj["data"]["userInfo"]["blackFlag"] = true;
obj["data"]["userInfo"]["idCardNo"] = "181810910633";
$done({body:JSON.stringify(obj)});
