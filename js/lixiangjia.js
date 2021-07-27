let url = /api\.vistopia\.com\.cn\/api\/v1\/user\/profile/;
if (url.test($request.url)){
  let obj = {
   "status": "success",
   "data": {
     "id": "1920452",
     "phone": "13143444082",
     "is_password": "0",
     "open_id": "oAnghwkAWtRUuMQSD7nx4Pev--b0",
     "is_guest": "0",
     "register_time": "2021-07-22 21:15:42",
     "vip_type": "lixiangjia",
     "user_file": {
       "is_limited_show_date_txt": "",
       "vip_expire_days": "0",
       "vip_left_days": "9999",
       "first_order_price": "0.00",
       "vip_expire_date": "2029-07-25",
       "last_read_feedback_time": null,
       "user_id": "1920452",
       "nickname": "131****4082",
       "vip_type": "lixiangjia",
       "is_vip_expire": "0",
       "is_limited_show_date": "0",
       "old_vip_type": "",
       "avatar_url": "https://thirdwx.qlogo.cn/mmopen/vi_32/dicXgSdGMCAPDiaoQ5aFicoKQfNt4FX7lJBhkWaow0IfWXtaI3RicelaoXI0rbfd1wfiaZXS9sF73uGREMou0RzIkEw/132",
       "charge_content_total_price": "0.00",
       "id": "1920452",
       "unread_messages": "1",
       "was_friend_vip": "0",
       "coin": "0.00",
       "order_20_sum": "0.00",
       "last_active_time": "2021-07-22 21:15:44",
       "last_read_support_time": null,
       "is_friend_vip": "0",
       "charge_content_count": "0",
       "valid_listen_count": null,
       "introduction": "",
       "created_at": "2021-07-22 21:15:42",
       "mark": null,
       "last_read_reply_time": null,
       "free_content_count": "0",
       "last_read_rely_time": null,
       "comment_count": "0"
     },
     "api_token": "YZKPnokdXY0yoz0SIhrgind6oqQosmPB7uETqaRNfwTerKGklpvHcm0V31nWNTjP",
     "is_friend_vip": "0",
     "h5_open_id": null,
     "need_bind_phone": "0"
   }
 }
$done({body:JSON.stringify(obj)});
}
$done();
