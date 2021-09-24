// ==UserScript==
// @name         自动无缝翻页
// @version      2.4.5
// @author       X.I.U
// @description  无缝拼接下一页内容（瀑布流），目前支持：[所有使用「Discuz!、Flarum、DUX(WordPress)」的网站]、百度、谷歌、必应、搜狗、头条、360、微信、贴吧、豆瓣、微博、NGA、V2EX、龙的天空、起点小说、煎蛋网、IT之家、千图网、Pixabay、3DM、游侠网、游民星空、NexusMods、Steam 创意工坊、小霸王其乐无穷、CS.RIN.RU、FitGirl、茶杯狐、NO视频、低端影视、奈菲影视、91美剧网、真不卡影院、片库、音范丝、BT之家、萌番组、动漫花园、樱花动漫、爱恋动漫、AGE 动漫、Nyaa、SrkBT、RARBG、SubHD、423Down、不死鸟、扩展迷、极简插件、小众软件、动漫狂、漫画猫、漫画DB、HiComic、动漫之家、古风漫画网、PubMed、wikiHow、GreasyFork、Github、StackOverflow（以上仅一部分，更多的写不下了...
// @match        *://*/*
// @connect      www.gamersky.com
// @icon         https://i.loli.net/2021/03/07/rdijeYm83pznxWq.png
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        unsafeWindow
// @license      GPL-3.0 License
// @run-at       document-end
// @namespace    https://github.com/XIU2/UserScript
// @supportURL   https://github.com/XIU2/UserScript
// @homepageURL  https://github.com/XIU2/UserScript
// ==/UserScript==

