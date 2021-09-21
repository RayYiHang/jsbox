// ==UserScript==
// @name              VIP 视频解析(优化增强版)
// @version           2.7.7
// @description       支持腾讯视频、爱奇艺、优酷、土豆、芒果TV、搜狐视频、乐视视频、PPTV、风行、华数TV、哔哩哔哩等，支持多个解析接口切换，支持视频自由选集，自动解析视频，支持自定义拖拽位置，支持视频广告跳过，支持页内页外解析，支持 Tampermonkey、Violentmonkey、Greasemonkey
// @author            sign
// @icon              data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA3LTIxVDEwOjUwOjE4KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNy0yMVQxMDo1OToyNiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNy0yMVQxMDo1OToyNiswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2M2YyZWUxZC0xZDdi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
// @namespace         https://greasyfork.org/users/665670
// @require           https://cdn.bootcss.com/jquery/3.5.1/jquery.min.js
// @match             *://v.qq.com/x/cover/*
// @match             *://v.qq.com/x/page/*
// @match             *://www.iqiyi.com/v*
// @match             *://v.youku.com/v_show/*
// @match             *://www.mgtv.com/b/*
// @match             *://tv.sohu.com/v/*
// @match             *://film.sohu.com/album/*
// @match             *://www.le.com/ptv/vplay/*
// @match             *://video.tudou.com/v/*
// @match             *://v.pptv.com/show/*
// @match             *://vip.pptv.com/show/*
// @match             *://www.fun.tv/vplay/*
// @match             *://www.acfun.cn/v/*
// @match             *://www.bilibili.com/video/*
// @match             *://www.bilibili.com/anime/*
// @match             *://www.bilibili.com/bangumi/play/*
// @match             *://vip.1905.com/play/*
// @match             *://www.wasu.cn/Play/show/*
// @match             *://www.56.com/*
// @license           GPL License
// @grant             unsafeWindow
// @grant             GM_openInTab
// @grant             GM.openInTab
// @grant             GM_getValue
// @grant             GM.getValue
// @grant             GM_setValue
// @grant             GM.setValue
// @grant             GM_xmlhttpRequest
// @grant             GM.xmlHttpRequest
// @grant             GM_registerMenuCommand
// @connect           iqiyi.com
// @connect           mgtv.com
// @connect           pl.hd.sohu.com
// ==/UserScript==

(function () {
    'use strict';
    var $ = $ || window.$;
    var log_count = 1;
    var host = location.host;
    var parseInterfaceList = [];
    var selectedInterfaceList = [];
    var originalInterfaceList = [
        { name:"B站解析", type:"1", url:"https://jx.yparse.com/index.php?url="},
        { name:"52", type:"1", url:"https://vip.52jiexi.top/?url="},
        { name:"百域", type:"1", url:"https://jx.618g.com/?url="},
        { name:"1717云", type:"1", url:"https://www.1717yun.com/jx/ty.php?url="},
        //--------------------------------------------------------------------------------------
        { name:"B站解析二", type:"0", url:"https://api.bingdou.net/?url="},
        { name:"1907", type:"0", url:"https://z1.m1907.cn/?jx="},
        { name:"百域", type:"0", url:"https://jx.618g.com/?url="},
        { name:"17云", type:"0", url:"https://www.1717yun.com/jx/ty.php?url="},
        { name:"CQ", type:"0", url:"https://cdn.yangju.vip/k/?url="},
        { name:"思古", type:"0", url:"https://api.sigujx.com/?url="},
        { name:"简傲", type:"0", url:"https://vip.jaoyun.com/index.php?url="},
        { name:"思古2", type:"0", url:"https://api.bbbbbb.me/jx/?url="},
        { name:"黑米", type:"0", url:"https://www.myxin.top/jx/api/?url="},
        { name:"石云", type:"0", url:"https://jiexi.071811.cc/jx.php?url="},
        { name:"凡凡", type:"0", url:"https://jx.wslmf.com/?url="},
        //{ name:"人人", type:"0", url:"https://vip.mpos.ren/v/?url="},
        { name:"金桥", type:"0", url:"https://jqaaa.com/jx.php?url="},
        { name:"通用", type:"0", url:"https://jx.598110.com/index.php?url="},
        { name:"初心", type:"0", url:"http://jx.bwcxy.com/?v="},,
        { name:"星空", type:"0", url:"https://jx.fo97.cn/?url="},
        { name:"小蒋极致", type:"0", url:"https://www.kpezp.cn/jlexi.php?url="},
        { name:"维多", type:"0", url:"https://jx.ivito.cn/?url="},
        //{ name:"927", type:"0", url:"https://api.927jx.com/vip/?url="},
        { name:"tv920", type:"0", url:"https://api.tv920.com/vip/?url="},
        { name:"89", type:"0", url:"https://www.ka61b.cn/jx.php?url="},
        { name:"豪华啦", type:"0", url:"https://api.lhh.la/vip/?url="},
        { name:"宿命", type:"0", url:"https://api.sumingys.com/index.php?url="},
        //{ name:"8B", type:"0", url:"https://api.8bjx.cn/?url="},
        { name:"千忆", type:"0", url:"https://v.qianyicp.com/v.php?url="},
        { name:"41", type:"0", url:"https://jx.f41.cc/?url="},
        { name:"ckmov", type:"0", url:"https://www.ckmov.vip/api.php?url="},
        { name:"517", type:"0", url:"https://cn.bjbanshan.cn/jx.php?url="},
        { name:"凉城", type:"0", url:"https://jx.mw0.cc/?url="},
        { name:"33t", type:"0", url:"https://www.33tn.cn/?url="},
        { name:"爸比云", type:"0", url:"https://jx.1ff1.cn/?url="},
        { name:"180", type:"0", url:"https://jx.000180.top/jx/?url="},
        { name:"ha12", type:"0", url:"https://py.ha12.xyz/sos/index.php?url="},
        { name:"无名", type:"0", url:"https://www.administratorw.com/video.php?url="},
        { name:"黑云", type:"0", url:"https://jiexi.380k.com/?url="},
        { name:"流氓凡", type:"0", url:"https://jx.wslmf.com/?url="},
        { name:"OK", type:"0", url:"https://okjx.cc/?url="},
        { name:"穷二代", type:"0", url:"https://jx.ejiafarm.com/dy.php?url="},
        { name:"二度", type:"0", url:"https://jx.du2.cc/?url="},
        { name:"bl解析", type:"0", url:"https://vip.bljiex.com/?v="},
        { name:"久播(明日)", type:"0", url:"https://jx.jiubojx.com/vip.php?url="},
        { name:"一起走吧", type:"0", url:"http://jiexi.yiqizouba.top/?url="},
        { name:"千叶", type:"0", url:"https://yi29f.cn/vip.php?url="},
        { name:"诺讯", type:"0", url:"https://www.nxflv.com/?url="},
        { name:"大幕", type:"0", url:"https://jx.52damu.com/dmjx/jiexi.php?url="},
        { name:"H8", type:"0", url:"https://www.h8jx.com/jiexi.php?url="},
        { name:"解析S", type:"0", url:"https://jx.jiexis.com/?url="},
    ];;

    //自定义 log 函数
    function mylog(param1, param2) {
        param1 = param1 ? param1 : "";
        param2 = param2 ? param2 : "";
        console.log("#" + log_count++ + "-VIP-log:", param1, param2);
    }

    //内嵌页内播放
    function innerParse(url) {
        $("#iframe-player").attr("src", url);
    }

    //兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
    function GMopenInTab(url, open_in_background) {
        if (typeof GM_openInTab === "function") {
            GM_openInTab(url, open_in_background);
        } else {
            GM.openInTab(url, open_in_background);
        }
    }

    //兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
    function GMgetValue(name, value) {
        if (typeof GM_getValue === "function") {
            return GM_getValue(name, value);
        } else {
            return GM.getValue(name, value);
        }
    }

    //兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
    function GMsetValue(name, value) {
        if (typeof GM_setValue === "function") {
            GM_setValue(name, value);
        } else {
            GM.setValue(name, value);
        }
    }

    //兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
    function GMxmlhttpRequest(obj) {
        if (typeof GM_xmlhttpRequest === "function") {
            GM_xmlhttpRequest(obj);
        } else {
            GM.xmlhttpRequest(obj);
        }
    }

    //兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
    function GMaddStyle(css) {
        var myStyle = document.createElement('style');
        myStyle.textContent = css;
        var doc = document.head || document.documentElement;
        doc.appendChild(myStyle);
    }

    //播放节点预处理
    var node = "";
    var player_nodes = [
        { url:"v.qq.com", node:"#mod_player"},
        { url:"www.iqiyi.com", node:"#flashbox"},
        { url:"v.youku.com", node:"#ykPlayer"},
        { url:"www.mgtv.com", node:"#mgtv-player-wrap container"},
        { url:"tv.sohu.com", node:"#player"},
        { url:"film.sohu.com", node:"#playerWrap"},
        { url:"www.le.com", node:"#le_playbox"},
        { url:"video.tudou.com", node:".td-playbox"},
        { url:"v.pptv.com", node:"#pptv_playpage_box"},
        { url:"vip.pptv.com", node:".w-video"},
        { url:"www.wasu.cn", node:"#flashContent"},
        { url:"www.fun.tv", node:"#html-video-player-layout"},
        { url:"www.acfun.cn", node:"#player"},
        { url:"www.bilibili.com", node:"#player_module"},
        { url:"vip.1905.com", node:"#player"},
        { url:"www.56.com", node:"#play_player"}
    ];
    for(var i in player_nodes) {
        if (player_nodes[i].url == host) {
            node = player_nodes[i].node;
        }
    }

    var videoPlayer = $("<div id='iframe-div' style='width:100%;height:100%;z-index:1000;'><iframe id='iframe-player' frameborder='0' allowfullscreen='true' width='100%' height='100%'></iframe></div>");
    var ImgBase64 =`
        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABB0lEQVR42r2VCw7CIAxAWzQuelsv4ml12XSAhZQFl0L3cWvSwFjhtRQKeu9bALgiCbDQmOfuQHqGuow2whpPpLajTlMAWNKTAhhthDU6zBbbRY
        4D7LRFfQ3geXJIoCM1PIYTQC3JrRZBfooGIRqcA4gThZ/R6zCegI7EmBBIjAY4ogSSAFZNcppEZg9q7jz84WgMKFIDvEkvuVcCKG0bqoBCknEKKICgsIZ6TKEE0GwPBYSzbpYCFm9RMUn/SnJmnO7Az+URPLaZfQI47ttx/pwcCFHm3w7KtU
        gFlB6c/AbXSsVqQC6bAGl/pSoKE5t1tWirHAJ4UXvb6UWLgJ5/NgJgmbfCg/MFf/07iXwnzokAAAAASUVORK5CYII=`;
    var sImgBase64=`
        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAgUlEQVR42t3UQQqAIBAF0EahE3S1buFtPEY3jGr8QgxEm5D5Cc7GlfP8jigTsVR1ESZQaxxAcF+Xa2ORgEUtAQB1BsQSpJRCzvmkAffqmsAgRt
        M+AHXIYwCsGgj4c8j1y4iNfW1vl2e6OgPbA2DVC0CS2ALjxMcnwD0BTjxD31lAAVVYNypdDsbLAAAAAElFTkSuQmCC`;

    // 视频解析预处理
    var innerList = [];
    var outerList = [];
    var innerli = "";
    var outerli = "";
    originalInterfaceList.forEach((item, index) => {
        if (item.type == "1") {
            innerList.push(item);
            innerli += "<li>" + item.name + "</li>";
        } else {
            outerList.push(item);
            outerli += "<li>" + item.name + "</li>";
        }
    });
    parseInterfaceList = innerList.concat(outerList);

    // 视频选集预处理
    function selectedList(episodeList) {
        var selectedList = [];
        var innerli = "";
        if (!!episodeList && episodeList.length != 0) {
            episodeList.sort((d1, d2) => { //升序排列
                return d1.name - d2.name;
            });
            episodeList.forEach((item, index) => {
                selectedList.push(item);
                innerli += "<li title='" + item.description + "'>" + item.name + "</li>";
            });
            $(".vip_mod_box_selected ul").empty();
            $(".vip_mod_box_selected ul").append(innerli);

            //视频选集事件处理
            $(".selected_text").on("mouseover", () => {
                $(".vip_mod_box_selected").show();
            });
            $(".selected_text").on("mouseout", () => {
                $(".vip_mod_box_selected").hide();
            });
            $(".vip_mod_box_selected li").each((index, item) => {
                item.addEventListener("click", () => {
                    if (document.getElementById("iframe-player") == null) {
                        var player = $(node);
                        player.empty();
                        player.append(videoPlayer);
                    }
                    var num = "";
                    if(host == "www.bilibili.com"){
                        num = 0;
                    }else{
                        num = Math.floor(Math.random() * 3 + 1); //使用随机接口
                    }
                    innerParse(parseInterfaceList[num].url + selectedList[index].href);
                });
            });
        }
    }

    //图片按钮定位
    var left = 0;
    var top = 100;
    var Position = GMgetValue("Position_" + host);
    if(!!Position){
        left = Position.left;
        top = Position.top;
    }
    GMaddStyle(`#vip_movie_box {cursor:pointer; position:fixed; top:` + top + `px; left:` + left + `px; width:29px; background-color:#FF4500; z-index:2147483647; font-size:12px; text-align:left;}
		        #vip_movie_box .item_text {width:28px; padding:4px 0px; text-align:center;}
		        #vip_movie_box .item_text img {width:22px; height:22px; display:inline-block; vertical-align:middle;}
                #vip_movie_box .vip_mod_box_action {display:none; position:absolute; left:28px; top:0; text-align:center; background-color:#272930; border:1px solid gray;}
                #vip_movie_box .vip_mod_box_action li{font-size:12px; color:#DCDCDC; text-align:center; width:60px; line-height:21px; float:left; border:1px solid gray; padding:0 4px; margin:4px 2px;}
                #vip_movie_box .vip_mod_box_action li:hover{color:#FF4500;}
		        #vip_movie_box .selected_text {width:28px; padding:4px 0px; text-align:center;}
		        #vip_movie_box .selected_text img {width:22px; height:22px;display:inline-block; vertical-align:middle;}
                #vip_movie_box .vip_mod_box_selected {display:none; position:absolute; left:28px; top:0; text-align:center; background-color:#272930; border:1px solid gray;}
                #vip_movie_box .vip_mod_box_selected ul{height:455px; overflow-y: scroll;}
                #vip_movie_box .vip_mod_box_selected li{font-size:14px; color:#DCDCDC; text-align:center; width:25px; line-height:27px; float:left; border:1px dashed gray; padding:0 4px; margin:4px 2px;}
                #vip_movie_box .vip_mod_box_selected li:hover{color:#FF4500;}`);

    var html = $(`<div id='vip_movie_box'>
                    <div class='item_text'>
                       <img src='`+ ImgBase64 +`' title='视频解析'/>
                       <div class='vip_mod_box_action' >
                         <div style='display:flex;'>
                           <div style='width:316px; padding:10px 0;'>
                             <div style='font-size:13px; text-align:center; color:#FFFFFF; line-height:21px;'>页内解析</div>
                             <ul style='margin:0 10px;'>
                               ` + innerli + `
                               <div style='clear:both;'></div>
                             </ul>
                             <div style='font-size:13px; text-align:center; color:#FFFFFF; line-height:21px;'>页外解析</div>
                             <ul style='margin:0 10px;'>
                               ` + outerli + `
                               <div style='clear:both;'></div>
                             </ul>
                           </div>
                         </div>
                       </div>
                    </div>
                    <div class='selected_text' >
                       <img src='`+ sImgBase64 +`' title='视频选集'/>
                       <div class='vip_mod_box_selected' >
                         <div style='display:flex;'>
                            <div style='width:316px; padding:10px 0;'>
                              <div style='font-size:13px; text-align:center; color:#FFFFFF; line-height:21px;'>视频列表</div>
                              <ul style='margin:0 10px;'></ul>
                           </div>
                         </div>
                       </div>
                    </div>
                 </div>`);

    $("body").append(html);

    //视频解析事件处理
    $(".item_text").on("mouseover", () => {
        $(".vip_mod_box_action").show();
    });
    $(".item_text").on("mouseout", () => {
        $(".vip_mod_box_action").hide();
    });
    $(".vip_mod_box_action li").each((index, item) => {
        item.addEventListener("click", () => {
            if (parseInterfaceList[index].type == "1") {
                if (document.getElementById("iframe-player") == null) {
                    var player = $(node);
                    player.empty();
                    player.append(videoPlayer);
                }
                innerParse(parseInterfaceList[index].url + location.href);
            } else {
                GMopenInTab(parseInterfaceList[index].url + location.href, false);
            }
        });
    });

    // 右键拖拽功能 - 防止与其他脚本干扰
    var movie_box = $("#vip_movie_box");
    movie_box.mousedown(function(e) {
        // 1 = 鼠标左键; 2 = 鼠标中键; 3 = 鼠标右键
        if (e.which == 3) {
            e.preventDefault() // 阻止默认行为
            movie_box.css("cursor", "move");//设置样式
            var positionDiv = $(this).offset();
            var distenceX = e.pageX - positionDiv.left;
            var distenceY = e.pageY - positionDiv.top;
            // 计算移动后的左偏移量 和 顶部的偏移量(防止超出边界)
            $(document).mousemove(function(e) {
                var x = e.pageX - distenceX;
                var y = e.pageY - distenceY;
                if (x < 0) {
                    x = 0;
                } else if (x > $(document).width() - movie_box.outerWidth(true)) {
                    x = $(document).width() - movie_box.outerWidth(true);
                }
                if (y < 0) {
                    y = 0;
                } else if (y > $(document).height() - movie_box.outerHeight(true)) {
                    y = $(document).height() - movie_box.outerHeight(true);
                }
                // 更新样式
                movie_box.css("left", x);
                movie_box.css("top", y);
                GMsetValue("Position_" + host,{ "left":x, "top":y});
            });
            $(document).mouseup(function() {
                $(document).off('mousemove');
                movie_box.css("cursor", "pointer");// 还原样式
            });
            $(document).contextmenu(function(e) {
                e.preventDefault();// 阻止右键菜单默认行为
            })
        }
    });

    //屏蔽网站广告 和 支持电视剧选集
    switch (host) {
        case 'www.iqiyi.com':
            //--------------------------------------------------------------------------------
            unsafeWindow.rate = 0; //视频广告加速
            unsafeWindow.Date.now = () => {
                return new unsafeWindow.Date().getTime() + (unsafeWindow.rate += 1000);
            }
            setInterval(() => {
                unsafeWindow.rate = 0;
            }, 600000);
            //--------------------------------------------------------------------------------
            setInterval(() => {
                if (document.getElementsByClassName("cupid-public-time")[0] != null) {
                    $(".skippable-after").css("display", "block");
                    document.getElementsByClassName("skippable-after")[0].click(); //屏蔽广告
                }
                $(".qy-player-vippay-popup").css("display", "none"); //移除会员提示
                $(".black-screen").css("display", "none"); //广告拦截提示
            }, 500);
            //选集
            setTimeout(() => {
                var episodeList = [];
                var i71playpagesdramalist = $("div[is='i71-play-ab']");
                if (i71playpagesdramalist.length != 0) {
                    var data = i71playpagesdramalist.attr(":page-info");
                    if (!!data) {
                        var dataJson = JSON.parse(data);
                        var albumId = dataJson.albumId;
                        var barlis = $(".qy-episode-tab").find(".bar-li");
                        var barTotal = barlis.length;
                        if(barTotal == 0){
                            barTotal = 1;
                        }
                        for (var page = 1; page <= barTotal; page++) {
                            GMxmlhttpRequest({
                                url: "https://pcw-api.iqiyi.com/albums/album/avlistinfo?aid=" + albumId + "&page=" + page + "&size=30",
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                onload: response => {
                                    var status = response.status;
                                    if (status == 200 || status == '200') {
                                        var serverResponseJson = JSON.parse(response.responseText);
                                        var code = serverResponseJson.code;
                                        if (code == "A00000") {
                                            var serverEpsodelist = serverResponseJson.data.epsodelist;
                                            //console.log(serverEpsodelist)
                                            for (var i = 0; i < serverEpsodelist.length; i++) {
                                                var name = serverEpsodelist[i].order;
                                                var href = serverEpsodelist[i].playUrl;
                                                var description = serverEpsodelist[i].subtitle;
                                                episodeList.push({
                                                    "name": name,
                                                    "href": href,
                                                    "description": description
                                                });
                                                //mylog({"name":name, "href":href, "description":description});
                                            }
                                            selectedList(episodeList);
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            },2000);
            break
        case 'v.qq.com':
            //--------------------------------------------------------------------------------
            setInterval(() => { //视频广告加速
                $(".txp_ad").find("txpdiv").find("video")[0].currentTime = 100;
                $(".txp_ad").find("txpdiv").find("video")[1].currentTime = 100;
            }, 100)
            //--------------------------------------------------------------------------------
            setInterval(() => {
                var txp_btn_volume = $(".txp_btn_volume"); //打开声音
                if (txp_btn_volume.attr("data-status") === "mute") {
                    $(".txp_popup_volume").css("display", "block");
                    txp_btn_volume.click();
                    $(".txp_popup_volume").css("display", "none");
                }
                //$("txpdiv[data-role='hd-ad-adapter-adlayer']").attr("class", "txp_none"); //屏蔽广告
                $(".mod_vip_popup").css("display", "none"); //移除会员提示
                $(".tvip_layer").css("display", "none"); //遮罩层
                $("#mask_layer").css("display", "none"); //遮罩层
            }, 500);
            //选集
            window.onload = setTimeout(() => {
                var episodeList = [];
                var COVER_INFO = unsafeWindow.COVER_INFO;
                var VIDEO_INFO = unsafeWindow.VIDEO_INFO;
                var barTotal = COVER_INFO.nomal_ids.length;
                for (var page = 1; page <= barTotal; page++) {
                    var i = page - 1
                    if (VIDEO_INFO.type_name == "动漫" || VIDEO_INFO.type_name == "电视剧" || VIDEO_INFO.type_name == "电影") {
                        var F = COVER_INFO.nomal_ids[i].F;
                        if(F != "0" && F != "4"){
                            var V = COVER_INFO.nomal_ids[i].V;
                            var cover_id = COVER_INFO.cover_id;
                            var name = COVER_INFO.nomal_ids[i].E;
                            var href = "https://v.qq.com/x/cover/" + cover_id + "/"+ V + ".html";
                            episodeList.push({
                                "name": name,
                                "href": href,
                                "description": ""
                            });
                            //mylog({"name":name, "href":href, "description":""});
                        }
                    }
                }
                selectedList(episodeList);
            }, 2000);
            break
        case 'v.youku.com':
            //--------------------------------------------------------------------------------
            window.onload = function () { //视频广告加速
                if (!document.querySelectorAll('video')[0]) {
                    setInterval(() => {
                        document.querySelectorAll('video')[1].playbackRate = 16;
                    }, 100)
                }
            }
            //--------------------------------------------------------------------------------
            setInterval(() => {
                var H5 = $(".h5-ext-layer").find("div")
                if(H5.length != 0){
                    $(".h5-ext-layer div").remove(); //屏蔽广告
                    var control_btn_play = $(".control-left-grid .control-play-icon"); //自动播放
                    if (control_btn_play.attr("data-tip") === "播放") {
                        $(".h5player-dashboard").css("display", "block"); //显示控制层
                        control_btn_play.click();
                        $(".h5player-dashboard").css("display", "none"); //隐藏控制层
                    }
                }
                $(".information-tips").css("display", "none"); //信息提示
            }, 500);
            //选集
            window.onload = setTimeout(() => {
                var Num;
                var episodeList = [];
                var videoCategory = unsafeWindow.__INITIAL_DATA__.data.data.data.extra.videoCategory;
                if(videoCategory == "动漫" || videoCategory == "电影" || videoCategory == "少儿"){
                    Num = 1;
                } else if(videoCategory == "电视剧" || videoCategory == "综艺"){
                    Num = 2;
                }
                if (!!Num){
                    var data = unsafeWindow.__INITIAL_DATA__.data.model.detail.data.nodes[0].nodes[Num];
                    var barTotal = data.nodes.length;
                    for (var page = 1; page <= barTotal; page++) {
                        var i = page - 1
                        if(data.nodes[i].data.videoType == "正片"){
                            if(videoCategory == "综艺" || videoCategory == "少儿"){
                                var name = i + 1;
                            }else{
                                name = data.nodes[i].data.stage;
                            }
                            var vid = data.nodes[i].data.action.value;
                            var title = data.nodes[i].data.title;
                            var href = "https://v.youku.com/v_show/id_" + vid + ".html";
                            episodeList.push({
                                "name": name,
                                "href": href,
                                "description": title
                            });
                            //mylog({"name":name, "href":href, "description":title});
                        }
                    }
                    selectedList(episodeList);
                }
            },2000);
            break
        case 'www.mgtv.com':
            //选集
            setTimeout(() => {
                var episodeList = [];
                var str = location.href;
                var index = str .lastIndexOf("\/");//斜杠 分割
                str = str.substring(index + 1, str.length);
                index = str.lastIndexOf(".html");
                var albumId = str.substring(0, index);
                //mylog(albumId)
                var barlis = $(".episode-header").find("a");
                var barTotal = barlis.length;
                if(barTotal == 0){
                    barTotal = 1;
                }
                for (var page = 1; page <= barTotal; page++) {
                    GMxmlhttpRequest({
                        url: "https://pcweb.api.mgtv.com/episode/list?_support=10000000&video_id=" + albumId + "&page=" + page + "&size=30",
                        method: "GET",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        onload: response => {
                            var status = response.status;
                            if (status == 200 || status == '200') {
                                var serverResponseJson = JSON.parse(response.responseText);
                                var code = serverResponseJson.code;
                                if (code == "200") {
                                    var serverEpsodelist = serverResponseJson.data.list;
                                    //mylog(serverEpsodelist)
                                    for (var i = 0; i < serverEpsodelist.length; i++) {
                                        var font = serverEpsodelist[i].corner[0].font;
                                        if(font != "预告"){
                                            var name = serverEpsodelist[i].t1;
                                            var href = serverEpsodelist[i].url;
                                            href = "https://www.mgtv.com" + href;
                                            var description = serverEpsodelist[i].t2;
                                            episodeList.push({
                                                "name": name,
                                                "href": href,
                                                "description": description
                                            });
                                            //mylog({"name":name, "href":href, "description":description});
                                        }
                                    }
                                    selectedList(episodeList);
                                }
                            }
                        }
                    });
                }
            },2000);
            break
        case 'tv.sohu.com':
            setInterval(() => {
                $(".x-video-adv").css("display", "none");//屏蔽广告
                $(".x-player-mask").css("display", "none");//广告提示
                $("#player_vipTips").css("display", "none");//移除会员提示
            }, 500);
            //选集
            window.onload = setTimeout(() => {
                var episodeList = [];
                var albumId = unsafeWindow.playlistId;
                var barTotal = 1;
                for (var page = 1; page <= barTotal; page++) {
                    GMxmlhttpRequest({
                        url: "https://pl.hd.sohu.com/videolist?playlistid=" + albumId + "&pagenum=1&pagesize=999",
                        method: "GET",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        onload: response => {
                            var status = response.status;
                            if (status == 200 || status == '200') {
                                var serverResponseJson = JSON.parse(response.responseText);
                                var serverEpsodelist = serverResponseJson.videos;
                                for (var i = 0; i < serverEpsodelist.length; i++) {
                                    var name = serverEpsodelist[i].order;
                                    var href = serverEpsodelist[i].pageUrl;
                                    var description = serverEpsodelist[i].name;
                                    episodeList.push({
                                        "name": name,
                                        "href": href,
                                        "description": description
                                    });
                                    //mylog({"name":name, "href":href, "description":description});
                                }
                                selectedList(episodeList);
                            }
                        }
                    });
                }
            },2000);
            break
        case 'www.fun.tv':
            setTimeout(() => {
                var control_btn_play = $(".fxp-controlbar .btn-toggle"); //自动播放
                if (control_btn_play.is('.btn-play')) {
                    control_btn_play.click();
                }
            }, 500);
            setInterval(() => {
                $("#play-Panel-Wrap").css("display", "none");//移除会员提示
            }, 500);
            //选集
            window.onload = setTimeout(() => {
                var episodeList = [];
                var data = unsafeWindow.vplayInfo.dvideos[0];
                var barTotal = data.videos.length;
                for (var page = 1; page <= barTotal; page++) {
                    var lists = data.videos[page-1].lists.length;
                    for (var i = 1; i <= lists; i++) {
                        var name = data.videos[page-1].lists[i-1].title;
                        var url = data.videos[page-1].lists[i-1].url;
                        var title = data.videos[page-1].lists[i-1].name;
                        var dtype = data.videos[page-1].lists[i-1].dtype;
                        if (!!name && !!url && dtype == "normal") {
                            var href = "http://www.fun.tv" + url;
                            episodeList.push({
                                "name": name,
                                "href": href,
                                "description": title
                            });
                            //mylog({"name":name, "href":href, "description":title});
                        }
                        selectedList(episodeList);
                    }
                }
            }, 2000);
            break
        case 'www.bilibili.com':
            setInterval(() => {
                $(".player-limit-mask").remove();//移除会员提示
            }, 500);
            //选集
            window.onload = setTimeout(() => {
                var episodeList = [];
                var data = unsafeWindow.__INITIAL_STATE__;
                var barTotal = data.epList.length;
                for (var page = 1; page <= barTotal; page++) {
                    var i = page - 1
                    var badge = data.epList[i].badge
                    var name = data.epList[i].title;
                    var id = data.epList[i].id;
                    var title = data.epList[i].longTitle;
                    if (!!name && !!id && badge != "预告") {
                        var href = "https://www.bilibili.com/bangumi/play/ep" + id;
                        episodeList.push({
                            "name": name,
                            "href": href,
                            "description": title
                        });
                    }
                    //mylog({"name":name, "href":href, "description":title});
                }
                selectedList(episodeList);
            }, 2000);
            break
        case 'v.pptv.com':
            //选集
            window.onload = setTimeout(() => {
                var episodeList = [];
                var data = unsafeWindow.webcfg;
                var dataJson = data.playList.data;
                var barTotal = dataJson.list.length;
                for (var page = 1; page <= barTotal; page++) {
                    var i = page - 1
                    var name = dataJson.list[i].rank + 1;
                    var href = dataJson.list[i].url;
                    var title = dataJson.list[i].title;
                    if (!!name && !!href) {
                        episodeList.push({
                            "name": name,
                            "href": href,
                            "description": title
                        });
                    }
                    //mylog({"name":name, "href":href, "description":title});
                }
                selectedList(episodeList);
            }, 2000);
            break
        default:
            break
    }
})();