(function() {
    'use strict';
    var menuAll = [
        ['menu_disable', '✅ 已启用 (点击对当前网站禁用)', '❌ 已禁用 (点击对当前网站启用)', ['✅ 已启用 (点击对当前网站禁用)']],
        ['menu_discuz_thread_page', '帖子内自动翻页 (仅论坛)', '帖子内自动翻页 (仅论坛)', true],
        ['menu_page_number', '显示当前页码及点击暂停翻页', '显示当前页码及点击暂停翻页', true],
        ['menu_pause_page', '左键双击网页空白处暂停翻页', '左键双击网页空白处暂停翻页', false]
    ], menuId = [], webType = 0, curSite = {SiteTypeID: 0}, DBSite, SiteType, pausePage = true, pageNum = {now: 1, _now: 1}, locationchange = false, nowLocation = '', forumWebsite = ['cs.rin.ru', 'www.flyert.com', 'bbs.pediy.com', 'www.libaclub.com'];
    for (let i=0;i<menuAll.length;i++){ // 如果读取到的值为 null 就写入默认值
        if (GM_getValue(menuAll[i][0]) == null){GM_setValue(menuAll[i][0], menuAll[i][3])};
    }
    registerMenuCommand();
    if (menuId.length < 2) {return}
    // 注册脚本菜单
    function registerMenuCommand() {
        if (menuId.length != []){
            for (let i=0;i<menuId.length;i++){
                GM_unregisterMenuCommand(menuId[i]);
            }
        }
        for (let i=0;i<menuAll.length;i++) { // 循环注册脚本菜单
            menuAll[i][3] = GM_getValue(menuAll[i][0]);
            if (menuAll[i][0] === 'menu_disable') { // 启用/禁用

                if (menu_disable('check')) { // 当前网站在禁用列表中
                    menuId[i] = GM_registerMenuCommand(`${menuAll[i][2]}`, function(){menu_disable('del')});
                    return
                } else { // // 不在禁用列表中
                    webType = doesItSupport(); // 判断网站类型（即是否支持），顺便直接赋值
                    if (webType === 0) {
                        GM_registerMenuCommand('❌ 当前网站暂不支持 [点击申请支持]', function () {window.GM_openInTab('https://github.com/XIU2/UserScript#xiu2userscript', {active: true,insert: true,setParent: true});window.GM_openInTab('https://greasyfork.org/zh-CN/scripts/419215/feedback', {active: true,insert: true,setParent: true});});
                        console.info('[自动无缝翻页] - 不支持当前网站 [ ' + location.href + ' ]，欢迎申请支持: https://github.com/XIU2/UserScript / https://greasyfork.org/zh-CN/scripts/96880/feedback');
                        return
                    } else if (webType === -1) {
                        return
                    }
                    menuId[i] = GM_registerMenuCommand(`${menuAll[i][1]}`, function(){menu_disable('add')});
                }

            } else if (menuAll[i][0] === 'menu_discuz_thread_page') { // 帖子内自动翻页 (仅论坛)

                if (webType === 2 || forumWebsite.indexOf(location.host) > -1) {
                    menuId[i] = GM_registerMenuCommand(`${menuAll[i][3]?'✅':'❌'} ${menuAll[i][1]}`, function(){menu_switch(menuAll[i][3], menuAll[i][0], menuAll[i][2])});
                }

            } else {
                menuId[i] = GM_registerMenuCommand(`${menuAll[i][3]?'✅':'❌'} ${menuAll[i][1]}`, function(){menu_switch(menuAll[i][3], menuAll[i][0], menuAll[i][2])});
            }
        }
        menuId[menuId.length] = GM_registerMenuCommand('💬 反馈 & 欢迎申请支持', function () {window.GM_openInTab('https://github.com/XIU2/UserScript#xiu2userscript', {active: true,insert: true,setParent: true});window.GM_openInTab('https://greasyfork.org/zh-CN/scripts/419215/feedback', {active: true,insert: true,setParent: true});});
    }

    // 网站规则
    function setDBSite() {
    /*
    自动翻页规则
    locationchange: 对于使用 pjax 技术的网站，需要监听 URL 变化来重新判断翻页规则
    type：
      1 = 由脚本实现自动无缝翻页
      2 = 网站自带了自动无缝翻页功能，只需要点击下一页按钮即可
          nextText: 按钮文本，当按钮文本 = 该文本时，才会点击按钮加载下一页（避免一瞬间加载太多次下一页）
          nextTextOf: 按钮文本的一部分，当按钮文本包含该文本时，才会点击按钮加载下一页（避免一瞬间加载太多次下一页）
          nextHTML: 按钮内元素，当按钮内元素 = 该元素内容时，才会点击按钮加载下一页（避免一瞬间加载太多次下一页）
          intervals: 点击间隔时间，对于没有按钮文字变化的按钮，可以手动指定间隔时间，单位：ms
      3 = 依靠元素距离可视区域底部的距离来触发翻页
      4 = 部分简单的动态加载类网站（暂时）
    insertPosition：
      1 = 插入该元素本身的前面；
      2 = 插入该元素当中，第一个子元素前面；
      3 = 插入该元素当中，最后一个子元素后面；
      4 = 插入该元素本身的后面；
    mimeType: 网站编码
    scriptType: 单独插入 <script> 标签
      1 = 下一页的所有 <script> 标签
      2 = 下一页主体元素同级 <script> 标签
      3 = 下一页主体元素同级 <script> 标签（远程文件）
      4 = 下一页主体元素子元素 <script> 标签
    history: 添加历史记录 并 修改当前 URL
    scrollDelta：数值越大，滚动条触发点越靠上（越早开始翻页），一般是访问网页速度越慢，该值就需要越大（如果 Type = 3，则相反）
    function：
      before = 插入前执行函数；
      after = 插入后执行函数；
      parameter = 参数
    */
        DBSite = {
            discuz_forum: {
                SiteTypeID: 0,
                pager: {
                    type: 2,
                    nextLink: '#autopbn',
                    nextTextOf: '下一页',
                    scrollDelta: 1500
                }
            }, //       Discuz! - 各版块帖子列表（自带无缝加载下一页按钮的）
            discuz_guide: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))] | //a[@class="next"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;#threadlist table > tbody[id^="normalthread_"]',
                    insertPosition: ['id("threadlist")//table/tbody[starts-with(@id, "normalthread_")]/parent::table', 3],
                    replaceE: 'css;.pg, .pages',
                    scrollDelta: 1000
                }
            }, //       Discuz! - 导读页 及 各版块帖子列表（不带无缝加载下一页按钮的）
            discuz_waterfall: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))] | //a[@class="next"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;#waterfall > li',
                    insertPosition: ['css;#waterfall', 3],
                    replaceE: 'css;.pg, .pages',
                    scrollDelta: 1000
                }
            }, //   Discuz! - 图片模式的各版块帖子列表（不带无缝加载下一页按钮的）
            discuz_thread: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))] | //a[@class="next"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;#postlist > div[id^="post_"]',
                    insertPosition: ['css;#postlist', 3],
                    replaceE: 'css;.pg, .pages',
                    scrollDelta: 1000
                },
                function: {
                    before: discuz_thread_functionBefore
                }
            }, //      Discuz! - 帖子内
            discuz_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))] | //a[@class="next"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;#threadlist > ul',
                    insertPosition: ['css;#threadlist', 3],
                    replaceE: 'css;.pg, .pages',
                    scrollDelta: 1000
                }
            }, //      Discuz! - 搜索页
            discuz_youspace: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))] | //a[@class="next"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;tbody > tr:not(.th)',
                    insertPosition: ['css;tbody', 3],
                    replaceE: 'css;.pg, .pages',
                    scrollDelta: 1000
                }
            }, //    Discuz! - 回复页、主题页（别人的）
            discuz_collection: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))] | //a[@class="next"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;#ct .bm_c table > tbody',
                    insertPosition: ['css;#ct .bm_c table', 3],
                    replaceE: 'css;.pg, .pages',
                    scrollDelta: 1000
                }
            }, //  Discuz! - 淘帖页
            flarum: {
                SiteTypeID: 0,
                pager: {
                    type: 2,
                    nextLink: '.DiscussionList-loadMore > button[title]',
                    scrollDelta: 1000
                }
            },
            dux: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//li[@class="next-page"]/a[@href]',
                    pageElement: 'css;.content > article',
                    insertPosition: ['css;.content > .pagination', 1],
                    replaceE: 'css;.content > .pagination',
                    scrollDelta: 1500
                },
                function: {
                    before: dux_functionBefore
                }
            }, //                一种 WordPress 主题
            baidu: {
                SiteTypeID: 0,
                host: 'www.baidu.com',
                functionStart: function() {curSite = DBSite.baidu; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.new-pmd .c-img-border {position: initial !important;} .op-bk-polysemy-video__wrap.c-gap-bottom {display: none !important;}';},
                pager: {
                    type: 1,
                    nextLink: 'id("page")//a[contains(text(),"下一页")][@href]',
                    pageElement: 'css;#content_left > *',
                    insertPosition: ['css;#content_left', 3],
                    replaceE: 'css;#page',
                    scrollDelta: 1200
                }
            }, //              百度搜素
            google: {
                SiteTypeID: 0,
                host: /.google./,
                functionStart: function() {if (location.pathname === '/search') curSite = DBSite.google;},
                pager: {
                    type: 1,
                    nextLink: 'id("pnnext")[@href]',
                    pageElement: 'css;#res > *',
                    insertPosition: ['css;#res', 3],
                    replaceE: 'id("navcnt") | id("rcnt")//div[@role="navigation"]',
                    scriptType: 1,
                    scrollDelta: 3000
                }
            }, //             谷歌搜索
            bing: {
                SiteTypeID: 0,
                host: ['www.bing.com','cn.bing.com'],
                functionStart: function() {if (location.pathname === '/search') {curSite = DBSite.bing; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.b_imagePair.square_mp > .inner {display: none;}';}},
                pager: {
                    type: 1,
                    nextLink: '//a[contains(@class,"sb_pagN")][@href]',
                    pageElement: 'css;#b_results > li:not(.b_msg):not(.b_pag):not(#mfa_root)',
                    insertPosition: ['css;#b_results > .b_pag', 1],
                    replaceE: 'css;#b_results > .b_pag',
                    scrollDelta: 1500
                }
            }, //               必应搜索
            yandex: {
                SiteTypeID: 0,
                host: 'yandex.com',
                functionStart: function() {if (location.pathname === '/search/') {curSite = DBSite.yandex;}},
                pager: {
                    type: 1,
                    nextLink: 'css;a.pager__item_kind_next',
                    pageElement: 'css;#search-result > *, style',
                    insertPosition: ['css;#search-result', 3],
                    replaceE: 'css;.pager',
                    scrollDelta: 1500
                }
            }, //             Yandex 搜索
            toutiao: {
                SiteTypeID: 0,
                host: ['www.toutiao.com', 'so.toutiao.com'],
                functionStart: function() {if (location.hostname != 'www.toutiao.com') {if (location.pathname === '/search') {curSite = DBSite.toutiao;}}},
                pager: {
                    type: 1,
                    nextLink: '//div[contains(@class, "-pagination")]/a[contains(string(), "下一页")]',
                    pageElement: 'css;div[class*="-result-list"] > .result-content[data-i]',
                    insertPosition: ['css;div[class*="-result-list"] > .result-content:not([data-i]):last-child', 1],
                    replaceE: 'css;div[class*="-pagination"]',
                    scrollDelta: 1200
                },
                function: {
                    before: toutiao_functionBefore
                }
            }, //            头条搜索
            sogou: {
                SiteTypeID: 0,
                host: 'www.sogou.com',
                functionStart: function() {if (location.pathname != '/') {curSite = DBSite.sogou;}},
                pager: {
                    type: 1,
                    nextLink: 'css;#sogou_next',
                    pageElement: 'css;.results > *',
                    insertPosition: ['css;.results', 3],
                    replaceE: 'css;#pagebar_container',
                    scriptType: 4,
                    scrollDelta: 1200
                }
            }, //              搜狗搜索
            sogou_weixin: {
                SiteTypeID: 0,
                host: 'weixin.sogou.com',
                functionStart: function() {if (location.pathname === '/') {
                    curSite = DBSite.sogou_weixin;
                } else if (location.pathname === '/weixin') {
                    curSite = DBSite.sogou_weixin_search;
                }},
                pager: {
                    type: 2,
                    nextLink: '#look-more',
                    intervals: 1000,
                    scrollDelta: 1000
                }
            }, //       搜狗微信 - 首页
            sogou_weixin_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;#sogou_next',
                    pageElement: 'css;.news-box > ul[class*="news-list"] > li',
                    insertPosition: ['css;.news-box > ul[class*="news-list"]', 3],
                    replaceE: 'css;#pagebar_container',
                    scrollDelta: 1000
                }
            }, //搜狗微信 - 搜索
            so: {
                SiteTypeID: 0,
                host: 'www.so.com',
                functionStart: function() {if (location.pathname != '/') {curSite = DBSite.so;}},
                pager: {
                    type: 1,
                    nextLink: 'css;#snext[href]',
                    pageElement: 'css;ul.result > li, style:not(src)',
                    insertPosition: ['css;ul.result', 3],
                    replaceE: 'css;#page',
                    scrollDelta: 1200
                },
                function: {
                    before: so_functionBefore
                }
            }, //                 360 搜索
            magi: {
                SiteTypeID: 0,
                host: 'magi.com',
                functionStart: function() {if (location.pathname === '/search') {curSite = DBSite.magi;}},
                pager: {
                    type: 2,
                    nextLink: '.card[data-type="next"]',
                    nextText: '加载更多',
                    scrollDelta: 1500
                }
            }, //               Magi搜索
            baidu_tieba: {
                SiteTypeID: 0,
                host: 'tieba.baidu.com',
                functionStart: function() {if (location.pathname === '/f') {
                    baidu_tieba_1(); // 右侧悬浮发帖按钮点击事件（解决自动翻页导致无法发帖的问题）
                    curSite = DBSite.baidu_tieba; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'img.j_retract {margin-top: 0 !important;margin-bottom: 0 !important;}'; // 修复帖子列表中预览图片，在切换下一个/上一个图片时，多出来的图片上下边距
                //} else if (location.pathname.indexOf('/p/') > -1) {
                    //curSite = DBSite.baidu_tieba_post;
                } else if (location.pathname === '/f/search/res') {
                    curSite = DBSite.baidu_tieba_search;
                }},
                pager: {
                    type: 4,
                    nextLink: baidu_tieba_functionNext,
                    pageElement: 'css;#thread_list > li',
                    insertPosition: ['css;#thread_list', 3],
                    insertElement: baidu_tieba_insertElement,
                    replaceE: 'css;#frs_list_pager',
                    intervals: 3000,
                    scrollDelta: 2000
                },
                function: {
                    before: baidu_tieba_functionBefore
                }
            }, //        百度贴吧 - 帖子列表
            baidu_tieba_post: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//li[contains(@class,"pb_list_pager")]/a[contains(text(),"下一页")][@href]',
                    pageElement: 'css;#j_p_postlist > div',
                    insertPosition: ['css;#j_p_postlist', 3],
                    replaceE: 'css;li.pb_list_pager',
                    scrollDelta: 1000
                }
            }, //   百度贴吧 - 帖子内
            baidu_tieba_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next"][@href]',
                    pageElement: 'css;#j_p_postlist > *',
                    insertPosition: ['css;#j_p_postlist', 3],
                    replaceE: 'css;.pager.pager-search',
                    scriptType: 1,
                    scrollDelta: 1000
                }
            }, // 百度贴吧 - 搜索页
            douban_subject_comments: {
                SiteTypeID: 0,
                host: 'movie.douban.com',
                functionStart: function() {if (location.pathname.indexOf('/subject') > -1 && location.pathname.indexOf('/comments') > -1) { // 短评列表
                    curSite = DBSite.douban_subject_comments;
                } else if (location.pathname.indexOf('/subject') > -1 && location.pathname.indexOf('/reviews') > -1) { // 影评列表
                    curSite = DBSite.douban_subject_reviews;
                } else if(location.pathname.indexOf('/subject') > -1 && location.pathname.indexOf('/episode') > -1) { // 电视剧每集评论
                    curSite = DBSite.douban_subject_episode;
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next"][@href]',
                    pageElement: 'css;#comments > .comment-item',
                    insertPosition: ['css;#paginator', 1],
                    replaceE: 'css;#paginator',
                    scrollDelta: 1000
                }
            }, // 豆瓣 - 短评
            douban_subject_reviews: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//link[@rel="next"][@href]',
                    pageElement: 'css;.review-list > div',
                    insertPosition: ['css;.review-list', 3],
                    replaceE: 'css;.paginator',
                    scrollDelta: 1000
                }
            }, //  豆瓣 - 影评
            douban_subject_episode: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//link[@rel="next"][@href]',
                    pageElement: 'css;#comments > div',
                    insertPosition: ['css;#comments', 3],
                    replaceE: 'css;.paginator',
                    scrollDelta: 1000
                }
            }, //  豆瓣 - 剧评
            douban_group: {
                SiteTypeID: 0,
                host: 'www.douban.com',
                functionStart: function() {if (location.pathname.indexOf('/group/topic/') > -1) {
                    curSite = DBSite.douban_group_topic;
                } else if (location.pathname.indexOf('/group/explore') > -1) {
                    curSite = DBSite.douban_group_explore;
                } else if (location.pathname.indexOf('/group/') > -1 && location.pathname.indexOf('/discussion') > -1) {
                    curSite = DBSite.douban_group;
                }},
                pager: {
                    type: 1,
                    nextLink: 'css;span.next > a',
                    pageElement: 'css;table.olt > tbody > tr:not(.th)',
                    insertPosition: ['css;table.olt > tbody', 3],
                    replaceE: 'css;.paginator',
                    scrollDelta: 1000
                }
            }, //            豆瓣 - 小组
            douban_group_explore: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;span.next > a',
                    pageElement: 'css;#content .article > div > .channel-item',
                    insertPosition: ['css;#content .article > div', 3],
                    replaceE: 'css;.paginator',
                    scrollDelta: 1000
                }
            }, //    豆瓣 - 小组讨论精选
            douban_group_topic: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;span.next > a',
                    pageElement: 'css;#comments > li',
                    insertPosition: ['css;#comments', 3],
                    replaceE: 'css;.paginator',
                    scrollDelta: 1000
                }
            }, //      豆瓣 - 小组帖子内
            weibo_comment: {
                SiteTypeID: 0,
                host: 'weibo.com',
                pager: {
                    type: 2,
                    nextLink: 'a[action-type="click_more_comment"]',
                    nextText: '查看更多c',
                    scrollDelta: 1000
                }
            }, //       微博评论
            tianya: {
                SiteTypeID: 0,
                host: 'bbs.tianya.cn',
                functionStart: function() {if (location.pathname.indexOf('/list') > -1) {
                    curSite = DBSite.tianya;
                } else if (location.pathname.indexOf('/post') > -1) {
                    curSite = DBSite.tianya_post;
                }},
                pager: {
                    type: 1,
                    nextLink: '//div[contains(@class, "pages")]/div[@class="links"]/a[contains(text(), "下一页")]',
                    pageElement: 'css;.tab-bbs-list > tbody:not(:first-of-type)',
                    insertPosition: ['css;table.tab-bbs-list', 3],
                    replaceE: '//div[contains(@class, "pages")]',
                    scrollDelta: 1500
                }
            }, //              天涯社区
            tianya_post: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'a.js-keyboard-next[href]',
                    pageElement: 'css;.atl-main > div[class="atl-item"]',
                    insertPosition: ['css;.atl-main', 3],
                    replaceE: 'css;.atl-pages > form',
                    scrollDelta: 1500
                }
            }, //         天涯社区 - 帖子内
            nga_thread: {
                SiteTypeID: 0,
                host: ['bbs.nga.cn', 'ngabbs.com', 'nga.178.com', 'g.nga.cn'],
                iframe: true,
                functionStart: function() {locationchange = true;
                if (location.pathname === '/thread.php') { // 帖子列表
                    curSite = DBSite.nga_thread;
                } else if (location.pathname === '/read.php') { // 帖子内
                    curSite = DBSite.nga_read;
                }},
                pager: {
                    type: 1,
                    nextLink: 'css;#pagebbtm a[title="下一页"][href]',
                    pageElement: 'css;#topicrows > tbody, #topicrows > script',
                    insertPosition: ['css;#topicrows', 3],
                    replaceE: 'css;div[name="pageball"]',
                    scriptType: 2,
                    scrollDelta: 1000
                },
                function: {
                    after: nga_thread_functionAfter
                }
            }, //          NGA - 各版块帖子列表
            nga_read: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;#pagebbtm a[title*="下一页"][href]',
                    pageElement: 'id("m_posts_c")/table | id("m_posts_c")/script | //script[contains(text(), "commonui.userInfo.setAll")]',
                    insertPosition: ['css;#m_posts_c', 3],
                    replaceE: 'css;div[name="pageball"]',
                    scriptType: 2,
                    scrollDelta: 1000
                }
            }, //            NGA - 帖子内
            v2ex_recent: {
                SiteTypeID: 0,
                host: ['v2ex.com', 'www.v2ex.com'],
                functionStart: function() {if (location.pathname === '/') { //                          首页
                    v2ex_functionAfter('#Main a.topic-link:not([target])');
                } else if (location.pathname === '/recent') { //             最近主题页
                    curSite = DBSite.v2ex_recent;
                    v2ex_functionAfter('#Main a.topic-link:not([target])');
                } else if (location.pathname === '/notifications') { //      提醒消息页
                    curSite = DBSite.v2ex_notifications;
                    v2ex_functionAfter('#Main a[href^="/t/"]:not([target])');
                } else if (location.pathname === '/balance') { //            账户余额页
                    curSite = DBSite.v2ex_balance;
                } else if (location.pathname.indexOf('/go/') > -1) { //      分类主题页
                    curSite = DBSite.v2ex_go;
                    v2ex_functionAfter('#Main a.topic-link:not([target])');
                } else if (location.pathname.indexOf('/replies') > -1) { //  用户回复页
                    curSite = DBSite.v2ex_replies;
                    v2ex_functionAfter('#Main a[href^="/t/"]:not([target])');
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page_current"]/following-sibling::a[1][@href]',
                    pageElement: 'css;.cell.item',
                    insertPosition: ['//div[@id="Main"]//div[@class="box"]//div[@class="cell"][last()]', 1],
                    replaceE: 'css;#Main > .box > .cell[style]:not(.item) > table',
                    scrollDelta: 1500
                },
                function: {
                    after: v2ex_functionAfter,
                    parameter: '#Main a.topic-link:not([target])'
                }
            }, //         V2EX - 最近主题页
            v2ex_notifications: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page_current"]/following-sibling::a[1][@href]',
                    pageElement: 'css;#notifications > div',
                    insertPosition: ['css;#notifications', 3],
                    replaceE: 'css;#Main > .box > .cell[style] > table',
                    scrollDelta: 1500
                },
                function: {
                    after: v2ex_functionAfter,
                    parameter: '#Main a[href^="/t/"]:not([target])'
                }
            }, //  V2EX - 提醒消息页
            v2ex_replies: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page_current"]/following-sibling::a[1][@href]',
                    pageElement: '//div[@id="Main"]//div[@class="box"]//div[@class="dock_area"] | //*[@id="Main"]//div[@class="box"]//div[@class="inner"] | //*[@id="Main"]//div[@class="box"]//div[@class="dock_area"][last()]/following-sibling::div[@class="cell"][1]',
                    insertPosition: ['//div[@id="Main"]//div[@class="box"]//div[@class="cell"][last()]', 1],
                    replaceE: 'css;#Main > .box > .cell[style] > table',
                    scrollDelta: 1500
                },
                function: {
                    after: v2ex_functionAfter,
                    parameter: '#Main a[href^="/t/"]:not([target])'
                }
            }, //        V2EX - 用户回复页
            v2ex_go: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page_current"]/following-sibling::a[1][@href]',
                    pageElement: 'css;#TopicsNode > div',
                    insertPosition: ['css;#TopicsNode', 3],
                    replaceE: 'css;#Main > .box > .cell[style] > table',
                    scrollDelta: 1500
                },
                function: {
                    after: v2ex_functionAfter,
                    parameter: '#Main a.topic-link:not([target])'
                }
            }, //             V2EX - 分类主题页
            v2ex_balance: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page_current"]/following-sibling::a[1][@href]',
                    pageElement: 'css;#Main .box > div:not(.cell) > table > tbody > tr:not(:first-child)',
                    insertPosition: ['css;#Main .box > div:not(.cell) > table > tbody', 3],
                    replaceE: 'css;#Main > .box > .cell[style] > table',
                    scrollDelta: 1000
                }
            }, //        V2EX - 账户余额页
            pediy_forum: {
                SiteTypeID: 0,
                host: 'bbs.pediy.com',
                functionStart: function() {if (location.pathname.indexOf('/forum-') > -1) {
                    curSite = DBSite.pediy_forum;
                } else if (location.pathname.indexOf('/thread-') > -1) {
                    if (GM_getValue('menu_discuz_thread_page')) {curSite = DBSite.pediy_thread;}
                }},
                pager: {
                    type: 1,
                    nextLink: '//ul[contains(@class, "pagination")]//a[contains(text(), "▶")]',
                    pageElement: 'css;table.threadlist > tbody > tr',
                    insertPosition: ['css;table.threadlist > tbody', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1500
                }
            }, //         看雪论坛 - 各版块帖子列表
            pediy_thread: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//ul[contains(@class, "pagination")]//a[contains(text(), "▶")]',
                    pageElement: 'css;table.postlist > tbody > tr[data-pid]',
                    insertPosition: ['css;table.postlist > tbody > tr:not([data-pid])', 1],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1500
                }
            }, //        看雪论坛 - 帖子内
            lkong: {
                SiteTypeID: 0,
                host: 'www.lkong.com',
                functionStart: function() {if (location.pathname.indexOf('/forum/') > -1) {
                    curSite = DBSite.lkong;
                } else if (location.pathname.indexOf('/thread/') > -1) {
                    curSite = DBSite.lkong_thread;
                }},
                pager: {
                    type: 1,
                    nextLink: lkong_functionNext,
                    pageElement: '//div[@class="main-title"]/parent::div/parent::div | //head/style[@data-emotion-css]',
                    insertPosition: ['//div[@class="main-title"][1]/parent::div/parent::div/parent::div', 3],
                    replaceE: 'css;ul.ant-pagination',
                    intervals: 500,
                    scrollDelta: 1200
                }
            }, //               龙的天空 - 各版块帖子列表
            lkong_thread: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: lkong_functionNext,
                    pageElement: '//div[@class="main-content"]/parent::div | //head/style[@data-emotion-css]',
                    insertPosition: ['//div[@class="main-content"][1]/parent::div/parent::div', 3],
                    replaceE: 'css;ul.ant-pagination',
                    intervals: 500,
                    scrollDelta: 1200
                }
            }, //        龙的天空 - 帖子内
            xcar_forumdisplay: {
                SiteTypeID: 0,
                host: 'www.xcar.com.cn',
                functionStart: function() {if (location.pathname === '/bbs/forumdisplay.php') {curSite = DBSite.xcar_forumdisplay}},
                pager: {
                    type: 1,
                    nextLink: 'css;a.page_down',
                    pageElement: 'css;.table-section > dl:not(.table_head)',
                    insertPosition: ['css;.table-section', 3],
                    replaceE: 'css;.forumList_page',
                    scrollDelta: 2000
                }
            }, //   爱卡汽车网论坛 - 各版块帖子列表
            flyert_forumdisplay: {
                SiteTypeID: 0,
                host: 'www.flyert.com',
                functionStart: function() {if (location.search.indexOf('mod=forumdisplay') > -1) {
                    curSite = DBSite.flyert_forumdisplay;
                } else if (location.search.indexOf('mod=viewthread') > -1) {
                    if (GM_getValue('menu_discuz_thread_page')) {curSite = DBSite.flyert_viewthread;}
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;#threadlist table > tbody[id^="normalthread_"]',
                    insertPosition: ['id("threadlist")//table/tbody[starts-with(@id, "normalthread_")]/parent::table', 3],
                    replaceE: 'css;.pg',
                    scrollDelta: 2500
                }
            }, // 飞客网论坛 - 各版块帖子列表
            flyert_viewthread: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nxt"][@href][not(contains(@href, "javascript"))]',
                    pageElement: 'css;#postlist > .comiis_viewbox',
                    insertPosition: ['css;#postlist', 3],
                    replaceE: 'css;.comiis_pgs > .pg',
                    scrollDelta: 3000
                }
            }, //   飞客网论坛 - 帖子内
            zhutix: {
                SiteTypeID: 0,
                host: 'zhutix.com',
                functionStart: function() {if (document.getElementById('primary-home')) {
                    curSite = DBSite.zhutix_postlist;
                } else {
                    curSite = DBSite.zhutix;
                }},
                pager: {
                    type: 1,
                    nextLink: '//li[@class="next-page"]/a | //div[@class="btn-pager"]/a[contains(text(), "❯")]',
                    pageElement: 'css;#post-list > ul > li',
                    insertPosition: ['css;#post-list > ul', 3],
                    replaceE: 'css;.pagination, .b2-pagenav.post-nav',
                    scrollDelta: 1500
                }
            }, //              致美化
            zhutix_postlist: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//li[@class="next-page"]/a',
                    pageElement: 'css;#primary-home > div:not(.pagination)',
                    insertPosition: ['css;.pagination', 1],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //     致美化 - 文章列表
            jandan: {
                SiteTypeID: 0,
                host: 'jandan.net',
                functionStart: function() {if (location.pathname === '/' || location.pathname.indexOf('/page/') > -1) {
                    curSite = DBSite.jandan;
                } else if (location.pathname === '/dzh') {
                    curSite = DBSite.jandan_dzh;
                } else {
                    curSite = DBSite.jandan_comment;
                }},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="wp-pagenavi"]/a[contains(text(), "下一页") or contains(text(), "更多文章")]',
                    pageElement: 'css;#content > .list-post',
                    insertPosition: ['css;.wp-pagenavi', 1],
                    replaceE: 'css;.wp-pagenavi, #nav_prev',
                    scrollDelta: 1500
                },
                function: {
                    before: src_original_functionBefore
                }
            }, //              煎蛋网
            jandan_comment: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.previous-comment-page',
                    pageElement: 'css;ol.commentlist > li[id^="comment-"], script[src^="//cdn.jandan.net/static/min/"]',
                    insertPosition: ['css;ol.commentlist', 3],
                    replaceE: 'css;.cp-pagenavi, #nav_prev',
                    scriptType: 3,
                    scrollDelta: 1500
                }
            }, //      煎蛋网
            jandan_dzh: {
                SiteTypeID: 0,
                pager: {
                    type: 2,
                    nextLink: '.show_more',
                    intervals: 1500,
                    scrollDelta: 1500
                }
            }, //          煎蛋网 - 大杂烩
            guokr: {
                SiteTypeID: 0,
                host: 'www.guokr.com',
                pager: {
                    type: 2,
                    nextLink: 'div[class*="LoadMoreWrap"]',
                    intervals: 1500,
                    scrollDelta: 1500
                }
            }, //               果壳网
            expreview: {
                SiteTypeID: 0,
                host: 'www.expreview.com',
                pager: {
                    type: 2,
                    nextLink: '#show_article_red_1SHOW',
                    intervals: 1500,
                    scrollDelta: 1500
                }
            }, //           超能网
            landian: {
                SiteTypeID: 0,
                host: 'www.landian.vip',
                pager: {
                    type: 2,
                    nextLink: '.load-more > button',
                    nextText: '加载更多',
                    scrollDelta: 1300
                }
            }, //             蓝点网
            ithome: {
                SiteTypeID: 0,
                host: 'www.ithome.com',
                pager: {
                    type: 2,
                    nextLink: 'a.more',
                    intervals: 1500,
                    scrollDelta: 1500
                }
            }, //              IT 之家
            puxiang: {
                SiteTypeID: 0,
                host: 'www.puxiang.com',
                functionStart: function() {if (location.pathname === '/search/favorite') {
                    curSite = DBSite.puxiang_collect;
                } else if (location.pathname === '/search/puxiang' || location.pathname === '/list' || location.pathname === '/galleries' || location.pathname === '/articles') {
                    curSite = DBSite.puxiang;
                } else if (location.pathname === '/') {
                    curSite = DBSite.puxiang; curSite.pager.scrollDelta = 4000;
                }},
                pager: {
                    type: 1,
                    nextLink: 'css;li.next > a[href]',
                    pageElement: 'css;.work-list > div',
                    insertPosition: ['css;.work-list', 3],
                    replaceE: 'css;.pagerbar',
                    scrollDelta: 1500
                }
            }, //             普象网 - 作品集/搜索页
            puxiang_collect: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;li.next > a[href]',
                    pageElement: 'css;.collect-list > div',
                    insertPosition: ['css;.collect-list', 3],
                    replaceE: 'css;.pagerbar',
                    scrollDelta: 1500
                }
            }, //     普象网 - 收藏夹
            om: {
                SiteTypeID: 0,
                host: 'www.om.cn',
                functionStart: function() {if (location.pathname != '/') {curSite = DBSite.om;}},
                pager: {
                    type: 1,
                    nextLink: 'css;li.next > a[href]',
                    pageElement: 'css;.main_content > ul > li',
                    insertPosition: ['css;.main_content > ul', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1500
                }
            }, //                  欧模网
            _58pic: {
                SiteTypeID: 0,
                host: 'www.58pic.com',
                functionStart: function() {document.lastElementChild.appendChild(document.createElement('style')).textContent = '.qt-model-t {display: none !important;}'; // 隐藏登录弹窗
                if (location.pathname.indexOf('/tupian/') > -1) {
                    curSite = DBSite._58pic; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.qtw-card.place-box.is-two {display: none !important;}'; // 隐藏末尾很大的 [下一页] 按钮
                } else if (location.pathname.indexOf('/c/') > -1) {
                    curSite = DBSite._58pic_c;
                }},
                pager: {
                    type: 1,
                    nextLink: '//div[contains(@class,"page-box")]//a[text()="下一页"][@href]',
                    pageElement: 'css;.pic-box > .qtw-card',
                    insertPosition: ['css;.pic-box', 3],
                    replaceE: 'css;.page-box',
                    scrollDelta: 2000
                },
                function: {
                    before: _58pic_functionBefore
                }
            }, //              千图网 - 分类/搜索页
            _58pic_c: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//div[contains(@class,"page-box")]//a[text()="下一页"][@href]',
                    pageElement: 'css;.list-box > .qtw-card',
                    insertPosition: ['css;.list-box', 3],
                    replaceE: 'css;.page-box',
                    scrollDelta: 4000
                },
                function: {
                    before: _58pic_functionBefore
                }
            }, //            千图网 - 专题/收藏夹
            logosc: {
                SiteTypeID: 0,
                host: 'www.logosc.cn',
                functionStart: function() {if (location.pathname.indexOf('/so/') > -1) {curSite = DBSite.logosc;}},
                pager: {
                    type: 2,
                    nextLink: 'button.so-pablo-button',
                    intervals: 1500,
                    scrollDelta: 1500
                }
            }, //              搜图神器 (免费无版权)
            pixabay: {
                SiteTypeID: 0,
                host: 'pixabay.com',
                pager: {
                    type: 1,
                    nextLink: '//a[text()="Next page"][@href]',
                    pageElement: 'css;[class^="results"]  > [class^="container"] > div',
                    insertPosition: ['css;[class^="results"]  > [class^="container"]', 3],
                    replaceE: '//a[text()="Next page"][@href]',
                    scrollDelta: 2000
                },
                function: {
                    before: pixabay_functionBefore
                }
            },
            _3dmgame: {
                SiteTypeID: 0,
                host: 'www.3dmgame.com',
                pager: {
                    type: 3,
                    nextLink: '//li[@class="next"]/a[@href]',
                    pageElement: 'css;.news_warp_center > *',
                    insertPosition: ['css;.news_warp_center', 3],
                    replaceE: 'css;.pagewrap',
                    scrollElement: '.pagewrap',
                    scrollDelta: 400
                }
            },
            _3dmgame_mod: {
                SiteTypeID: 0,
                host: 'mod.3dmgame.com',
                pager: {
                    type: 1,
                    nextLink: _3dmgame_mod_functionNext,
                    pageElement: '//div[contains(@class, "game-mod-list") or contains(@class, "search-mod-list")] | //script[not(@src or @type)][contains(text(), ".game-mod-page") or contains(text(), ".search-mod-page")]',
                    insertPosition: ['//div[contains(@class, "game-mod-wrap") or contains(@class, "search-mod ")]', 3],
                    scriptType: 2,
                    history: true,
                    scrollDelta: 1200
                }
            }, //   3DM MOD站
            ali213_www: {
                SiteTypeID: 0,
                host: 'www.ali213.net',
                pager: {
                    type: 3,
                    nextLink: 'id("after_this_page")[@href]',
                    pageElement: 'css;#Content >*:not(.news_ding):not(.page_fenye)',
                    insertPosition: ['css;.page_fenye', 1],
                    replaceE: 'css;.page_fenye',
                    scrollElement: '.page_fenye',
                    scrollDelta: 400
                }
            }, //     游侠网
            ali213_gl: {
                SiteTypeID: 0,
                host: 'gl.ali213.net',
                functionStart: function() {curSite = DBSite.ali213_gl; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.n_show_b {display: none !important;}';},
                pager: {
                    type: 3,
                    nextLink: '//a[@class="next n"][@href]',
                    pageElement: 'css;.c-detail >*',
                    insertPosition: ['css;.c-detail', 3],
                    replaceE: 'css;.page_fenye',
                    scrollElement: '.page_fenye',
                    scrollDelta: 400
                }
            }, //      游侠网 - 攻略
            ali213_pic: {
                SiteTypeID: 0,
                host: 'pic.ali213.net',
                functionStart: function() {curSite = DBSite.ali213_pic; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'a.prev, a.next {display: none !important;}';},
                pager: {
                    type: 1,
                    nextLink: 'css;a.next[href]',
                    pageElement: 'css;#image-show > img',
                    insertPosition: ['css;#image-show', 3],
                    replaceE: 'css;#image-show > a',
                    scrollDelta: 1200
                }
            }, //     游侠网 - 图库
            gamersky_ent: {
                SiteTypeID: 0,
                host: 'www.gamersky.com',
                functionStart: function() {if (location.pathname.indexOf('/ent/') > -1) {curSite = DBSite.gamersky_ent;} else {curSite = DBSite.gamersky_gl;}},
                pager: {
                    type: 3,
                    nextLink: '//div[@class="page_css"]/a[text()="下一页"][@href]',
                    pageElement: 'css;.Mid2L_con > *:not(.gs_nc_editor):not(.pagecss):not(.page_css):not(.gs_ccs_solve):not(.post_ding)',
                    insertPosition: ['css;.page_css', 1],
                    replaceE: 'css;.page_css',
                    scrollElement: '.page_css',
                    scrollDelta: 100
                }
            }, //   游民星空
            gamersky_gl: {
                SiteTypeID: 0,
                pager: {
                    type: 3,
                    nextLink: '//div[@class="page_css"]/a[text()="下一页"][@href]',
                    pageElement: 'css;.Mid2L_con > *:not(.gs_nc_editor):not(.pagecss):not(.gs_ccs_solve):not(.post_ding)',
                    insertPosition: ['css;.gs_nc_editor', 1],
                    replaceE: 'css;.page_css',
                    scrollElement: '.pagecss',
                    scrollDelta: -1000
                },
                function: {
                    before: gamersky_gl_functionBefore
                }
            }, //    游民星空 - 攻略
            nexusmods: {
                SiteTypeID: 0,
                host: 'www.nexusmods.com',
                pager: {
                    type: 4,
                    nextLink: nexusmods_functionNext,
                    pageElement: 'css;ul.tiles > li',
                    insertPosition: ['css;ul.tiles', 3],
                    insertElement: nexusmods_insertElement,
                    replaceE: 'css;.pagination',
                    scrollDelta: 3000
                }
            }, //      NexusMods
            steamcommunity: {
                SiteTypeID: 0,
                host: 'steamcommunity.com',
                pager: {
                    type: 1,
                    nextLink: '//a[@class="pagebtn"][last()][@href]',
                    pageElement: 'css;.workshopBrowseItems > *',
                    insertPosition: ['css;.workshopBrowseItems', 3],
                    replaceE: 'css;.workshopBrowsePaging',
                    scriptType: 2,
                    scrollDelta: 1500
                }
            }, // 创意工坊 - 项目列表
            yikm: {
                SiteTypeID: 0,
                host: 'www.yikm.net',
                pager: {
                    type: 1,
                    nextLink: '//ul[@class="pager"]//a[text()="下一页"]',
                    pageElement: '//h2[contains(text(), "所有游戏") or contains(text(), "搜索结果")]/following-sibling::div[1]/div',
                    insertPosition: ['//h2[contains(text(), "所有游戏") or contains(text(), "搜索结果")]/following-sibling::div[1]', 3],
                    replaceE: 'css;ul.pager',
                    scrollDelta: 1500
                }
            }, //           小霸王其乐无穷
            cs_rin_ru: {
                SiteTypeID: 0,
                host: 'cs.rin.ru',
                functionStart: function() {if (location.pathname === '/forum/viewforum.php') { // 版块帖子列表
                    curSite = DBSite.cs_rin_ru;
                } else if (location.pathname === '/forum/viewtopic.php') { // 帖子内
                    if (GM_getValue('menu_discuz_thread_page')) curSite = DBSite.cs_rin_ru_viewtopic;
                } else if (location.pathname === '/forum/search.php') { // 搜索结果
                    curSite = DBSite.cs_rin_ru_search;
                }},
                pager: {
                    type: 1,
                    nextLink: '//td[@class="gensmall"][@align="right"]//a[text()="Next"][@href]',
                    pageElement: 'css;#pagecontent > table.tablebg > tbody > tr:not([align])',
                    insertPosition: ['css;#pagecontent > table.tablebg > tbody > tr[align]', 1],
                    replaceE: 'css;#pagecontent > table:first-child',
                    scrollDelta: 1500
                },
                function: {
                    before: cs_rin_ru_functionBefore
                }
            }, //           cs.rin.ru - 各版块帖子列表
            cs_rin_ru_viewtopic: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'id("pageheader")/p[@class="gensmall"]//a[text()="Next"][@href]',
                    pageElement: 'css;#pagecontent > table.tablebg:not(:nth-last-child(2)):not(:nth-child(2))',
                    insertPosition: ['css;#pagecontent > table.tablebg:nth-last-child(2)', 1],
                    replaceE: 'css;#pagecontent >table:not(.tablebg), #pageheader p.gensmall',
                    scrollDelta: 1500
                }
            }, // cs.rin.ru - 帖子内
            cs_rin_ru_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'id("wrapcentre")/div[@class="nav"]//a[text()="Next"]',
                    pageElement: 'css;#wrapcentre > form > table.tablebg > tbody > tr[valign]',
                    insertPosition: ['css;#wrapcentre > form > table.tablebg > tbody > tr:last-child', 1],
                    replaceE: 'css;#wrapcentre > div',
                    scrollDelta: 1500
                }
            }, //    cs.rin.ru - 搜索页
            crackhub: {
                SiteTypeID: 0,
                host: 'crackhub.site',
                functionStart: function() {curSite = DBSite.crackhub; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'html.wp-dark-mode-active .inside-article {background-color: var(--wp-dark-mode-bg);}';},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next page-numbers"][@href]',
                    pageElement: 'css;article[id^="post-"]',
                    insertPosition: ['css;nav.paging-navigation', 1],
                    replaceE: 'css;nav.paging-navigation',
                    scrollDelta: 2000
                }
            },
            fitgirl: {
                SiteTypeID: 0,
                host: 'fitgirl-repacks.site',
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next page-numbers"][@href]',
                    pageElement: 'css;article[id^="post-"]',
                    insertPosition: ['css;nav.paging-navigation', 1],
                    replaceE: 'css;nav.paging-navigation',
                    scrollDelta: 2000
                }
            },
            mypianku: {
                SiteTypeID: 0,
                host: 'www.mypianku.net',
                pager: {
                    type: 1,
                    nextLink: 'css;a.a1[href]',
                    pageElement: 'css;.content-list > li',
                    insertPosition: ['css;.content-list', 3],
                    replaceE: 'css;.pages',
                    scrollDelta: 1500
                },
                function: {
                    before: mypianku_functionBefore
                }
            }, //    片库
            cupfox: {
                SiteTypeID: 0,
                host: 'www.cupfox.com',
                pager: {
                    type: 2,
                    nextLink: '.load-more',
                    nextText: '点击加载更多',
                    scrollDelta: 700
                }
            }, //      茶杯狐
            novipnoad: {
                SiteTypeID: 0,
                host: 'www.novipnoad.com',
                functionStart: function() {if (location.pathname != '/' && location.pathname.indexOf('.html') === -1) {curSite = DBSite.novipnoad;}},
                pager: {
                    type: 1,
                    nextLink: 'css;a.nextpostslink',
                    pageElement: 'css;.video-listing-content .row > div',
                    insertPosition: ['css;.video-listing-content .row', 3],
                    replaceE: 'css;.wp-pagenavi',
                    scrollDelta: 1500
                },
                function: {
                    before: src_original_functionBefore
                }
            }, //   NO视频
            nfmovies: {
                SiteTypeID: 0,
                host: 'www.nfmovies.com',
                functionStart: function() {if (location.pathname === '/search.php' || location.pathname.indexOf('/list/') > -1) {curSite = DBSite.nfmovies;}},
                pager: {
                    type: 1,
                    nextLink: '//ul[contains(@class, "myui-page")]/li/a[contains(text(), "下一页")]',
                    pageElement: 'css;ul.myui-vodlist > li',
                    insertPosition: ['css;ul.myui-vodlist', 3],
                    replaceE: 'css;ul.myui-page',
                    scrollDelta: 1500
                },
                function: {
                    before: nfmovies_functionBefore
                }
            }, //    奈菲影视
            ddrk: {
                SiteTypeID: 0,
                host: 'ddrk.me',
                functionStart: function() {if (location.pathname === '/' || location.pathname.indexOf('/category/') > -1 || location.pathname.indexOf('/tag/') > -1) {curSite = DBSite.ddrk;}},
                pager: {
                    type: 1,
                    nextLink: 'css;a.next',
                    pageElement: 'css;.post-box-list > article',
                    insertPosition: ['css;.post-box-list', 3],
                    replaceE: 'css;.pagination_wrap',
                    scrollDelta: 1500
                }
            }, //        低端影视
            zxzj: {
                SiteTypeID: 0,
                host: 'www.zxzj.me',
                functionStart: function() {if (location.pathname != '/' && location.pathname.indexOf('/detail/') === -1) {
                    curSite = DBSite.zxzj; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'div.stui-page__all {display: none !important;}';
                }},
                pager: {
                    type: 1,
                    nextLink: '//ul[contains(@class, "stui-page__item")]//a[contains(text(), "下一页")]',
                    pageElement: 'css;ul.stui-vodlist > li',
                    insertPosition: ['css;ul.stui-vodlist', 3],
                    replaceE: 'css;ul.stui-page__item',
                    scrollDelta: 1000
                },
                function: {
                    before: nfmovies_functionBefore
                }
            }, //        在线之家
            zhenbuka: {
                SiteTypeID: 0,
                host: ['www.zhenbuka3.com', 'www.zhenbuka5.com'],
                functionStart: function() {if (location.pathname.indexOf('/vodtype/') > -1) {curSite = DBSite.zhenbuka;}},
                pager: {
                    type: 1,
                    nextLink: '//ul[contains(@class, "stui-page")]/li/a[contains(text(), "下一页")]',
                    pageElement: 'css;ul.stui-vodlist > li',
                    insertPosition: ['css;ul.stui-vodlist', 3],
                    replaceE: 'css;ul.stui-page',
                    scrollDelta: 1500
                },
                function: {
                    before: nfmovies_functionBefore
                }
            }, //    真不卡影院
            _91mjw: {
                SiteTypeID: 0,
                host: '91mjw.com',
                functionStart: function() {if (location.pathname.indexOf('/video/') === -1 || location.pathname.indexOf('/vplay/') === -1) {curSite = DBSite._91mjw;}},
                pager: {
                    type: 1,
                    nextLink: 'css;.next-page > a',
                    pageElement: 'css;.m-movies > article',
                    insertPosition: ['css;.pagination', 1],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                },
                function: {
                    before: src_original_functionBefore
                }
            }, //      91 美剧网
            agefans: {
                SiteTypeID: 0,
                host: 'www.agefans.cc',
                functionStart: function() {if (location.pathname.indexOf('/catalog/') > -1 || location.pathname === '/search') {
                    curSite = DBSite.agefans;
                } else if (location.pathname === '/recommend' || location.pathname === '/update') {
                    curSite = DBSite.agefans_;
                } else if (location.pathname === '/rank') {
                    curSite = DBSite.agefans_rank;
                }},
                pager: {
                    type: 1,
                    nextLink: 'id("container")//div[@class="blockcontent"]/div[@style][not(@class)]/li/a[@href][contains(text(), "下一页")]',
                    pageElement: 'css;#container .blockcontent1 > div',
                    insertPosition: ['css;#container .blockcontent1', 3],
                    replaceE: 'css;#container .blockcontent > div[style]:not([class])',
                    scrollDelta: 1000
                }
            }, //     AGE 动漫 - 全部/搜索
            agefans_: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'id("container")//div[@class="blockcontent"]/div[@style][not(@class)]/li/a[@href][contains(text(), "下一页")]',
                    pageElement: 'css;#container .blockcontent > ul > li',
                    insertPosition: ['css;#container .blockcontent > ul', 3],
                    replaceE: 'css;#container .blockcontent > div[style]:not([class])',
                    scrollDelta: 1000
                }
            }, //    AGE 动漫 - 其他页
            agefans_rank: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'id("container")/ul[@style][not(@class)]/li/a[@href][contains(text(), "下一页")]',
                    pageElement: 'css;#container > .div_right  .blockcontent.div_right_r_3 > ul',
                    insertPosition: ['css;#container > .div_right  .blockcontent.div_right_r_3', 3],
                    replaceE: 'css;#container > ul[style]:not([class])',
                    scrollDelta: 1000
                }
            }, //AGE 动漫 - 排行榜
            yhdm: {
                SiteTypeID: 0,
                host: 'www.imomoe.la',
                functionStart: function() {if (location.pathname.indexOf('/list/') > -1) {
                    curSite = DBSite.yhdm;
                } else if (location.pathname === '/so.asp' || location.pathname === '/search.asp') {
                    curSite = DBSite.yhdm_;
                }},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="pages"]/a[@href][contains(text(), "下一页")]',
                    pageElement: 'css;#contrainer > .img> ul > li',
                    insertPosition: ['css;#contrainer > .img> ul', 3],
                    replaceE: 'css;.pages',
                    mimeType: 'text/html; charset=gb2312',
                    scrollDelta: 1000
                }
            }, //        樱花动漫
            yhdm_: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//div[@class="pages"]/a[@href][contains(text(), "下一页")]',
                    pageElement: 'css;#contrainer .fire .pics > ul > li',
                    insertPosition: ['css;#contrainer .fire .pics > ul', 3],
                    replaceE: 'css;.pages',
                    mimeType: 'text/html; charset=gb2312',
                    scrollDelta: 1000
                }
            }, //       樱花动漫 - 搜索页等
            yinfans: {
                SiteTypeID: 0,
                host: 'www.yinfans.net',
                functionStart: function() {curSite = DBSite.yinfans; document.lastElementChild.appendChild(document.createElement('style')).textContent = '#post_container {height: auto !important;} #post_container > li {position: static !important; float: left !important; height: 620px !important;}';},
                pager: {
                    type: 1,
                    nextLink: 'css;a.next[href]',
                    pageElement: 'css;#post_container > li',
                    insertPosition: ['css;#post_container', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //     音范丝
            btbtt: {
                SiteTypeID: 0,
                host: /btbtt/,
                pager: {
                    type: 1,
                    nextLink: '//div[@class="page"]/a[contains(text(), "▶") or contains(text(), "下一页")]',
                    pageElement: 'css;#threadlist > table, #threadlist > hr',
                    insertPosition: ['css;#threadlist', 3],
                    replaceE: 'css;.page',
                    scrollDelta: 2000
                }
            }, //       BT 之家
            bdys: {
                SiteTypeID: 0,
                host: 'www.bd2020.com',
                functionStart: function() {if (location.pathname != '/' && !(/\/\d+\.htm/.test(location.pathname))) {curSite = DBSite.bdys;}},
                pager: {
                    type: 2,
                    nextLink: 'div.layui-flow-more > a',
                    nextText: '加载更多',
                    scrollDelta: 1000
                }
            }, //        BD 影视
            gaoqing_fm: {
                SiteTypeID: 0,
                host: 'gaoqing.fm',
                pager: {
                    type: 2,
                    nextLink: '.col-md-12 > a[href], #loadmore > a[href]',
                    intervals: 1500,
                    scrollDelta: 1000
                }
            }, //  高清电台
            kisssub: {
                SiteTypeID: 0,
                host: 'www.kisssub.org',
                pager: {
                    type: 1,
                    nextLink: 'css;a.nextprev',
                    pageElement: 'css;#data_list > tr',
                    insertPosition: ['css;#data_list', 3],
                    replaceE: 'css;.pages',
                    scrollDelta: 2500
                }
            }, //     爱恋动漫
            dmhy: {
                SiteTypeID: 0,
                host: 'dmhy.anoneko.com',
                pager: {
                    type: 1,
                    nextLink: '//div[@class="nav_title"]/a[@href][contains(text(), "下一頁")]',
                    pageElement: 'css;#topic_list > tbody > tr',
                    insertPosition: ['css;#topic_list > tbody', 3],
                    replaceE: 'css;.nav_title',
                    scrollDelta: 1500
                },
                function: {
                    after: function() {document.body.appendChild(document.createElement('script')).textContent = `$('#topic_list > tbody > tr:even:not(.even):not(.odd)').addClass('even'); $('#topic_list > tbody > tr:odd:not(.even):not(.odd)').addClass('odd');`;}
                }
            }, //        动漫花园
            bangumi: {
                SiteTypeID: 0,
                host: 'bangumi.moe',
                pager: {
                    type: 2,
                    nextLink: '[torrent-list="lattorrents"] button[ng-click="loadMore()"] ,[torrent-list="torrents"] button[ng-click="loadMore()"]',
                    intervals: 1000,
                    scrollDelta: 1500
                }
            }, //     萌番组
            nyaa: {
                SiteTypeID: 0,
                host: 'nyaa.si',
                pager: {
                    type: 1,
                    nextLink: '//a[@rel="next"][@href] | //li[@class="next"]/a[@href]',
                    pageElement: 'css;table.torrent-list > tbody > tr',
                    insertPosition: ['css;table.torrent-list > tbody', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 2000
                }
            }, //        Nyaa
            skrbt: {
                SiteTypeID: 0,
                host: /skrbt/,
                functionStart: function() {if (location.pathname === '/search') curSite = DBSite.skrbt;},
                pager: {
                    type: 1,
                    nextLink: skrbt_functionNext,
                    pageElement: 'css;div[class="row"] > .col-md-6 > ul',
                    insertPosition: ['css;nav[aria-label*="Page"]', 1],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 900
                }
            }, //       SkrBT
            rarbgprx: {
                SiteTypeID: 0,
                host: /rarbg/,
                functionStart: function() {if (location.pathname === '/torrents.php') {curSite = DBSite.rarbgprx;}},
                pager: {
                    type: 1,
                    nextLink: '(//a[@title="next page"])[1][@href]',
                    pageElement: 'css;table.lista2t tr.lista2',
                    insertPosition: ['css;table.lista2t > tbody', 3],
                    replaceE: 'css;#pager_links',
                    scrollDelta: 1000
                }
            }, //    RARBG
            subdh: {
                SiteTypeID: 0,
                host: 'subdh.com',
                functionStart: function() {if (location.pathname === '/' || location.pathname.indexOf('/list/new') > -1) {
                    curSite = DBSite.subdh;
                } else if (location.pathname.indexOf('/search') > -1) {
                    curSite = DBSite.subdh_search;
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page-link"][contains(text(), "下一页")]',
                    pageElement: 'css;.col-lg-9 .bg-white.shadow-sm.rounded-3 > .row.gx-0',
                    insertPosition: ['css;.col-lg-9 .bg-white.shadow-sm.rounded-3', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1000
                }
            }, //       SubDH
            subdh_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page-link"][contains(text(), "下一页")]',
                    pageElement: 'css;.col-lg-9 .bg-white.shadow-sm.rounded-3',
                    insertPosition: ['css;nav[aria-label="pagination"]', 1],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1000
                }
            }, //SubDH - 搜索页
            mini4k: {
                SiteTypeID: 0,
                host: 'www.mini4k.com',
                functionStart: function() {if (location.pathname != '/' && !(/\/\d{3,}/.test(location.pathname))) {curSite = DBSite.mini4k;};},
                pager: {
                    type: 1,
                    nextLink: 'css;a.pager__item--next[href]',
                    pageElement: 'css;div[class*="-item-list"] > ul > li',
                    insertPosition: ['css;div[class*="-item-list"] > ul', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 2000
                }
            }, //      MINI4K
            bthaha: {
                SiteTypeID: 0,
                host: /bthaha/,
                functionStart: function() {if (location.pathname.indexOf('/search/') > -1) {
                    curSite = DBSite.bthaha;
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = '[id^="list_top"], [id^="list_bottom"] {display: none !important;}';
                    document.querySelectorAll('[id^="list_top"], [id^="list_bottom"]').forEach(function (one) {one.parentElement.parentElement.hidden = true;});
                }},
                pager: {
                    type: 1,
                    nextLink: '//ul[@class="pagination"]/li/a[contains(text(), "下一页")]',
                    pageElement: 'css;table.table > tbody > tr',
                    insertPosition: ['css;table.table > tbody', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1000
                },
                function: {
                    before: bthaha_functionBefore
                }
            }, //      BTHaha
            a4k: {
                SiteTypeID: 0,
                host: 'www.a4k.net',
                functionStart: function() {if (location.pathname.indexOf('/subtitle/') === -1) {curSite = DBSite.a4k;};},
                pager: {
                    type: 1,
                    nextLink: 'css;a.pager__item--next[href]',
                    pageElement: 'css;ul.list > li',
                    insertPosition: ['css;ul.list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1000
                }
            }, //         A4k 字幕网（字幕）
            assrt: {
                SiteTypeID: 0,
                host: 'assrt.net',
                functionStart: function() {if (location.pathname != '/') {curSite = DBSite.assrt;};},
                pager: {
                    type: 1,
                    nextLink: assrt_functionNext,
                    pageElement: 'css;.resultcard > div:not(#top-banner):not(#bottom-banner)',
                    insertPosition: ['css;.pagelinkcard', 1],
                    replaceE: 'css;.pagelinkcard',
                    scrollDelta: 1000
                }
            }, //       射手网（字幕）
            subhd: {
                SiteTypeID: 0,
                host: 'subhd.tv',
                functionStart: function() {if (location.pathname === '/forum/forum') {
                        curSite = DBSite.subhd_forum;
                    } else if (location.pathname != '/' && location.pathname != '/zu' && location.pathname.indexOf('/a/') === -1 && location.pathname.indexOf('/d/') === -1 && location.pathname.indexOf('/forum/') === -1) {
                        curSite = DBSite.subhd;
                    }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page-link"][contains(text(), "下一页")]',
                    pageElement: 'css;.bg-white.shadow-sm.rounded-3',
                    insertPosition: ['css;nav.clearfix', 1],
                    replaceE: 'css;nav.clearfix',
                    scrollDelta: 1000
                }
            }, //       SubHD（字幕）
            subhd_forum: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page-link"][contains(text(), "下一页")]',
                    pageElement: 'css;.bg-white.shadow-sm.rounded-3 > div',
                    insertPosition: ['css;.bg-white.shadow-sm.rounded-3', 3],
                    replaceE: 'css;nav.clearfix',
                    scrollDelta: 800
                }
            }, // SubHD - forum（字幕）
            baoshuu: {
                SiteTypeID: 0,
                host: 'www.baoshuu.com',
                functionStart: function() {if (location.pathname.indexOf('/TXT/list') > -1) curSite = DBSite.baoshuu;},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="listl2"]//a[@href][text()="下一页"]',
                    pageElement: 'css;.listl2 > ul > li',
                    insertPosition: ['css;.listl2 > ul', 3],
                    replaceE: 'css;listl2 > dl',
                    mimeType: 'text/html; charset=gb2312',
                    scrollDelta: 900
                }
            }, //         宝书网（小说）
            baoshuu_m: {
                SiteTypeID: 0,
                host: 'm.baoshuu.com',
                functionStart: function() {if (location.pathname.indexOf('/TXT/list') > -1) curSite = DBSite.baoshuu_m;},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="man_first"]//a[@href][text()="下一页"]',
                    pageElement: 'css;.man_first > ul > li',
                    insertPosition: ['css;.man_first > ul', 3],
                    replaceE: 'css;.man_first > dl',
                    mimeType: 'text/html; charset=gb2312',
                    scrollDelta: 900
                }
            }, //       宝书网（小说）- 手机版
            qidian: {
                SiteTypeID: 0,
                host: 'www.qidian.com',
                functionStart: function() {if (location.pathname.indexOf('/all/') > -1) {curSite = DBSite.qidian;}},
                pager: {
                    type: 1,
                    nextLink: 'css;a[class*="pagination-next"][href]',
                    pageElement: 'css;ul.all-img-list > li',
                    insertPosition: ['css;ul.all-img-list', 3],
                    replaceE: 'css;#page-container',
                    scrollDelta: 900
                }
            }, //          起点小说
            qidian_read: {
                SiteTypeID: 0,
                host: 'read.qidian.com',
                functionStart: function() {if (location.pathname.indexOf('/chapter/') > -1) {curSite = DBSite.qidian_read; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.admire-wrap {display: none !important;}';}},
                pager: {
                    type: 1,
                    nextLink: 'css;a[id$="chapterNext"][href]',
                    pageElement: 'css;.main-text-wrap > div:not(.admire-wrap)',
                    insertPosition: ['css;.main-text-wrap', 3],
                    replaceE: 'css;.chapter-control, title',
                    history: true,
                    scrollDelta: 900
                }
            }, //     起点小说 - 阅读页
            linovelib: {
                SiteTypeID: 0,
                host: 'www.linovelib.com',
                functionStart: function() {if (/\/novel\/\d+\/.+\.html/.test(location.pathname)) {
                    curSite = DBSite.linovelib;
                } else if (location.pathname.indexOf('/wenku/') > -1) {
                    curSite = DBSite.linovelib_wenku;
                } else if (location.pathname.indexOf('/top/') > -1 || location.pathname.indexOf('/topfull/') > -1 || location.pathname.indexOf('toplist.php') > -1) {
                    curSite = DBSite.linovelib_top;
                }},
                pager: {
                    type: 1,
                    nextLink: '//p[@class="mlfy_page"]/a[@href][contains(text(), "下一页") or contains(text(), "下一章")]',
                    pageElement: 'css;#mlfy_main_text > *',
                    insertPosition: ['css;#mlfy_main_text', 3],
                    replaceE: 'css;p.mlfy_page, head > title',
                    history: true,
                    scrollDelta: 1000
                }
            }, //       哔哩轻小说
            linovelib_wenku: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;#pagelink > a.next[href]',
                    pageElement: 'css;.store_collist > div.bookbox',
                    insertPosition: ['css;.store_collist', 3],
                    replaceE: 'css;#pagelink',
                    scrollDelta: 1000
                },
                function: {
                    before: src_original_functionBefore
                }
            }, // 哔哩轻小说 - 文库
            linovelib_top: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;#pagelink > a.next[href]',
                    pageElement: 'css;.rankpage_box > div.rank_d_list',
                    insertPosition: ['css;div.pages', 1],
                    replaceE: 'css;#pagelink',
                    scrollDelta: 1000
                },
                function: {
                    before: src_original_functionBefore
                }
            }, //   哔哩轻小说 - 全本
            _423down: {
                SiteTypeID: 0,
                host: 'www.423down.com',
                functionStart: function() {if (location.pathname.indexOf('.html') === -1) curSite = DBSite._423down;},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="paging"]//a[contains(text(),"下一页")][@href]',
                    pageElement: 'css;div.content-wrap ul.excerpt > li',
                    insertPosition: ['css;div.content-wrap ul.excerpt', 3],
                    replaceE: 'css;div.paging',
                    scrollDelta: 1500
                }
            },
            iao_su: {
                SiteTypeID: 0,
                host: 'iao.su',
                pager: {
                    type: 1,
                    nextLink: '//li[@class="btn btn-primary next"]//a[@href]',
                    pageElement: 'css;#index > article, #archive > article',
                    insertPosition: ['css;ol.page-navigator', 1],
                    replaceE: 'css;ol.page-navigator',
                    scrollDelta: 1000
                },
                function: {
                    before: iao_su_functionBefore
                }
            }, //                 不死鸟
            sharerw: {
                SiteTypeID: 0,
                host: 'www.sharerw.com',
                functionStart: function() {if (location.pathname.indexOf('.html') === -1) {
                    if (location.pathname === '/search.php') {curSite = DBSite.sharerw_search;} else {curSite = DBSite.sharerw;};};},
                pager: {
                    type: 1,
                    nextLink: 'css;span.next > a[href]',
                    pageElement: 'css;.new-post > article',
                    insertPosition: ['css;.new-post', 3],
                    replaceE: 'css;.pagebar',
                    scrollDelta: 1500
                }
            }, //                分享者
            sharerw_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;span.next > a[href]',
                    pageElement: 'css;#mainbox > article',
                    insertPosition: ['css;.pagebar', 1],
                    replaceE: 'css;.pagebar',
                    scrollDelta: 1500
                }
            }, //         分享者 - 搜索页
            extfans: {
                SiteTypeID: 0,
                host: 'www.extfans.com',
                functionStart: function() {if (location.pathname != '/') {curSite = DBSite.extfans;}},
                pager: {
                    type: 1,
                    nextLink: 'css;.page a[data-page="next"]',
                    pageElement: 'css;.side-left > ul[class*="-list"] > li',
                    insertPosition: ['css;.side-left > ul[class*="-list"]', 3],
                    replaceE: 'css;.page',
                    scrollDelta: 2000
                }
            }, //                扩展迷
            chrome_zzzmh: {
                SiteTypeID: 0,
                host: 'chrome.zzzmh.cn',
                pager: {
                    type: 2,
                    nextLink: 'button.more-btn',
                    intervals: 1000,
                    scrollDelta: 1500
                }
            }, //           极简插件
            appinn: {
                SiteTypeID: 0,
                host: 'www.appinn.com',
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next page-numbers"][@href]',
                    pageElement: 'css;section#latest-posts > article',
                    insertPosition: ['css;nav.navigation.pagination', 1],
                    replaceE: 'css;div.nav-links',
                    scrollDelta: 1500
                }
            }, //                 小众软件
            isharepc: {
                SiteTypeID: 0,
                host: 'www.isharepc.com',
                pager: {
                    type: 1,
                    nextLink: 'css;a.next[href]',
                    pageElement: 'css;.content > div',
                    insertPosition: ['css;nav.pagination', 1],
                    replaceE: 'css;nav.pagination',
                    scrollDelta: 1000
                }
            }, //               乐软博客
            pc521: {
                SiteTypeID: 0,
                host: 'www.pc521.net',
                functionStart: function() {if (location.search.slice(0,3) === '?s=') {curSite = DBSite.pc521_search;} else {curSite = DBSite.pc521;}},
                pager: {
                    type: 2,
                    nextLink: 'div[id^="ias_trigger_"]',
                    intervals: 1000,
                    scrollDelta: 1000
                }
            }, //                  不忘初心
            pc521_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next[href]',
                    pageElement: 'css;#main > ul > li',
                    insertPosition: ['css;#main > ul', 3],
                    replaceE: 'css;nav.pagination',
                    scrollDelta: 1500
                }
            }, //           不忘初心 - 搜索页
            ghxi: {
                SiteTypeID: 0,
                host: 'www.ghxi.com',
                functionStart: function() {if (location.pathname === '/' && !location.search) {curSite = DBSite.ghxi;} else {curSite = DBSite.ghxi_postlist;}},
                pager: {
                    type: 2,
                    nextLink: '.load-more',
                    intervals: 1000,
                    scrollDelta: 5000
                }
            }, //                   果核剥壳 - 首页
            ghxi_postlist: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next[href]',
                    pageElement: 'css;ul.post-loop > li',
                    insertPosition: ['css;ul.post-loop', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1500
                },
                function: {
                    before: src_original_functionBefore
                }
            }, //          果核剥壳 - 分类/搜索页
            sixyin: {
                SiteTypeID: 0,
                host: 'www.sixyin.com',
                functionStart: function() {if (location.pathname === '/' && location.search === '') { // 首页
                    curSite = DBSite.sixyin;
                } else if (location.pathname.indexOf('.html') === -1) { //    分类页
                    curSite = DBSite.sixyin_postlist;
                }},
                pager: {
                    type: 2,
                    nextLink: '.load-more',
                    nextHTML: '点击查看更多',
                    scrollDelta: 1500
                }
            }, //                 六音软件 - 首页
            sixyin_postlist: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next"][@href]',
                    pageElement: 'css;ul.post-loop > li',
                    insertPosition: ['css;ul.post-loop', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1500
                }
            }, //        六音软件 - 分类页
            weidown: {
                SiteTypeID: 0,
                host: 'www.weidown.com',
                functionStart: function() {if (location.pathname.indexOf('/search/') > -1) { //搜索页
                    curSite = DBSite.weidown_search;
                } else if (location.pathname.indexOf('/special/') > -1) { // 专题页
                    curSite = DBSite.weidown_special;
                } else {
                    curSite = DBSite.weidown;
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nextpage"][@href]',
                    pageElement: 'css;.articleWrapper > .itemArticle, .articleWrapper > .richTextItem.search',
                    insertPosition: ['css;.articleWrapper', 3],
                    replaceE: 'css;#pageGroup',
                    scrollDelta: 1500
                }
            }, //                微当下载
            weidown_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nextpage"][@href]',
                    pageElement: 'css;.articleListWrapper > .richTextItem.search',
                    insertPosition: ['css;#pageGroup', 1],
                    replaceE: 'css;#pageGroup',
                    scrollDelta: 700
                }
            }, //         微当下载 - 搜索页
            weidown_special: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="nextpage"][@href]',
                    pageElement: 'css;.special > .item',
                    insertPosition: ['css;.special', 3],
                    replaceE: 'css;#pageGroup',
                    scrollDelta: 700
                }
            }, //        微当下载 - 专题页
            th_sjy: {
                SiteTypeID: 0,
                host: 'www.th-sjy.com',
                pager: {
                    type: 1,
                    nextLink: 'css;li.next-page > a',
                    pageElement: 'css;.content > article',
                    insertPosition: ['css;.pagination', 1],
                    replaceE: 'css;.pagination',
                    scrollDelta: 2000
                }
            }, //                 th-sjy 汉化
            fsylr: {
                SiteTypeID: 0,
                host: 'fsylr.com',
                functionStart: function() {if (location.pathname.indexOf('.html') === -1) {curSite = DBSite.fsylr;}},
                pager: {
                    type: 1,
                    nextLink: 'css;a.next.page-numbers[href]',
                    pageElement: 'css;.posts-con > div:not([class*="posts-"])',
                    insertPosition: ['css;.posts-con', 3],
                    replaceE: 'css;nav.pagination',
                    scrollDelta: 1000
                }
            }, //                  发烧友绿软
            iplaysoft_postslist: {
                SiteTypeID: 0,
                host: 'www.iplaysoft.com',
                functionStart: function() {if (location.pathname.indexOf('.html') > -1 || location.pathname.indexOf('/p/') > -1) { // 文章内
                    curSite = DBSite.iplaysoft_postcomments;
                } else { // 其他页面
                    curSite = DBSite.iplaysoft_postslist;
                }},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="pagenavi"]//a[@title="下一页"][@href]',
                    pageElement: 'css;#postlist > div.entry',
                    insertPosition: ['css;#postlist > .pagenavi-button', 1],
                    replaceE: 'css;.pagenavi-button, .pagenavi',
                    scrollDelta: 1200
                },
                function: {
                    before: iplaysoft_postslist_functionBefore
                }
            }, //    异次元软件
            iplaysoft_postcomments: {
                SiteTypeID: 0,
                pager: {
                    type: 2,
                    nextLink: '#loadHistoryComments',
                    nextTextOf: '展开后面',
                    scrollDelta: 1200
                }
            }, // 异次元软件 - 评论
            mpyit: {
                SiteTypeID: 0,
                host: 'www.mpyit.com',
                functionStart: function() {if (location.pathname === '/' && !location.search) {
                    curSite = DBSite.mpyit;
                } else if (location.pathname.indexOf('/category/') > -1 || location.search.indexOf('?s=') > -1) { // 搜索页 / 分类页
                    curSite = DBSite.mpyit_category;
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page-numbers"][@title="下一页"][@href]',
                    pageElement: 'css;#post > div[id^="post-"]',
                    insertPosition: ['css;#post > #pagenavi', 1],
                    replaceE: 'css;#post > #pagenavi',
                    scrollDelta: 1700
                }
            }, //                  老殁 | 殁漂遥
            mpyit_category: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page-numbers"][@title="下一页"][@href]',
                    pageElement: 'css;#content > div[class^="entry_box"]',
                    insertPosition: ['css;#content > #pagenavi', 1],
                    replaceE: 'css;#content > #pagenavi',
                    scrollDelta: 1700
                }
            }, //         老殁 | 殁漂遥 - 搜索页/分类页
            yxssp: {
                SiteTypeID: 0,
                host: 'www.yxssp.com',
                pager: {
                    type: 1,
                    nextLink: '//div[@class="page-nav td-pb-padding-side"]/a[last()][@href]',
                    pageElement: 'css;.td-modules-container.td-module-number4 > div',
                    insertPosition: ['css;.td-modules-container.td-module-number4', 3],
                    replaceE: 'css;.page-nav.td-pb-padding-side',
                    scrollDelta: 1000
                }
            }, //                  异星软件空间
            sordum: {
                SiteTypeID: 0,
                host: 'www.sordum.org',
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next page-numbers"][@href]',
                    pageElement: 'css;.article > article',
                    insertPosition: ['css;nav.navigation.posts-navigation', 1],
                    replaceE: 'css;nav.navigation.posts-navigation',
                    scrollDelta: 1500
                }
            }, //                 下面这几个都是国外博客网站
            winaero: {
                SiteTypeID: 0,
                host: 'winaero.com',
                functionStart: function() {if (location.pathname === '/blog/' || location.pathname.indexOf('/category/') > -1) curSite = DBSite.winaero;},
                pager: {
                    type: 1,
                    nextLink: 'css;.nav-previous > a',
                    pageElement: 'css;#content > article',
                    insertPosition: ['css;#nav-below', 1],
                    replaceE: 'css;#nav-below',
                    scrollDelta: 1500
                }
            },
            lrepacks: {
                SiteTypeID: 0,
                host: 'lrepacks.net',
                functionStart: function() {if (location.pathname.indexOf('.html') === -1) curSite = DBSite.lrepacks;},
                pager: {
                    type: 1,
                    nextLink: 'css;.page_next > a',
                    pageElement: 'css;#main .post-list article',
                    insertPosition: ['css;.page_nav', 1],
                    replaceE: 'css;.page_nav',
                    scrollDelta: 1500
                },
                function: {
                    before: lrepacks_functionBefore
                }
            },
            winhelponline: {
                SiteTypeID: 0,
                host: 'www.winhelponline.com',
                functionStart: function() {if (location.pathname === '/blog/') {curSite = DBSite.winhelponline;}},
                pager: {
                    type: 1,
                    nextLink: 'css;span.prev > a[href]',
                    pageElement: 'css;#main > article',
                    insertPosition: ['css;nav.paging-navigation', 1],
                    replaceE: 'css;nav.paging-navigation',
                    scrollDelta: 2000
                }
            },
            windowslatest: {
                SiteTypeID: 0,
                host: 'www.windowslatest.com',
                pager: {
                    type: 1,
                    nextLink: '//div[contains(@class, "page-nav")]/a/i[@class="td-icon-menu-right"]/parent::a',
                    pageElement: 'css;.td-ss-main-content > div:not(.td-block-title-wrap):not(.page-nav)',
                    insertPosition: ['css;.page-nav', 1],
                    replaceE: 'css;.page-nav',
                    scrollDelta: 2000
                }
            },
            thewindowsclub: {
                SiteTypeID: 0,
                host: 'www.thewindowsclub.com',
                functionStart: function() {curSite = DBSite.thewindowsclub; if (location.pathname === '/') {curSite.pager.scrollDelta = 2000;}},
                pager: {
                    type: 1,
                    nextLink: 'css;li.pagination-next > a',
                    pageElement: 'css;#genesis-content > article',
                    insertPosition: ['css;.pagination', 1],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            },
            cartoonmad: {
                SiteTypeID: 0,
                host: ['www.cartoonmad.com','www.cartoonmad.cc'],
                functionStart: function() {if (location.pathname.indexOf('/comic/') > -1) {
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = 'body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:not(:first-child) {display: none !important;} body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child img {max-width: 100%;height: auto;display: block !important;margin: 0 auto !important;}';
                    document.querySelector('body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child > a').href = 'javascript:void(0);'; // 清理图片上的链接
                    curSite = DBSite.cartoonmad;
                }},
                pager: {
                    type: 1,
                    nextLink: cartoonmad_functionNext,
                    pageElement: 'css;body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child img',
                    insertPosition: ['css;body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child > a', 3],
                    replaceE: 'css;body > table > tbody > tr:nth-child(2), body > table > tbody > tr:nth-child(5)',
                    mimeType: 'text/html; charset=big5',
                    scrollDelta: 2000
                }
            }, //      动漫狂
            manhuacat: {
                SiteTypeID: 0,
                host: 'www.manhuacat.com',
                functionStart: function() {if (location.pathname.split('/').length === 4) {
                    if (getCookie('is_pull') == 'true') { // 强制关闭 [下拉] 模式
                        document.cookie='is_pull=false; expires=Thu, 18 Dec 2031 12:00:00 GMT; path=/'; // 写入 Cookie 关闭 [下拉] 模式
                        location.reload(); // 刷新网页
                    }
                    setTimeout(manhuacat_init, 100);
                    curSite = DBSite.manhuacat; document.lastElementChild.appendChild(document.createElement('style')).textContent = '#left, #right, #pull-load, .loading, .pagination, footer {display: none !important;} .img-content > img {display: block !important;margin: 0 auto !important; border: none !important; padding: 0 !important; max-width: 99% !important; height: auto !important;}'; // 隐藏不需要的元素，调整图片
                }},
                pager: {
                    type: 4,
                    nextLink: manhuacat_functionNext,
                    insertPosition: ['css;.img-content', 3],
                    insertElement: manhuacat_insertElement,
                    replaceE: 'css;.comic-detail > .breadcrumb-bar, .comic-detail >h2.h4, title, .vg-r-data, body > script:not([src])',
                    intervals: 2000,
                    scrollDelta: 3000
                }
            }, //       漫画猫
            manhuadb: {
                SiteTypeID: 0,
                host: 'www.manhuadb.com',
                functionStart: function() {if (location.pathname.indexOf('/manhua/') > -1 && location.pathname.indexOf('.html') > -1) {
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = '.row.m-0.pt-3.ad_2_wrap, .row.m-0.ad_1_wrap, .pagination.justify-content-center, #left, #right {display: none !important;}';
                    document.querySelector('img.img-fluid.show-pic').style.display = 'none'; // 隐藏第一个图片（避免重复）
                    setTimeout(manhuadb_init, 100);
                    curSite = DBSite.manhuadb;
                }},
                pager: {
                    type: 4,
                    nextLink: manhuadb_functionNext,
                    pageElement: 'css;body > script:not([type]):not([src]), .vg-r-data, ol.links-of-books.num_div',
                    insertPosition: ['css;.pjax-container', 3],
                    insertElement: manhuadb_insertElement,
                    intervals: 5000,
                    scrollDelta: 3000
                }
            }, //        漫画 DB
            hicomic: {
                SiteTypeID: 0,
                host: 'www.hicomic.net',
                functionStart: function() {if (location.pathname.indexOf('/chapters/') > -1) {
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = '.content {height: auto !important;} .footer, .left_cursor, .right_cursor, .finish {display: none !important;} .content > img {display: block !important;margin: 0 auto !important;}';
                    setTimeout(hicomic_init, 100);
                    curSite = DBSite.hicomic;
                }},
                pager: {
                    type: 4,
                    nextLink: hicomic_functionNext,
                    insertPosition: ['css;.content', 3],
                    insertElement: hicomic_insertElement,
                    intervals: 5000,
                    scrollDelta: 3000
                }
            }, //         嗨漫画
            dmzj: {
                SiteTypeID: 0,
                host: 'www.dmzj.com',
                functionStart: function() {if (location.pathname.indexOf('/view/') > -1) {
                    if (getCookie('display_mode') != '1') { // 强制开启 [上下滚动阅读] 模式
                        document.cookie='display_mode=1; expires=Thu, 18 Dec 2031 12:00:00 GMT; path=/'; // 写入 Cookie 开启 [上下滚动阅读] 模式
                        location.reload(); // 刷新网页
                    }
                    setTimeout(dmzj_init, 100);
                    curSite = DBSite.dmzj; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'p.mh_curr_page, .btmBtnBox, .float_code, #floatCode {display: none !important;} .comic_wraCon > img {display: block !important;margin: 0 auto !important; border: none !important; padding: 0 !important; max-width: 99% !important; height: auto !important;}'; // 隐藏中间的页数信息
                }},
                pager: {
                    type: 4,
                    nextLink: dmzj_functionNext,
                    insertPosition: ['css;.comic_wraCon', 3],
                    insertElement: dmzj_insertElement,
                    replaceE: 'css;.wrap_last_mid, .wrap_last_head, title',
                    intervals: 2000,
                    scrollDelta: 3000
                }
            }, //            动漫之家 - 原创
            dmzj_manhua: {
                SiteTypeID: 0,
                host: 'manhua.dmzj.com',
                functionStart: function() {if (location.pathname.indexOf('.shtml') > -1) {
                    let chapterScroll = document.getElementById('qiehuan_txt') // 强制为 [上下滚动阅读] 模式
                    if (chapterScroll && chapterScroll.textContent === '切换到上下滚动阅读') {chapterScroll.click();}
                    setTimeout(dmzj_manhua_init, 100);
                    curSite = DBSite.dmzj_manhua; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'p.curr_page, .btmBtnBox, .float_code, #floatCode {display: none !important;} #center_box > img {display: block !important;margin: 0 auto !important; border: none !important; padding: 0 !important; max-width: 99% !important; height: auto !important;}'; // 隐藏中间的页数信息
                }},
                pager: {
                    type: 4,
                    nextLink: dmzj_manhua_functionNext,
                    insertPosition: ['css;#center_box', 3],
                    insertElement: dmzj_manhua_insertElement,
                    replaceE: 'css;.display_graybg, title',
                    intervals: 2000,
                    scrollDelta: 3000
                }
            }, //     动漫之家 - 日漫
            copymanga: {
                SiteTypeID: 0,
                host: 'www.copymanga.com',
                functionStart: function() {if (location.pathname.indexOf('/chapter/') > -1) {
                    curSite = DBSite.copymanga; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.upMember, .comicContainerAds, .footer {display: none !important;}';
                }},
                pager: {
                    type: 4,
                    nextLink: copymanga_functionNext,
                    insertPosition: ['css;ul.comicContent-image-list > li:first-child', 1],
                    insertElement: copymanga_insertElement,
                    replaceE: 'css;.disposableData, .disposablePass, .disposableUrlPrefix, .disposableUrlSuffix, .footer, h4.header, title',
                    intervals: 5000,
                    scrollDelta: 3000
                }
            }, //       拷贝漫画
            gufengmh8: {
                SiteTypeID: 0,
                host: 'www.gufengmh8.com',
                functionStart: function() {if (location.pathname.indexOf('.html') > -1) {
                    let chapterScroll = document.getElementById('chapter-scroll') // 强制为 [下拉阅读] 模式
                    if (chapterScroll && chapterScroll.className === '') {chapterScroll.click();}
                    curSite = DBSite.gufengmh8; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'p.img_info {display: none !important;}'; // 隐藏中间的页数信息
                }},
                pager: {
                    type: 4,
                    nextLink: gufengmh8_functionNext,
                    pageElement: 'css;body > script:first-child',
                    insertPosition: ['css;#images', 3],
                    insertElement: gufengmh8_insertElement,
                    intervals: 5000,
                    scrollDelta: 4000
                }
            }, //       古风漫画网
            szcdmj: {
                SiteTypeID: 0,
                host: 'www.szcdmj.com',
                functionStart: function() {if (location.pathname.indexOf('/szcchapter/') > -1) {curSite = DBSite.szcdmj; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.header {opacity: 0.3 !important;}';}},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="fanye"][1]/a[@href][text()="下一页" or text()="下一话"]',
                    pageElement: 'css;.comicpage > div,title',
                    insertPosition: ['css;.comicpage', 3],
                    replaceE: 'css;.fanye,h1.title',
                    scrollDelta: 2000
                },
                function: {
                    before: szcdmj_functionBefore
                }
            }, //          砂之船动漫家
            netbian: {
                SiteTypeID: 0,
                host: 'pic.netbian.com',
                functionStart: function() {curSite = DBSite.netbian; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'li.nextpage {display: none !important;}';},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="page"]/a[contains(text(),"下一页")]',
                    pageElement: 'css;.slist ul > li:not(.nextpage)',
                    insertPosition: ['css;.slist ul', 3],
                    replaceE: 'css;.page',
                    mimeType: 'text/html; charset=gbk',
                    scrollDelta: 1000
                }
            }, //         彼岸图网
            ioliu: {
                SiteTypeID: 0,
                host: 'bing.ioliu.cn',
                functionStart: function() {if (location.pathname.indexOf('/photo/') === -1 && location.pathname.indexOf('.html') === -1) {curSite = DBSite.ioliu; document.head.appendChild(document.createElement('base')).target = '_blank';}},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="page"]/a[@href][contains(text(), "下一页")]',
                    pageElement: 'css;body > .container > div.item',
                    insertPosition: ['css;body > .container', 3],
                    replaceE: 'css;.page',
                    scrollDelta: 1000
                },
                function: {
                    before: ioliu_functionBefore
                }
            }, //           必应壁纸
            github_star: {
                SiteTypeID: 0,
                host: 'github.com',
                functionStart: function() {locationchange = true;
                    if (location.search.indexOf('tab=stars') > -1) {
                        curSite = DBSite.github_star;
                    } else if (location.pathname.indexOf('/issues') > -1 && location.pathname.indexOf('/issues/') === -1) {
                        curSite = DBSite.github_issues;
                    } else if (location.pathname === '/search') {
                        if (!location.search) return
                        if (location.search.indexOf('type=Repositories') > -1 || location.search.indexOf('type=') === -1) {
                            curSite = DBSite.github_search;
                        } else if (location.search.indexOf('type=code') > -1) {
                            curSite = DBSite.github_search_code;
                        } else if (location.search.indexOf('type=commits') > -1) {
                            curSite = DBSite.github_search_commit;
                        } else if (location.search.indexOf('type=issues') > -1 || location.search.indexOf('type=discussions') > -1) {
                            curSite = DBSite.github_search_issue;
                        } else if (location.search.indexOf('type=registrypackages') > -1) {
                            curSite = DBSite.github_search_package;
                        } else if (location.search.indexOf('type=marketplace') > -1) {
                            curSite = DBSite.github_search_marketplace;
                        } else if (location.search.indexOf('type=topics') > -1) {
                            curSite = DBSite.github_search_topics;
                        } else if (location.search.indexOf('type=wikis') > -1) {
                            curSite = DBSite.github_search_wiki;
                        } else if (location.search.indexOf('type=users') > -1) {
                            curSite = DBSite.github_search_user;
                        }
                    }},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="paginate-container"]//a[@href][contains(text(), "Next")]',
                    pageElement: 'css;#js-pjax-container .position-relative div[class^="col-lg-"] > div:not(.position-relative):not(.paginate-container)',
                    insertPosition: ['css;.paginate-container', 1],
                    replaceE: 'css;.paginate-container',
                    scrollDelta: 2500
                }
            }, //               Github - 用户 Star 列表
            github_issues: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;.js-navigation-container.js-active-navigation-container > div[id^="issue_"]',
                    insertPosition: ['css;.js-navigation-container.js-active-navigation-container', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 2000
                }
            }, //             Github - Issues 列表
            github_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;ul.repo-list > li',
                    insertPosition: ['css;ul.repo-list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //             Github - Search 列表
            github_search_code: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;.code-list > div',
                    insertPosition: ['css;.code-list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //        Github - Search 列表 - Code
            github_search_commit: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;#commit_search_results > div',
                    insertPosition: ['css;#commit_search_results', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //      Github - Search 列表 - Commit
            github_search_issue: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;.issue-list > div > div',
                    insertPosition: ['css;.issue-list > div', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //       Github - Search 列表 - Issues/Discussions
            github_search_package: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;#package_search_results > div',
                    insertPosition: ['css;#package_search_results', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //     Github - Search 列表 - Package
            github_search_marketplace: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;.issue-list > div',
                    insertPosition: ['css;.issue-list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, // Github - Search 列表 - Marketplace
            github_search_topics: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;.topic-list > div',
                    insertPosition: ['css;.topic-list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //      Github - Search 列表 - Topics
            github_search_wiki: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;#wiki_search_results > div:first-child > div',
                    insertPosition: ['css;#wiki_search_results > div:first-child', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //        Github - Search 列表 - wiki
            github_search_user: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.next_page',
                    pageElement: 'css;#user_search_results > div:first-child > div',
                    insertPosition: ['css;#user_search_results > div:first-child', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //        Github - Search 列表 - user
            stackoverflow: {
                SiteTypeID: 0,
                host: 'stackoverflow.com',
                functionStart: function() {if (location.pathname.indexOf('/questions') > -1) {
                    curSite = DBSite.stackoverflow;
                } else if (location.pathname === '/search') {
                    curSite = DBSite.stackoverflow_search;
                } else if (location.pathname === '/tags') {
                    curSite = DBSite.stackoverflow_tags;
                } else if (location.pathname === '/users') {
                    curSite = DBSite.stackoverflow_users;
                }},
                pager: {
                    type: 1,
                    nextLink: 'css;a[href][rel="next"]',
                    pageElement: 'css;#questions > div',
                    insertPosition: ['css;#questions', 3],
                    replaceE: 'css;.pager',
                    scrollDelta: 1500
                }
            }, //             StackOverflow - Questions
            stackoverflow_tags: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a[href][rel="next"]',
                    pageElement: 'css;#tags-browser > div',
                    insertPosition: ['css;#tags-browser', 3],
                    replaceE: 'css;.pager',
                    scrollDelta: 1500
                }
            }, //        StackOverflow - Tags
            stackoverflow_users: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a[href][rel="next"]',
                    pageElement: 'css;#user-browser > div:first-child > div',
                    insertPosition: ['css;#user-browser > div:first-child', 3],
                    replaceE: 'css;.pager',
                    scrollDelta: 1500
                }
            }, //       StackOverflow - Users
            stackoverflow_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a[href][rel="next"]',
                    pageElement: 'css;.js-search-results > div:first-child > div',
                    insertPosition: ['css;.js-search-results > div:first-child', 3],
                    replaceE: 'css;.pager',
                    scrollDelta: 1500
                }
            }, //      StackOverflow - Search
            segmentfault: {
                SiteTypeID: 0,
                host: 'segmentfault.com',
                functionStart: function() {locationchange = true;
                    if (location.pathname.indexOf('/questions') > -1) {
                    curSite = DBSite.segmentfault;
                } else if (location.pathname === '/search') {
                    curSite = DBSite.segmentfault_search;
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="page-link"][contains(text(), "下一页")]',
                    pageElement: 'css;ul.list-group > li',
                    insertPosition: ['css;ul.list-group', 3],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1000
                }
            }, //              SegmentFault - Questions
            segmentfault_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a[href][rel="next"]',
                    pageElement: 'css;.search-result > section',
                    insertPosition: ['css;.search-result > div:last-child', 1],
                    replaceE: 'css;ul.pagination',
                    scrollDelta: 1000
                }
            }, //       SegmentFault - Search
            pubmed: {
                SiteTypeID: 0,
                host: 'pubmed.ncbi.nlm.nih.gov',
                pager: {
                    type: 2,
                    nextLink: 'button.load-button.next-page',
                    nextText: 'Show more',
                    scrollDelta: 1500
                }
            }, //          学术
            wikihow: {
                SiteTypeID: 0,
                host: ['www.wikihow.com', 'zh.wikihow.com'],
                functionStart: function() {if (location.pathname.indexOf('/Category:') > -1) {
                    curSite = DBSite.wikihow;
                } else if (location.pathname.indexOf('/wikiHowTo') > -1 && location.search.indexOf('?search=') > -1) {
                    curSite = DBSite.wikihow_search;
                }},
                pager: {
                    type: 1,
                    nextLink: 'css;a.pag_next',
                    pageElement: 'css;#cat_all > .cat_grid > div',
                    insertPosition: ['css;#cat_all > .cat_grid', 3],
                    replaceE: 'css;#large_pagination',
                    scriptType: 4,
                    scrollDelta: 2000
                }
            }, //         指南
            wikihow_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;#searchresults_footer > a.buttonright',
                    pageElement: 'css;#searchresults_list > a',
                    insertPosition: ['css;#searchresults_list', 3],
                    replaceE: 'css;#searchresults_footer',
                    scrollDelta: 3000
                }
            }, //  指南 - 搜索页
            afreecatv: {
                SiteTypeID: 0,
                host: 'www.afreecatv.com',
                pager: {
                    type: 2,
                    nextLink: '.btn-more > button',
                    intervals: 2000,
                    scrollDelta: 1000
                }
            }, //       直播
            greasyfork: {
                SiteTypeID: 0,
                host: 'greasyfork.org',
                functionStart: function() {if (/\/scripts$/.test(location.pathname) || location.pathname.indexOf('/scripts/by-site/') > -1) {
                    curSite = DBSite.greasyfork;
                } else if (/\/feedback$/.test(location.pathname)) {
                    curSite = DBSite.greasyfork_feedback;
                } else if (location.pathname.indexOf('/discussions') > -1 && !(/\/\d+/.test(location.pathname))) {
                    curSite = DBSite.greasyfork_discussions;
                }},
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next_page"][@href]',
                    pageElement: 'css;ol#browse-script-list > li',
                    insertPosition: ['css;ol#browse-script-list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1000
                }
            }, //             脚本
            greasyfork_feedback: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next_page"][@href]',
                    pageElement: 'css;.script-discussion-list > div',
                    insertPosition: ['css;.script-discussion-list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1500
                }
            }, //    脚本 - 反馈页
            greasyfork_discussions: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//a[@class="next_page"][@href]',
                    pageElement: 'css;.discussion-list > div',
                    insertPosition: ['css;.discussion-list', 3],
                    replaceE: 'css;.pagination',
                    scrollDelta: 1000
                }
            }, // 脚本 - 讨论页
            ruyile_xuexiao: {
                SiteTypeID: 0,
                host: 'www.ruyile.com',
                functionStart: function() {
                    if (location.pathname === '/xuexiao/') {
                        curSite = DBSite.ruyile_xuexiao;
                    } else if (location.pathname === '/data/') {
                        curSite = DBSite.ruyile_data;
                    } else if (location.pathname === '/shijuan/') {
                        curSite = DBSite.ruyile_shijuan;
                    }},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="fy"]/a[contains(text(), "下一页")][@href]',
                    pageElement: 'css;.xxlb > .sk',
                    insertPosition: ['css;.xxlb', 3],
                    replaceE: 'css;.fy',
                    scrollDelta: 1000
                }
            }, //  如意了教育 - 学校
            ruyile_data: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//div[@class="fy"]/a[contains(text(), "下一页")][@href]',
                    pageElement: 'css;.m1_z > .lbk',
                    insertPosition: ['css;.page', 1],
                    replaceE: 'css;.fy',
                    scrollDelta: 1000
                }
            }, //     如意了教育 - 数据
            ruyile_shijuan: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//div[@class="fy"]/a[contains(text(), "下一页")][@href]',
                    pageElement: 'css;.m1_z > .m2_lb',
                    insertPosition: ['css;.page', 1],
                    replaceE: 'css;.fy',
                    scrollDelta: 1000
                }
            }, //  如意了教育 - 试卷
            kdslife: {
                SiteTypeID: 0,
                host: 'club.kdslife.com',
                functionStart: function() {
                    if (location.pathname.indexOf('/f_') > -1) {
                        curSite = DBSite.kdslife;
                    } else if (location.pathname.indexOf('/t_') > -1) {
                        curSite = DBSite.kdslife_t;
                    }},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="fr i3_r"]/a[@href][contains(text(), "后一页")]',
                    pageElement: 'css;ul.main_List > li.i2:not(.h_bg)',
                    insertPosition: ['css;ul.main_List > li.i3', 1],
                    replaceE: 'css;ul.main_List > li.i3',
                    scrollDelta: 1000
                }
            }, //         宽带山论坛
            kdslife_t: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//div[@class="pages"]/a[contains(text(), ">>")]',
                    pageElement: 'css;#reply_list_panel > *, script[src*="ui/js/kds.js"]',
                    insertPosition: ['css;#reply_list_panel', 3],
                    replaceE: 'css;.pages',
                    scriptType: 3,
                    scrollDelta: 1000
                }
            }, //       宽带山论坛 - 帖子内
            libaclub: {
                SiteTypeID: 0,
                host: 'www.libaclub.com',
                functionStart: function() {
                    if (location.pathname === '/' || location.pathname.indexOf('/date_') > -1) {
                        curSite = DBSite.libaclub;
                    } else if (location.pathname.indexOf('/f_') > -1) {
                        curSite = DBSite.libaclub_f;
                    } else if (location.pathname.indexOf('/t_') > -1 || location.pathname.indexOf('/reply_') > -1) {
                        curSite = DBSite.libaclub_t;
                    } else if (location.pathname.indexOf('/prt_') > -1) {
                        curSite = DBSite.libaclub_prt;
                    } else if (location.pathname === '/facade.php') {
                        curSite = DBSite.libaclub_search;
                    }
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = 'li.ui-list-merchant-ad, .ui-nav-appImage {display: none !important;}';},
                pager: {
                    type: 1,
                    nextLink: '//div[@class="ui-crumbs-more"]/a[@class="fn-link"][1]',
                    pageElement: 'css;ul.ui-list > li:not(.ui-list-item-head):not(.ui-list-merchant-ad)',
                    insertPosition: ['css;ul.ui-list', 3],
                    replaceE: 'css;div.ui-crumbs-more',
                    scrollDelta: 1200
                }
            }, //        篱笆网论坛
            libaclub_f: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//div[@class="ui-paging"]/a[@class="ui-paging-next"]',
                    pageElement: 'css;ul.ui-list > li:not(.ui-list-item-head):not(.ui-list-merchant-ad)',
                    insertPosition: ['css;ul.ui-list', 3],
                    replaceE: 'css;div.ui-paging',
                    scrollDelta: 1200
                }
            }, //      篱笆网论坛 - 各版块帖子列表
            libaclub_t: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.ui-paging-next',
                    pageElement: 'css;.ui-box-content > div.ui-topic, .ui-box-content > a[name]',
                    insertPosition: ['css;.ui-box-content', 3],
                    replaceE: 'css;div.ui-paging',
                    scrollDelta: 1500
                }
            }, //      篱笆网论坛 - 帖子内
            libaclub_prt: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: 'css;a.ui-paging-next',
                    pageElement: 'css;ul.ui-list > li',
                    insertPosition: ['css;ul.ui-list', 3],
                    replaceE: 'css;div.ui-paging',
                    scrollDelta: 2000
                }
            }, //    篱笆网论坛 - 帖子内 - 打印版
            libaclub_search: {
                SiteTypeID: 0,
                pager: {
                    type: 1,
                    nextLink: '//div[@class="ui-page"]/a[contains(text(), "下一页")]',
                    pageElement: 'css;.ui-box-main > ul.ui-list > li',
                    insertPosition: ['css;.ui-box-main > ul.ui-list', 3],
                    replaceE: 'css;div.ui-page',
                    scrollDelta: 1200
                }
            } //  篱笆网论坛 - 搜索页
        };
        // 生成 SiteTypeID
        generateID();
        // 用于脚本判断（针对部分特殊的网站）
        SiteType = {
            BAIDU_TIEBA: DBSite.baidu_tieba.SiteTypeID,
            GAMERSKY_GL: DBSite.gamersky_gl.SiteTypeID
        };
    }


    if (webType != 1) {
        // < 所有 Discuz!论坛 >
        if (webType === 2) {
            if (location.pathname.indexOf('.html') > -1) { //                   判断是不是静态网页（.html 结尾）
                if (location.pathname.indexOf('/forum-') > -1) { //             < 各版块帖子列表 >
                    if (document.getElementById('autopbn')) { //                判断是否有 [下一页] 按钮
                        curSite = DBSite.discuz_forum;
                    } else if (document.getElementById('waterfall')) { //       判断是否为图片模式
                        curSite = DBSite.discuz_waterfall; waterfallStyle(); // 图片模式列表样式预处理
                    } else {
                        curSite = DBSite.discuz_guide;
                    }
                } else if (location.pathname.indexOf('/thread-') > -1) { //     < 帖子内 >
                    if (GM_getValue('menu_discuz_thread_page')) {
                        curSite = DBSite.discuz_thread;
                        hidePgbtn(); //                                         隐藏帖子内的 [下一页] 按钮
                    }
                } else if(location.pathname.indexOf('search') > -1) { //        < 搜索结果 >
                    curSite = DBSite.discuz_search;
                }
            }
            // 如果没有匹配的则继续
            if (curSite.SiteTypeID === 0) {
                if (location.search.indexOf('mod=forumdisplay') > -1 || location.pathname.indexOf('forumdisplay.php') > -1) { //      < 各版块帖子列表 >
                    if (document.getElementById('autopbn')) { //                判断是否有 [下一页] 按钮
                        curSite = DBSite.discuz_forum;
                    } else if (document.getElementById('waterfall')) { //       判断是否为图片模式
                        curSite = DBSite.discuz_waterfall; waterfallStyle(); // 图片模式列表样式预处理
                    } else {
                        curSite = DBSite.discuz_guide;
                    }
                } else if (location.search.indexOf('mod=viewthread') > -1 || location.pathname.indexOf('viewthread.php') > -1) { // < 帖子内 >
                    if (GM_getValue('menu_discuz_thread_page')) {
                        curSite = DBSite.discuz_thread;
                        hidePgbtn(); //                                         隐藏帖子内的 [下一页] 按钮
                    }
                } else if (location.search.indexOf('mod=guide') > -1) { //      < 导读帖子列表 >
                    curSite = DBSite.discuz_guide;
                } else if(location.search.indexOf('mod=space') > -1 && location.search.indexOf('&view=me') > -1) { // 别人的主题/回复
                    curSite = DBSite.discuz_youspace;
                } else if (location.search.indexOf('mod=collection') > -1) { // < 淘贴列表 >
                    curSite = DBSite.discuz_collection;
                } else if (location.pathname.indexOf('search') > -1) { //       < 搜索结果 >
                    curSite = DBSite.discuz_search;
                } else if (document.getElementById('threadlist')) { //          < 部分论坛的各板块 URL 是自定义的 >
                    curSite = DBSite.discuz_forum;
                } else if (document.getElementById('postlist')) { //            < 部分论坛的帖子内 URL 是自定义的 >
                    if (GM_getValue('menu_discuz_thread_page')) {
                        curSite = DBSite.discuz_thread;
                        hidePgbtn(); //                                         隐藏帖子内的 [下一页] 按钮
                    }
                }
            }
            // < 所有 Flarum 论坛 >
        } else if (webType === 3) {
            curSite = DBSite.flarum;
            // < 所有使用 WordPress DUX 主题的网站 >
        } else if (webType === 4) {
            if (location.pathname.indexOf('.html') === -1) curSite = DBSite.dux;
            if (location.host === 'apphot.cc') curSite.pager.scrollDelta = 2500; // 对于速度慢的网站，需要增加翻页敏感度
        }
    }

    if (GM_getValue('menu_page_number')) {pageNumber('add');} else {pageNumber('set');} // 显示页码
    pausePageEvent(); // 左键双击网页空白处暂停翻页

    if (locationchange) { // 对于使用 pjax 技术的网站，需要监听 URL 变化来重新判断翻页规则
        nowLocation = location.href
        addLocationchange(); // 自定义 locationchange 事件
        window.addEventListener('locationchange', function(){
            if (nowLocation != location.href) {
                nowLocation = location.href; curSite = {SiteTypeID: 0}; pageNum.now = 1; // 重置规则+页码
                registerMenuCommand(); // 重新判断规则
                curSite.pageUrl = ''; // 下一页URL

                if (GM_getValue('menu_page_number')) {pageNumber('add');} else {pageNumber('set');} // 显示页码
                pausePageEvent(); // 左键双击网页空白处暂停翻页
            }
        })
    }

    curSite.pageUrl = ''; // 下一页URL
    //console.log(curSite);
    pageLoading(); // 自动无缝翻页


    // [Discuz! 论坛] 隐藏帖子内的 [下一页] 按钮
    function hidePgbtn() {
        document.lastElementChild.appendChild(document.createElement('style')).textContent = '.pgbtn {display: none;}';
    }
    // [Discuz! 论坛] 图片模式列表样式预处理
    function waterfallStyle() {
        let width = document.querySelector('#waterfall > li:first-child').style.width;
        document.lastElementChild.appendChild(document.createElement('style')).textContent = `#waterfall {height: auto !important; width: 100% !important;} #waterfall > li {width: ${width} !important; float: left !important; position: inherit !important; left: auto !important; top: auto !important;}`;
    }
    // [Discuz! 论坛] 的插入前函数（加载图片，仅部分论坛）
    function discuz_thread_functionBefore(pageElems) {
        if (location.hostname === 'bbs.pcbeta.com') { // 仅部分论坛需要处理
            pageElems.forEach(function (one) {
                one.querySelectorAll('img[file]').forEach(function (now) {
                    now.src = now.getAttribute('file');
                });
            });
        }
        return pageElems
    }


    // 通用型插入前函数（加载图片 data-original => src）
    function src_original_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img[data-original]')
            if (now) {
                now.src = now.dataset.original;
            }
        });
        return pageElems
    }


    // [DUX] 的插入前函数（加载图片）
    function dux_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img.thumb[data-src]')
            if (now) {now.src = now.dataset.src;}
        });
        return pageElems
    }


    // [头条搜索] 的插入前函数（过滤相关搜索）
    function toutiao_functionBefore(pageElems) {
        for (let i = 0; i < pageElems.length; i++) {
            let now = pageElems[i].querySelector('div[class*="-header"]')
            if (now && now.textContent === '相关搜索') {
                pageElems.splice(i,1)
            }
        }
        return pageElems
    }


    // [360搜索] 的插入前函数（加载图片）
    function so_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            one.querySelectorAll('img[data-isrc]').forEach(function (now) {
                now.src = now.dataset.isrc;
                now.className = now.className.replace('so-lazyimg','');
            });
        });
        return pageElems
    }


    // [百度贴吧]（发帖按钮点击事件）
    function baidu_tieba_1() {
        let button = document.querySelector('.tbui_aside_fbar_button.tbui_fbar_post > a');
        if (button) {
            button.remove();
            document.querySelector('li.tbui_aside_fbar_button.tbui_fbar_down').insertAdjacentHTML(addTo(4), '<li class="tbui_aside_fbar_button tbui_fbar_post"><a href="javascript:void(0);" title="因为 [自动无缝翻页] 的原因，请点击该按钮发帖！"></a></li>')
            button = document.querySelector('.tbui_aside_fbar_button.tbui_fbar_post > a');
            if (button) {
                button.onclick = function(){
                    let button2 = document.querySelector('div.edui-btn.edui-btn-fullscreen.edui-btn-name-portrait');
                    if (button2) {
                        button2.click();
                    } else {
                        alert('提示：登录后才能发帖！');
                    }
                    return false;
                }
            }
        }
    }
    // [百度贴吧] 的插入前函数（加载图片）
    function baidu_tieba_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            one.querySelectorAll('img.threadlist_pic[data-original]').forEach(function (now) {
                now.src = now.dataset.original;
                now.style.display = 'inline';
            })
        });
        return pageElems
    }
    // [百度贴吧] 获取下一页地址
    function baidu_tieba_functionNext() {
        let next = document.querySelector('a.next.pagination-item[href]');
        if (next != null && next.nodeType === 1 && next.href && next.href.slice(0,4) === 'http') {
            var url = next.href + '&pagelets=frs-list%2Fpagelet%2Fthread&pagelets_stamp=' + new Date().getTime();
            if (url === curSite.pageUrl) return
            curSite.pageUrl = url;
            getPageElems(curSite.pageUrl);
        };
    }
    // [百度贴吧] 插入数据
    function baidu_tieba_insertElement(newBody, type) {
        if (!newBody) return
        let pageElems = getAllElements(curSite.pager.pageElement, newBody, newBody),
            toElement = getAllElements(curSite.pager.insertPosition[0])[0];
        if (pageElems.length >= 0) {
            // 执行插入前函数
            pageElems = curSite.function.before(pageElems);
            // 插入位置
            let addTo1 = addTo(curSite.pager.insertPosition[1]);
            // 获取 <script> 内容
            const scriptElems = getAllElements('//script', newBody, newBody);
            let scriptText = '';
            for (let i = 0; i < scriptElems.length; i++) {
                if (scriptElems[i].textContent.indexOf('Bigpipe.register("frs-list/pagelet/thread_list"') > -1) {
                    scriptText = scriptElems[i].textContent.replace('Bigpipe.register("frs-list/pagelet/thread_list", ','');
                    break
                }
            }
            if (scriptText) {
                scriptText = scriptText.slice(0, scriptText.indexOf(').')) // 获取主体内容
                let scriptJSON = JSON.parse(scriptText).content; //           字符串转 JSON
                var temp_baidu_tieba = document.createElement('div'); temp_baidu_tieba.innerHTML = scriptJSON; // 字符串转 Element 元素
                pageElems = curSite.function.before(getAllElements(curSite.pager.pageElement, temp_baidu_tieba, temp_baidu_tieba)); // 插入前执行函数
                pageElems.forEach(function (one) {toElement.insertAdjacentElement(addTo1, one);}); // 插入元素
                // 当前页码 + 1
                pageNum.now = pageNum._now + 1
                // 替换元素
                let oriE = document.querySelectorAll(curSite.pager.pageElement.replace('css;', '')),
                    repE = getAllElements(curSite.pager.replaceE, temp_baidu_tieba, temp_baidu_tieba);
                if (oriE.length === repE.length) {
                    for (let i = 0; i < oriE.length; i++) {
                        oriE[i].outerHTML = repE[i].outerHTML;
                    }
                }
            }
        }
    }


    // [NGA(玩家社区)] 的插入后函数（加载各版块帖子列表样式）
    function nga_thread_functionAfter() {
        document.body.appendChild(document.createElement('script')).textContent = 'commonui.topicArg.loadAll();';
    }


    // [V2EX] 的插入后函数（新标签页打开链接）
    function v2ex_functionAfter(css) {
        let links = document.querySelectorAll(css);if (!links) return
        links.forEach(function (_this) {_this.target = '_blank';});
    }


    // [龙的天空] 获取下一页地址
    function lkong_functionNext() {
        let next = document.querySelector('li.ant-pagination-next'), page;
        if (next && next.getAttribute('aria-disabled') === 'false') {
            page = document.querySelector('li.ant-pagination-item-active[title]');
            if (page && page.title) {
                if (curSite.pager.intervals) {
                    let _SiteTypeID = curSite.SiteTypeID; curSite.SiteTypeID = 0;
                    setTimeout(function(){curSite.SiteTypeID = _SiteTypeID;}, curSite.pager.intervals)
                }
                return (location.origin + location.pathname + '?page=' + ++page.title);
            }
        }
        return '';
    }


    // [千图网] 的插入前函数（加载图片）
    function _58pic_functionBefore(pageElems) {
        let is_one = document.querySelector('.qtw-card.place-box.is-one');
        if (is_one && is_one.style.display != 'none') {is_one.style.display = 'none';}
        pageElems.forEach(function (one) {
            let now = one.querySelector('img.lazy')
            if (now && now.getAttribute('src') != now.dataset.original) {
                now.src = now.dataset.original;
                now.style.display = 'block';
            }
        });
        return pageElems
    }


    // [Pixabay] 的插入前函数（加载图片）
    function pixabay_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img[data-lazy-src]')
            if (now) {
                now.src = now.dataset.lazySrc;
                now.removeAttribute('data-lazy-src')
                now.removeAttribute('data-lazy-srcset')
            }
        });
        return pageElems
    }


    // [3DM MOD] 获取下一页地址
    function _3dmgame_mod_functionNext() {
        let nextNum = getElementByXpath('//li[@class="page-list active"]/following-sibling::li[contains(@class, "page-list")]/a');
        var url = '';
        if (nextNum && nextNum.textContent) {
            nextNum = 'Page=' + nextNum.textContent;
            if (location.search) {
                let search = location.search.replace(/(&)?Page=\d+(&)?/, '');
                if (search === '?') {
                    url += location.origin + location.pathname + search + nextNum;
                } else {
                    url += location.origin + location.pathname + search + '&' + nextNum;
                }
            } else {
                url += location.origin + location.pathname + '?' + nextNum;
            }
        }
        //console.log(url)
        return url
    }


    // [游民星空-攻略] 的插入前函数（移除下一页底部的 "更多相关内容请关注：xxx" 文字）
    function gamersky_gl_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            if (one.tagName === 'P' && one.textContent.indexOf('更多相关内容请关注') > -1) {one.style.display = 'none';}
        });
        return pageElems
    }


    // [NexusMods] 获取下一页地址
    function nexusmods_functionNext() {
        if (document.querySelector('.nexus-ui-blocker')) return
        let modList;
        if (location.pathname.indexOf('/news') > -1) {modList = RH_NewsTabContent;} else {modList = RH_ModList;}
        let out_items = JSON.stringify(modList.out_items).replace(/{|}|"/g,''),
            nextNum = getElementByXpath('//div[contains(@class, "pagenav")][1]//a[contains(@class, "page-selected")]/parent::li/following-sibling::li/a'),
            categories = modList.out_items.categories, categoriesUrl = '';
        var url = '';
        if (nextNum && nextNum.innerText) {
            nextNum = nextNum.innerText;
            if (out_items.indexOf('page:') > -1) {
                out_items = out_items.replace(/page:\d+/, `page:${nextNum}`)
            } else {
                out_items += `,page:${nextNum}`;
            }
            if (categories && categories != []) {
                for (let i = 0; i < categories.length; i++) {
                    categoriesUrl += `,categories[]:${categories[i]}`
                }
                categoriesUrl = categoriesUrl.replace(/,/,'');
                if (out_items.indexOf('categories:') > -1) {
                    out_items = out_items.replace(/categories:\[.*\]/, categoriesUrl)
                }
            }
            url = `https://www.nexusmods.com${modList.uri}?RH_${modList.id}=${out_items}`
            //console.log(nextNum, url, curSite.pageUrl, out_items)
            if (url === curSite.pageUrl) return
            curSite.pageUrl = url;
            //console.log(nextNum, curSite.pageUrl, out_items)
            getPageElems(curSite.pageUrl)
        }
    }
    // [NexusMods] 插入数据
    function nexusmods_insertElement(newBody, type) {
        if (!newBody) return
        let pageElems = getAllElements(curSite.pager.pageElement, newBody, newBody), // 主体元素
            toElement = getAllElements(curSite.pager.insertPosition[0])[0], // 插入位置的元素
            addTo1 = addTo(curSite.pager.insertPosition[1]); // 插入位置
        // 添加下载数据
        pageElems.forEach(function (one) {
            let now = one.querySelector('.mod-tile-left');
            if (now) {
                let downloadCount = now.querySelector('.downloadcount > span.flex-label');
                if (downloadCount) {
                    console.log(now.dataset.gameId, now.dataset.modId)
                    if (GlobalModStats[now.dataset.gameId] && GlobalModStats[now.dataset.gameId][now.dataset.modId]) {
                        downloadCount.textContent = shortFormat(parseInt(GlobalModStats[now.dataset.gameId][now.dataset.modId].total));
                    }
                }
            }
        });
        // 插入网页
        pageElems.forEach(function (one) {toElement.insertAdjacentElement(addTo1, one);});
        // 当前页码 + 1
        pageNum.now = pageNum._now + 1
        // 替换元素
        let oriE = document.querySelectorAll(curSite.pager.replaceE.replace('css;', '')),
            repE = getAllElements(curSite.pager.replaceE, newBody, newBody);
        if (oriE.length === repE.length) {
            for (let i = 0; i < oriE.length; i++) {
                oriE[i].outerHTML = repE[i].outerHTML;
            }
        }
    }


    // [cs_rin_ru] 各版块帖子列表的插入前函数（过滤置顶帖子）
    function cs_rin_ru_functionBefore(pageElems) {
        for (let i = 0; i < pageElems.length; i++) {
            if (pageElems[i].textContent.replace(/\n|	/g,'') === 'Topics') {
                pageElems.splice(0,i+1);
                break;
            }
        }
        return pageElems
    }


    // [片库] 的插入前函数（加载图片）
    function mypianku_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img')
            if (now) {
                now.src = now.dataset.src;
            }
        });
        return pageElems
    }


    // [奈菲影视/在线之家/真不卡影院] 的插入前函数（加载图片）
    function nfmovies_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('a.lazyload')
            if (now) {
                now.style.backgroundImage = 'url("' + now.dataset.original + '")';
            }
        });
        return pageElems
    }


    // [SkrBT] 获取下一页地址
    function skrbt_functionNext() {
        let page = document.querySelector('a[onclick][aria-label="Next"]');
        if (page) {page = /(?<=\()\d+(?=\))/.exec(page.onclick)[0];} else {return '';} // 获取下一页页码
        if (page) {
            let action = document.getElementById('search-form').action, value = ''; // 获取提交表单 URL
            document.querySelectorAll('#search-form input[name]').forEach(function(input) { // 生成表单参数
                value += input.name + '=' + input.value + '&'
            })
            value = encodeURI(value.replace(/&$/,'').replace(/p=\d+/,'p=' + page)); // 清理最后一个 & 符号，并替换页码
            if (action && value) {
                //console.log(action + '?' + value)
                return (action + '?' + value)
            }
        }
        return '';
    }


    // [BTHaha] 的插入前函数（加载图片）
    function bthaha_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('[id^="list_top"], [id^="list_bottom"]')
            if (now) {one.hidden = true;}
        });
        return pageElems
    }


    // [射手网] 获取下一页地址
    function assrt_functionNext() {
        let nextXPAHT = '//a[@id="pl-nav"][@href][contains(text(), ">")]'
        let url = getElementByXpath(nextXPAHT);
        if (url) {
            url = /(?<=\()\d+(?=,)/.exec(url.href)[0]
            if (url) {
                return (location.origin + location.pathname + location.search.replace(/(&)?page=\d+$/,'') + '&page=' + url);
            }
        }
        return '';
    }


    // [不死鸟] 的插入前函数（加载图片）
    function iao_su_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.getElementsByClassName('post-card')[0]
            if (now) {
                now.getElementsByClassName('blog-background')[0].style.backgroundImage = 'url("' + now.getElementsByTagName('script')[0].textContent.split("'")[1] + '")';
                //now.getElementsByClassName('blog-background')[0].style.backgroundImage = 'url("' + RegExp("(?<=loadBannerDirect\\(').*(?=', '',)").exec(now.getElementsByTagName('script')[0].textContent)[0]; + '")';
            }
        });
        return pageElems
    }


    // [异次元软件世界] 的插入前函数（加载图片）
    function iplaysoft_postslist_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img.lazyload')
            if (now && !now.src) {
                now.src = now.dataset.src;
                now.setAttribute('srcset', now.dataset.src)
                now.setAttribute('class', 'lazyloaded')
            }
        });
        return pageElems
    }


    // [LRepacks] 的插入前函数（调整 class）
    function lrepacks_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('.slideUp, .elementFade')
            if (now) {
                now.className = now.className.replace('slideUp','slideUpRun').replace('elementFade','elementFadeRun');
            }
        });
        return pageElems
    }


    // [必应壁纸] 的插入前函数（加载图片）
    function ioliu_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img.progressive--not-loaded')
            if (now) {
                now.className = now.className.replace('progressive--not-loaded','progressive--is-loaded');
            }
        });
        return pageElems
    }


    // [漫画狂] 获取下一页地址
    function cartoonmad_functionNext() {
        let nextXPAHT = '//a[@class="pages"][contains(text(),"下一頁")]',
            nextPXPATH = '//a[@class="pages"][contains(string(),"下一話")]'
        let url = getElementByXpath(nextXPAHT);
        if (url) {
            if (url.getAttribute('href') === 'thend.asp') {
                url = getElementByXpath(nextPXPATH)
                if (url) return url.href;
                pausePage = false;
                GM_notification({text: `注意：该网站早期漫画（如海贼王、柯南）因为网站自身问题而无法翻至下一话（仅限于显示为 [第 X 卷]/[下一卷] 的）。\n因此需要手动去 [目录页] 进入下一卷！`, timeout: 10000});
            } else {
                return url.href;
            }
        }
        return '';
    }


    // [漫画猫] 初始化（显示本话所以图片）
    function manhuacat_init() {
        let _img = '';
        for (let now of img_data_arr) {
            _img += `<img src="${asset_domain}${img_pre}${now}">`;
        }
        document.querySelector('.img-content > img').remove();
        document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中

    }
    // [漫画猫] 获取下一页地址
    function manhuacat_functionNext(pageElems, type) {
        if (type === 'url') {
            if(pageElems.code == '0000') {
                if (pageElems.url === curSite.pageUrl) return
                curSite.pageUrl = pageElems.url;
                getPageElems(curSite.pageUrl); // 真正的下一页链接
            }
        } else {
            let vg_r_data = document.querySelector('.vg-r-data');
            if (vg_r_data) {
                getPageElems(`https://${location.host}/chapter_num?chapter_id=${vg_r_data.dataset.chapter_num}&ctype=1&type=${vg_r_data.dataset.chapterType};`, 'json', 'GET', '', 'url');
            }
        }
    }
    // [漫画猫] 插入数据
    function manhuacat_insertElement(pageElems, type) {
        if (!pageElems) return
        if (type === 'url') { // 获取下一页链接
            manhuacat_functionNext(pageElems, type); return
        }

        // 添加历史记录
        window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, pageElems.querySelector('title').textContent, curSite.pageUrl);

        // 替换元素
        let oriE = document.querySelectorAll(curSite.pager.replaceE.replace('css;', '')),
            repE = getAllElements(curSite.pager.replaceE, pageElems, pageElems);
        if (oriE.length === repE.length) {
            for (let i = 0; i < oriE.length; i++) {
                oriE[i].outerHTML = repE[i].outerHTML;
            }
        }

        // 插入图片
        let _img = '', _img_arr = LZString.decompressFromBase64(getElementByXpath('//body/script[not(@src)][contains(text(), "img_data")]').textContent.split('"')[1]).split(','), vg_r_data = document.querySelector('.vg-r-data');;
        for (let now of _img_arr) {
            _img += `<img src="${vg_r_data.dataset.chapterDomain}${img_pre}${now}">`;
        }
        if (_img) {
            document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
            // 当前页码 + 1
            pageNum.now = pageNum._now + 1
        }
    }


    // [漫画DB] 初始化（将本话其余图片插入网页中）
    function manhuadb_init() {
        let _img = '',
            data = document.querySelector('.vg-r-data'), imgDate;
        if (!data) return
        document.querySelectorAll(curSite.pager.pageElement.replace('css;', '')).forEach(function (one) {
            if (one.tagName === 'SCRIPT' && one.textContent.indexOf('var img_data =') > -1) {
                let json = JSON.parse(window.atob(one.textContent.split("'")[1]));
                if (json) {
                    let _img = '';
                    for (let i = 0; i < json.length; i++) { // 遍历图片文件名数组，组合为 img 标签
                        let src = data.dataset.host + data.dataset.img_pre + json[i].img;
                        _img += `<img class="img-fluid show-pic" src="${src}">`
                    }
                    document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
                }
            }
        })
    }
    // [漫画DB] 获取下一页地址
    function manhuadb_functionNext() {
        let nextArr = document.querySelectorAll('a.fixed-a-es'), next;
        var url = '';
        if (nextArr.length == 0) return
        for (let i = 0; i < nextArr.length; i++) {
            if (nextArr[i].className.indexOf('active') > -1) {
                if (nextArr[i+1]) url = nextArr[i+1].href;
                break;
            }
        }
        if (url === curSite.pageUrl) return
        curSite.pageUrl = url
        getPageElems(curSite.pageUrl);
    }
    // [漫画DB] 插入数据
    function manhuadb_insertElement(pageElems, type) {
        if (!pageElems) return
        let oriE = document.querySelectorAll(curSite.pager.pageElement.replace('css;', '')),
            repE = getAllElements(curSite.pager.pageElement, pageElems, pageElems);
        if (oriE.length === repE.length) {
            for (let i = 0; i < oriE.length; i++) {
                oriE[i].outerHTML = repE[i].outerHTML;
            }
            // 当前页码 + 1
            pageNum.now = pageNum._now + 1
            manhuadb_init(); // 将刚刚替换的图片插入网页中
        }
    }


    // [HiComic(嗨漫画)] 初始化（将本话其余图片插入网页中）
    function hicomic_init() {
        let _img = '';
        document.querySelectorAll('.chapter > section:not(:first-child) > section[val]').forEach(function (one) {
            let src = one.getAttribute('val');
            if (src.indexOf('!p_c_c_') === -1) src += '!p_c_c_h'
            _img += `<img src="${src}">`
        })
        document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
        window.document.title = window.document.title.replace(/(\(第.+\))? - HiComic/, `(${document.querySelector('.chapter_name').textContent}) - HiComic`); // 修改网页标题（加上 第 X 话）
    }
    // [HiComic(嗨漫画)] 获取下一页地址
    function hicomic_functionNext() {
        let nextId;
        nextId = document.querySelector('.next_chapter:not(.end)')
        if (nextId && nextId.id && nextId.id != 'None') {
            curSite.pageUrl = location.href;
            getPageElems(`https://www.hicomic.net/api/web/chapter/${nextId.id}/contents`, 'json');
        }
    }
    // [HiComic(嗨漫画)] 插入数据
    function hicomic_insertElement(pageElems, type) {
        if (!pageElems || pageElems.code != 200) return
        if (pageElems.results.chapter.next) { // 写入下一页的 UUID
            document.querySelector('.next_chapter').id = pageElems.results.chapter.next;
        } else {
            document.querySelector('.next_chapter').id = 'None';
            document.querySelector('.next_chapter').classList.add('end');
        }
        document.querySelector('.chapter_name').textContent = pageElems.results.chapter.name; // 修改漫画标题
        let title = window.document.title.replace(/(\(第.+\))? - HiComic/, `(${pageElems.results.chapter.name}) - HiComic`)
        window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, title, curSite.pageUrl); // 添加历史记录
        window.document.title = title; // 修改当前网页标题为下一话的标题
        let _img = '';
        for (let i = 0; i < pageElems.results.chapter.contents.length; i++) { // 遍历图片文件名数组，组合为 img 标签
            let src = pageElems.results.chapter.contents[i].url;
            if (src.indexOf('!p_c_c_') === -1) src += '!p_c_c_h';
            _img += `<img src="${src}">`
        }
        document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
        // 当前页码 + 1
        pageNum.now = pageNum._now + 1
    }


    // [动漫之家] 初始化（调整本话其余图片）
    function dmzj_init() {
        let _img = '';
        document.querySelectorAll('.comic_wraCon > a > img').forEach(function (one) {
            _img += `<img src="${one.dataset.original}">`;
            one.parentElement.remove();
        })
        document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中

    }
    // [动漫之家] 获取下一页地址
    function dmzj_functionNext() {
        let next;
        next = document.querySelector('span.next > a[href]')
        if (next) {
            if (next.href === curSite.pageUrl) return
            curSite.pageUrl = next.href;
            getPageElems(curSite.pageUrl);
        }
    }
    // [动漫之家] 插入数据
    function dmzj_insertElement(pageElems, type) {
        if (!pageElems) return
        // 插入并运行 <script>
        let scriptElement = pageElems.querySelectorAll('head > script[type]:not([src])'), scriptText = '';
        scriptElement.forEach(function (one) {scriptText += ';' + one.textContent;});
        if (scriptText) document.body.appendChild(document.createElement('script')).textContent = scriptText;

        // 插入图片
        let _img = '', _img_arr;
        if (pages.indexOf('|') === -1) {
            _img_arr = JSON.parse(pages.replace(/\r\n/g,'|')).page_url.split('|');
        } else {
            _img_arr = JSON.parse(pages).page_url.split('|');
        }
        for (let now of _img_arr) {
            _img += `<img src="${img_prefix}${now}">`;
        }
        if (_img) {
            document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中

            // 添加历史记录
            window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, pageElems.querySelector('title').textContent, curSite.pageUrl);

            // 替换元素
            let oriE = document.querySelectorAll(curSite.pager.replaceE.replace('css;', '')),
                repE = getAllElements(curSite.pager.replaceE, pageElems, pageElems);
            if (oriE.length === repE.length) {
                for (let i = 0; i < oriE.length; i++) {
                    oriE[i].outerHTML = repE[i].outerHTML;
                }
                // 当前页码 + 1
                pageNum.now = pageNum._now + 1
            }
        }
    }


    // [动漫之家-漫画] 初始化（调整本话其余图片）
    function dmzj_manhua_init() {
        let _img = '';
        document.querySelectorAll('#center_box > .inner_img img[src]').forEach(function (one) {
            _img += `<img src="${one.dataset.original}">`;
            one.parentElement.parentElement.remove();
        })
        document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中

    }
    // [动漫之家-漫画] 获取下一页地址
    function dmzj_manhua_functionNext() {
        let next;
        next = document.getElementById('next_chapter')
        if (next) {
            if (next.href === curSite.pageUrl) return
            curSite.pageUrl = next.href;
            getPageElems(curSite.pageUrl);
        }
    }
    // [动漫之家-漫画] 插入数据
    function dmzj_manhua_insertElement(pageElems, type) {
        if (!pageElems) return
        // 插入并运行 <script>
        let scriptElement = pageElems.querySelectorAll('head > script[type]:not([src])'), scriptText = '';
        scriptElement.forEach(function (one) {scriptText += ';' + one.textContent;});
        if (scriptText) document.body.appendChild(document.createElement('script')).textContent = scriptText;

        // 插入图片
        let _img = '';
        for (let now of arr_pages) {
            _img += `<img src="${img_prefix}${now}">`;
        }
        if (_img) {
            document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中

            // 添加历史记录
            window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, pageElems.querySelector('title').textContent, curSite.pageUrl);

            // 替换元素
            let oriE = document.querySelectorAll(curSite.pager.replaceE.replace('css;', '')),
                repE = getAllElements(curSite.pager.replaceE, pageElems, pageElems);
            if (oriE.length === repE.length) {
                for (let i = 0; i < oriE.length; i++) {
                    oriE[i].outerHTML = repE[i].outerHTML;
                }
                // 当前页码 + 1
                pageNum.now = pageNum._now + 1
            }
        }
    }


    // [拷贝漫画] 获取下一页地址
    function copymanga_functionNext() {
        let next;
        next = document.querySelector('.comicContent-next > a[href]')
        if (next) {
            if (next.href === curSite.pageUrl) return
            curSite.pageUrl = next.href;
            getPageElems(curSite.pageUrl);
        }
    }
    // [拷贝漫画] 插入数据
    function copymanga_insertElement(pageElems, type) {
        if (!pageElems) return
        // 添加历史记录
        window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, pageElems.querySelector('title').textContent, curSite.pageUrl);
        let oldImg = document.querySelector('.comicContent-image-list').innerHTML;

        // 替换元素
        let oriE = document.querySelectorAll(curSite.pager.replaceE.replace('css;', '')),
            repE = getAllElements(curSite.pager.replaceE, pageElems, pageElems);
        if (oriE.length === repE.length) {
            for (let i = 0; i < oriE.length; i++) {
                oriE[i].outerHTML = repE[i].outerHTML;
            }
            // 插入并运行 <script>
            document.body.appendChild(document.createElement('script')).src = document.querySelector('body > script[async][src*="comic_content_pass"]').src;
            setTimeout(function(){
                document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), oldImg); // 将 img 标签插入到网页中
            }, 100);
            // 当前页码 + 1
            pageNum.now = pageNum._now + 1
        }
    }


    // [古风漫画网] 获取下一页地址
    function gufengmh8_functionNext() {
        let pageElems = document.querySelector(curSite.pager.pageElement.replace('css;', '')); // 寻找数据所在元素
        if (pageElems) {
            let comicUrl, nextId;
            var url = '';
            pageElems.textContent.split(';').forEach(function (one){ // 分号 ; 分割为数组并遍历
                //console.log(one)
                if (one.indexOf('comicUrl') > -1) { // 下一页 URL 前半部分
                    comicUrl = one.split('"')[1];
                } else if (one.indexOf('nextChapterData') > -1) { // 下一页 URL 的后半部分 ID
                    nextId = one.split('"id":')[1].split(',')[0];
                }
            })
            if (comicUrl && nextId && nextId != 'null') { // 组合到一起就是下一页 URL
                url = comicUrl + nextId + '.html'
                if (url === curSite.pageUrl) return
                curSite.pageUrl = url
                getPageElems(curSite.pageUrl); // 访问下一页 URL 获取
            }
        }
    }
    // [古风漫画网] 插入数据
    function gufengmh8_insertElement(pageElems, type) {
        if (pageElems) {
            let url = curSite.pageUrl;
            pageElems = getAllElements(curSite.pager.pageElement, pageElems, pageElems)[0];
            let chapterImages, chapterPath;
            document.querySelector(curSite.pager.pageElement.replace('css;', '')).innerText = pageElems.textContent; // 将当前网页内的数据所在元素内容改为刚刚获取的下一页数据内容，以便循环获取下一页 URL
            pageElems.textContent.split(';').forEach(function (one){ // 分号 ; 分割为数组并遍历
                //console.log(one)
                if (one.indexOf('chapterImages') > -1) { // 图片文件名数组
                    chapterImages = one.replace(/^.+\[/, '').replace(']', '').replaceAll('"', '').split(',')
                } else if (one.indexOf('chapterPath') > -1) { // 图片文件路径
                    chapterPath = one.split('"')[1];
                } else if (one.indexOf('pageTitle') > -1) { // 网页标题
                    let title = one.split('"')[1];
                    window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, title, url); // 添加历史记录
                    window.document.title = title; // 修改当前网页标题为下一页的标题
                }
            })
            if (chapterImages && chapterPath) {
                let _img = '';
                chapterImages.forEach(function (one2){ // 遍历图片文件名数组，组合为 img 标签
                    _img += '<img src="https://res.xiaoqinre.com/' + chapterPath + one2 + '" data-index="0" style="display: inline-block;">'
                })
                document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
                // 当前页码 + 1
                pageNum.now = pageNum._now + 1
            }
        }
    }


    // [砂之船动漫家] 的插入前函数（加载图片）
    function szcdmj_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            if (one.tagName === 'TITLE') {
                let title = one.textContent;
                window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, title, curSite.pageUrl); // 添加历史记录
                window.document.title = title; // 修改当前网页标题为下一页的标题
                one.style.display = 'none';
            } else {
                let now = one.querySelector('img[data-original]')
                if (now) {
                    now.src = now.dataset.original;
                    now.style.display = 'inline';
                }
            }
        });
        return pageElems
    }


    // 自动无缝翻页
    function pageLoading() {
        if (curSite.SiteTypeID > 0) {
            windowScroll(function (direction, e) {
                if (direction === 'down' && pausePage === true) { // 下滑/没有暂停翻页时，才准备翻页
                    let scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop,
                        scrollHeight = window.innerHeight || document.documentElement.clientHeight,
                        scrollDelta = curSite.pager.scrollDelta;
                    if (curSite.pager.type === 3) { // <<<<< 翻页类型 3（依靠元素距离可视区域底部的距离来触发翻页）>>>>>
                        let scrollElement = document.querySelector(curSite.pager.scrollElement);
                        //console.log(scrollElement.offsetTop - (scrollTop + scrollHeight), scrollDelta, curSite.SiteTypeID)
                        if (scrollElement.offsetTop - (scrollTop + scrollHeight) <= scrollDelta) {
                            if (curSite.SiteTypeID === SiteType.GAMERSKY_GL) curSite.pager.scrollDelta -= 800 // 游民星空 gl 的比较奇葩，需要特殊处理下
                            ShowPager.loadMorePage();
                        }
                    } else {
                        if (document.documentElement.scrollHeight <= scrollHeight + scrollTop + scrollDelta) {
                            if (curSite.pager.type === 2) { // <<<<< 翻页类型 2（网站自带了自动无缝翻页功能，只需要点击下一页按钮即可）>>>>>
                                if (curSite.SiteTypeID > 0) { // 如果指定了间隔时间，那么就依靠这个判断时间到了没有~
                                    let autopbn = document.querySelector(curSite.pager.nextLink);
                                    if (autopbn) { // 寻找下一页链接
                                        // 避免重复点击翻页按钮
                                        if (curSite.pager.nextText) { //          按钮文本，当按钮文本 = 该文本时，才会点击按钮加载下一页
                                            if (autopbn.innerText === curSite.pager.nextText) {autopbn.click(); pageNum.now = pageNum._now + 1;} // 当前页码 + 1
                                        } else if (curSite.pager.nextTextOf) { // 按钮文本的一部分，当按钮文本包含该文本时，才会点击按钮加载下一页
                                            if (autopbn.innerText.indexOf(curSite.pager.nextTextOf) > -1) {autopbn.click(); pageNum.now = pageNum._now + 1;} // 当前页码 + 1
                                        } else if (curSite.pager.nextHTML) { //   按钮内元素，当按钮内元素 = 该元素内容时，才会点击按钮加载下一页
                                            if (autopbn.innerHTML === curSite.pager.nextHTML) {autopbn.click(); pageNum.now = pageNum._now + 1;} // 当前页码 + 1
                                        } else { // 如果没有指定按钮文字就直接点击
                                            autopbn.click(); pageNum.now = pageNum._now + 1; // 当前页码 + 1
                                            // 对于没有按钮文字变化的按钮，可以手动指定间隔时间
                                            if (curSite.pager.intervals) {
                                                let _SiteTypeID = curSite.SiteTypeID; curSite.SiteTypeID = 0;
                                                setTimeout(function(){curSite.SiteTypeID = _SiteTypeID;}, curSite.pager.intervals)
                                            }
                                        }
                                    }
                                }
                            } else if (curSite.pager.type === 1) { // <<<<< 翻页类型 1（由脚本实现自动无缝翻页）>>>>>
                                if (curSite.SiteTypeID > 0) ShowPager.loadMorePage();
                            } else if (curSite.pager.type === 4) { // <<<<< 翻页类型 4（部分简单的动态加载类网站）>>>>>
                                if (curSite.SiteTypeID > 0) {
                                    // 为百度贴吧的发帖考虑...
                                    if (!(document.documentElement.scrollHeight <= scrollHeight + scrollTop + 200 && curSite.SiteTypeID === SiteType.BAIDU_TIEBA)) {
                                        curSite.pager.nextLink();
                                    }
                                    if (curSite.pager.intervals) {
                                        let _SiteTypeID = curSite.SiteTypeID;
                                        curSite.SiteTypeID = 0;
                                        setTimeout(function(){curSite.SiteTypeID = _SiteTypeID;}, curSite.pager.intervals)
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }


    // 启用/禁用 (当前网站)
    function menu_disable(type) {
        switch(type) {
            case 'check':
                if(check()) {return true;} else {return false;}; break;
            case 'add':
                add(); break;
            case 'del':
                del(); break;
        }

        function check() { // 存在返回真，不存在返回假
            let list = GM_getValue('menu_disable'); // 读取网站列表
            if (list.indexOf(location.host) === -1) return false // 不存在返回假
            return true
        }

        function add() {
            if (check()) return
            let list = GM_getValue('menu_disable'); // 读取网站列表
            list.push(location.host); // 追加网站域名
            GM_setValue('menu_disable', list); // 写入配置
            location.reload(); // 刷新网页
        }

        function del() {
            if (!check()) return
            let list = GM_getValue('menu_disable'), // 读取网站列表
            index = list.indexOf(location.host);
            list.splice(index, 1); // 删除网站域名
            GM_setValue('menu_disable', list); // 写入配置
            location.reload(); // 刷新网页
        }
    }


    // 左键双击网页空白处暂停翻页
    function pausePageEvent() {
        if (!GM_getValue('menu_pause_page')) return
        if (curSite.SiteTypeID === 0) return
        document.body.addEventListener('dblclick', function () {
            if (pausePage) {
                pausePage = false;
                GM_notification({text: `❌ 已暂停本页 [自动无缝翻页]\n    （再次双击可恢复）`, timeout: 2000});
            } else {
                pausePage = true;
                GM_notification({text: `✅ 已恢复本页 [自动无缝翻页]\n    （再次双击可暂停）`, timeout: 2000});
            }
        });
    }


    // 显示页码
    function pageNumber(type) {
        if (curSite.SiteTypeID === 0) {let status = document.getElementById('Autopage_number');if (status) {status.style.display = 'none';}; return}
        let status = document.getElementById('Autopage_number');
        switch (type) {
            case 'add':
                add(); break;
            case 'del':
                del(); break;
            case 'set':
                set(); break;
        }

        function add(){
            if (status) {
                if (status.style.display === 'none') {status.style.display = 'flex';}
                return
            }
            // 插入网页
            let _html = `<style>#Autopage_number {top: calc(75vh) !important;left: 0 !important;width: 32px;height: 32px;padding: 6px !important;display: flex;position: fixed !important;opacity: 0.5;transition: .2s;z-index: 1000 !important;cursor: pointer;user-select: none !important;flex-direction: column;align-items: center;justify-content: center;box-sizing: content-box;border-radius: 0 50% 50% 0;transform-origin: center !important;transform: translateX(-8px);background-color: #eee;-webkit-tap-highlight-color: transparent;box-shadow: 1px 1px 3px 0px #aaa !important;color: #000 !important;} #Autopage_number:hover {opacity: 0.9;transform: translateX(0);}</style>
<div id="Autopage_number" title="1. 此处数字为 [当前页码] (可在脚本菜单中关闭)&#10;&#10;2. 鼠标左键点击此处 [临时暂停本页自动无缝翻页]（再次点击可恢复）">${pageNum._now}</div>`
            document.body.insertAdjacentHTML('beforeend', _html);
            // 点击事件（临时暂停翻页）
            document.getElementById('Autopage_number').onclick = function () {
                if (pausePage) {
                    pausePage = false; this.style = 'color: #FF5722 !important; font-style: italic !important;';
                } else {
                    pausePage = true; this.style = '';
                }
            };
            status = document.getElementById('Autopage_number');
            set();
        }
        // 监听储存当前页码的对象值的变化
        function set(){
            Object.defineProperty(pageNum, 'now', {
                set: function(value) {
                    this._now = value;
                    if (status) status.textContent = value;
                }
            });
        }
        function del(){
            if (!status) return
            status.style.display = 'none';
        }
    }


    // 菜单开关
    function menu_switch(menu_status, Name, Tips) {
        if (menu_status === true){
            GM_setValue(Name, false);
        } else {
            GM_setValue(Name, true);
        }
        if (Name === 'menu_page_number') {
            if (menu_status === true){pageNumber('del');} else {pageNumber('add');}
            registerMenuCommand(); // 重新注册脚本菜单
        } else {
            location.reload();}
    };


    // 生成 ID
    function generateID() {
        let num = 0
        for (let val in DBSite) {
            DBSite[val].SiteTypeID = num = num + 1;
        }
    }


    // 判断是支持
    function doesItSupport() {
        setDBSite(); // 配置 DBSite 变量对象

        // 遍历判断是否是某个已支持的网站，顺便直接赋值
        let support = false;
        for (let now in DBSite) { // 遍历对象
            if (!DBSite[now].host) continue; // 如果不存在则继续下一个循环
            if (Array.isArray(DBSite[now].host)) { // 如果是数组
                for (let i of DBSite[now].host) { // 遍历数组
                    if (i === location.host) {
                        if (DBSite[now].functionStart) {
                            DBSite[now].functionStart();
                        } else {
                            curSite = DBSite[now];
                        }
                        support = true; break; // 如果找到了就退出循环
                    }
                }
            } else if (DBSite[now].host instanceof RegExp) {
                if (DBSite[now].host.test(location.host)) {
                    if (self != top) {if (!DBSite[now].iframe) break;} // 如果当前位于 iframe 框架下，就需要判断是否需要执行
                    if (DBSite[now].functionStart) {
                        DBSite[now].functionStart();
                    } else {
                        curSite = DBSite[now];
                    }
                    support = true; break; // 如果找到了就退出循环
                }
            } else if (DBSite[now].host === location.host) {
                if (self != top) {if (!DBSite[now].iframe) break;} // 如果当前位于 iframe 框架下，就需要判断是否需要执行
                if (DBSite[now].functionStart) {
                    DBSite[now].functionStart();
                } else {
                    curSite = DBSite[now];
                }
                support = true; break; // 如果找到了就退出循环
            }
        }

        if (support) {
            console.info('[自动无缝翻页] - 其他网站（独立规则）'); return 1;
        } else if (document.querySelector('meta[name="author"][content*="Discuz!"], meta[name="generator"][content*="Discuz!"]') || (document.querySelector('a[href*="www.discuz.net"]') && document.querySelector('a[href*="www.discuz.net"]').textContent.indexOf('Discuz!') > -1) || (document.getElementById('ft') && document.getElementById('ft').textContent.indexOf('Discuz!') > -1)) {
            console.info('[自动无缝翻页] - Discuz! 论坛'); return 2;
        } else if (document.getElementById('flarum-loading')) {
            console.info('[自动无缝翻页] - Flarum 论坛'); return 3;
        } else if (document.querySelector('link[href*="themes/dux" i], script[src*="themes/dux" i]')) {
            console.info('[自动无缝翻页] - 使用 WordPress DUX 主题的网站'); return 4;
        } else if (self != top) {
            return -1;
        }
        return 0;
    }


    // 获取 Cookie
    function getCookie(name) {
        if (!name) return ''
        let arr = document.cookie.split(';');
        name += '='
        for (let i=0; i<arr.length; i++) {
            let now = arr[i].trim();
            if (now.indexOf(name) == 0) return now.substring(name.length, now.length);
        }
        return '';
    }


    // 类型 4 专用
    function getPageElems(url, type = 'text', method = 'GET', data = '', type2) {
        //console.log(url, data)
        let mimeType = '';
        if (curSite.pager.mimeType) mimeType = curSite.pager.mimeType;
        GM_xmlhttpRequest({
            url: url,
            method: method,
            data: data,
            responseType: type,
            overrideMimeType: mimeType,
            headers: {
                'Referer': location.href,
                'Content-Type': (method === 'POST') ? 'application/x-www-form-urlencoded':''
            },
            timeout: 5000,
            onload: function (response) {
                try {
                    //console.log('最终 URL：' + response.finalUrl, '返回内容：' + response.responseText)
                    switch (type) {
                        case 'json':
                            curSite.pager.insertElement(response.response, type2);
                            break;
                        default:
                            curSite.pager.insertElement(ShowPager.createDocumentByString(response.responseText), type2)
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }


    // 插入位置
    function addTo(num) {
        switch (num) {
            case 1:
                return 'beforebegin'; break;
            case 2:
                return 'afterbegin'; break;
            case 3:
                return 'beforeend'; break;
            case 4:
                return 'afterend'; break;
        }
    }


    // 滚动条事件
    function windowScroll(fn1) {
        var beforeScrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            fn = fn1 || function () {};
        setTimeout(function () { // 延时 1 秒执行，避免刚载入到页面就触发翻页事件
            window.addEventListener('scroll', function (e) {
                var afterScrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                    delta = afterScrollTop - beforeScrollTop;
                if (delta == 0) return false;
                fn(delta > 0 ? 'down' : 'up', e);
                beforeScrollTop = afterScrollTop;
            }, false);
        }, 1000)
    }


    // 修改自 https://greasyfork.org/scripts/14178 , https://github.com/machsix/Super-preloader
    var ShowPager = {
        getFullHref: function (e) {
            if (e != null && e.nodeType === 1 && e.href && e.href.slice(0,4) === 'http') return e.href;
            return '';
        },
        createDocumentByString: function (e) {
            if (e) {
                if ('HTML' !== document.documentElement.nodeName) return (new DOMParser).parseFromString(e, 'application/xhtml+xml');
                var t;
                try { t = (new DOMParser).parseFromString(e, 'text/html');} catch (e) {}
                if (t) return t;
                if (document.implementation.createHTMLDocument) {
                    t = document.implementation.createHTMLDocument('ADocument');
                } else {
                    try {((t = document.cloneNode(!1)).appendChild(t.importNode(document.documentElement, !1)), t.documentElement.appendChild(t.createElement('head')), t.documentElement.appendChild(t.createElement('body')));} catch (e) {}
                }
                if (t) {
                    var r = document.createRange(),
                        n = r.createContextualFragment(e);
                    r.selectNodeContents(document.body);
                    t.body.appendChild(n);
                    for (var a, o = { TITLE: !0, META: !0, LINK: !0, STYLE: !0, BASE: !0}, i = t.body, s = i.childNodes, c = s.length - 1; c >= 0; c--) o[(a = s[c]).nodeName] && i.removeChild(a);
                    return t;
                }
            } else console.error('没有找到要转成 DOM 的字符串');
        },
        loadMorePage: function () {
            if (curSite.pager) {
                var url;
                if (typeof curSite.pager.nextLink == 'function') {
                    url = curSite.pager.nextLink();
                } else {
                    if (curSite.pager.nextLink.slice(0,4) === 'css;') {
                        url = this.getFullHref(getElementByCSS(curSite.pager.nextLink.slice(4)));
                    } else {
                        url = this.getFullHref(getElementByXpath(curSite.pager.nextLink));
                    }
                }
                //console.log(url, curSite.pageUrl);
                if (url === '') return;
                if (curSite.pageUrl === url) return;// 避免重复加载相同的页面
                curSite.pageUrl = url;
                let mimeType = '';
                if (curSite.pager.mimeType) mimeType = curSite.pager.mimeType;
                // 读取下一页的数据
                GM_xmlhttpRequest({
                    url: url,
                    method: 'GET',
                    overrideMimeType: mimeType,
                    headers: {
                        'Referer': location.href
                    },
                    timeout: 5000,
                    onload: function (response) {
                        try {
                            //console.log('最终 URL：' + response.finalUrl, '返回内容：' + response.responseText)
                            var newBody = ShowPager.createDocumentByString(response.responseText);
                            let pageElems = getAllElements(curSite.pager.pageElement, newBody, newBody),
                                toElement = getAllElements(curSite.pager.insertPosition[0])[0];
                            //console.log(curSite.pager.pageElement, pageElems, curSite.pager.insertPosition, toElement)

                            if (pageElems.length >= 0) {
                                // 如果有插入前函数就执行函数
                                if (curSite.function && curSite.function.before) {
                                    if (curSite.function.parameter) { // 如果指定了参数
                                        pageElems = curSite.function.before(curSite.function.parameter);
                                    } else {
                                        pageElems = curSite.function.before(pageElems);
                                    }
                                }

                                // 插入位置
                                let addTo1 = addTo(curSite.pager.insertPosition[1]);

                                // 插入新页面元素
                                pageElems.forEach(function (one) {toElement.insertAdjacentElement(addTo1, one);});

                                // 当前页码 + 1
                                pageNum.now = pageNum._now + 1

                                // 插入 <script> 标签
                                if (curSite.pager.scriptType) {
                                    let scriptText = '';
                                    if (curSite.pager.scriptType === 1) { //         下一页的所有 <script> 标签
                                        const scriptElems = getAllElements('//script', newBody, newBody);
                                        scriptElems.forEach(function (one) {
                                            if (one.src) {
                                                toElement.appendChild(document.createElement('script')).src = one.src;
                                            } else {
                                                scriptText += ';' + one.textContent;
                                            }
                                        });
                                        toElement.appendChild(document.createElement('script')).textContent = scriptText;
                                    } else if (curSite.pager.scriptType === 2) { //  下一页主体元素同级 <script> 标签
                                        pageElems.forEach(function (one) {if (one.tagName === 'SCRIPT') {scriptText += ';' + one.textContent;}});
                                        if (scriptText) toElement.appendChild(document.createElement('script')).textContent = scriptText;
                                    } else if (curSite.pager.scriptType === 3) { //  下一页主体元素同级 <script> 标签（远程文件）
                                        pageElems.forEach(function (one) {if (one.tagName === 'SCRIPT' && one.src) {toElement.appendChild(document.createElement('script')).src = one.src;}});
                                    } else if (curSite.pager.scriptType === 4) { //  下一页主体元素子元素 <script> 标签
                                        pageElems.forEach(function (one) {
                                            const scriptElems = one.querySelectorAll('script');
                                            scriptElems.forEach(function (script) {scriptText += ';' + script.textContent;});
                                        });
                                        if (scriptText) toElement.appendChild(document.createElement('script')).textContent = scriptText;
                                    }
                                }

                                // 添加历史记录
                                if (curSite.pager.history && curSite.pager.history == true) {
                                    window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, newBody.querySelector('title').textContent, curSite.pageUrl);
                                }

                                // 替换待替换元素
                                if (curSite.pager.replaceE) {
                                    try {
                                        let oriE = getAllElements(curSite.pager.replaceE),
                                            repE = getAllElements(curSite.pager.replaceE, newBody, newBody);
                                        //console.log(oriE, repE);
                                        if (oriE.length === repE.length) {
                                            for (let i = 0; i < oriE.length; i++) {
                                                oriE[i].outerHTML = repE[i].outerHTML;
                                            }
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                }
                                // 如果有插入后函数就执行函数
                                if (curSite.function && curSite.function.after) {
                                    if (curSite.function.parameter) { // 如果指定了参数
                                        curSite.function.after(curSite.function.parameter);
                                    } else {
                                        curSite.function.after();
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            }
        },
    };
    function getElementByCSS(css, contextNode = document) {
        return contextNode.querySelector(css);
    }
    function getAllElementsByCSS(css, contextNode = document) {
        return [].slice.call(contextNode.querySelectorAll(css));
    }
    function getElementByXpath(xpath, contextNode, doc = document) {
        contextNode = contextNode || doc;
        try {
            const result = doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            // 应该总是返回一个元素节点
            return result.singleNodeValue && result.singleNodeValue.nodeType === 1 && result.singleNodeValue;
        } catch (err) {
            throw new Error(`Invalid xpath: ${xpath}`);
        }
    }
    function getAllElementsByXpath(xpath, contextNode, doc = document) {
        contextNode = contextNode || doc;
        const result = [];
        try {
            const query = doc.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < query.snapshotLength; i++) {
                const node = query.snapshotItem(i);
                // 如果是 Element 节点
                if (node.nodeType === 1) result.push(node);
            }
        } catch (err) {
            throw new Error(`无效 Xpath: ${xpath}`);
        }
        return result;
    }
    function getAllElements(selector, contextNode = undefined, doc = document, win = window, _cplink = undefined) {
        if (!selector) return [];
        contextNode = contextNode || doc;
        if (typeof selector === 'string') {
            if (selector.search(/^css;/i) === 0) {
                return getAllElementsByCSS(selector.slice(4), contextNode);
            } else {
                return getAllElementsByXpath(selector, contextNode, doc);
            }
        } else {
            const query = selector(doc, win, _cplink);
            if (!Array.isArray(query)) {
                throw new Error('getAllElements 返回错误类型');
            } else {
                return query;
            }
        }
    }

    // 自定义 locationchange 事件（用来监听 URL 变化）
    function addLocationchange() {
        history.pushState = ( f => function pushState(){
            var ret = f.apply(this, arguments);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        })(history.pushState);

        history.replaceState = ( f => function replaceState(){
            var ret = f.apply(this, arguments);
            window.dispatchEvent(new Event('replacestate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        })(history.replaceState);

        window.addEventListener('popstate',()=>{
            window.dispatchEvent(new Event('locationchange'))
        });
    }

    /*// 监听 XMLHttpRequest URL
    var _send = window.XMLHttpRequest.prototype.send
    function sendReplacement(data) {
        console.log(data)
        return _send.apply(this, arguments);
    }
    window.XMLHttpRequest.prototype.send = sendReplacement;
    // 监听 XMLHttpRequest 模式(GET/POST)和数据
    var _open = window.XMLHttpRequest.prototype.open
    function openReplacement(data) {
        console.log(data, arguments)
        return _open.apply(this, arguments);
    }
    window.XMLHttpRequest.prototype.open = openReplacement;*/
})();
