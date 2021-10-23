// ==UserScript==
// @name         youtube中文字幕
// @namespace    https://github.com/wlpha/Youtube-Automatic-Translation-V2
// @match        *://www.youtube.com/watch?v=*
// @match        *://www.youtube.com
// @match        *://www.youtube.com/*
// @author       wlpha
// @version      0.2.3
// @run-at       document-start
// @description  油管自动跳广告,机翻中英双语字幕，视频下载，srt字幕下载, 不常看greasyfork，有问题请发邮件：vsq_kuangqi@qq.com
// @homepage     https://greasyfork.org/zh-CN/scripts/406994-youtube%E4%B8%AD%E8%8B%B1%E5%8F%8C%E8%AF%AD%E5%AD%97%E5%B9%95
// ==/UserScript==


(function() {
    var captionWidget = null;
    var captionSubWidget = null;
    var captionConrtol_1 = null;
    var captionConrtol_2 = null;
    var captionUrl_1 = null;
    var captionUrl_2 = null;
    var visiableCaption = false;
    var captionTranslateContent_1 = null;
    var captionTranslateContent_2 = null;
    var hiddenCaptionsTimer_1 = null;
    var hiddenCaptionsTimer_2 = null;
    var captionDelayLoadTime = 1;
    var checkTranslateCaptionTimer = null;
    var hasFetchTranslationButton = null;
    var hasSubtitleLabel = null;
    var saveEnSubtitleButton = null;
    var saveEnSubtitleButton = null;
    var downloadVideoList = null;
    var saveDownloadVideoButton = null;

    var captionFontBottomPosition = window.localStorage.getItem('double-translation-font-position');
    captionFontBottomPosition = captionFontBottomPosition ? captionFontBottomPosition : '60px';
    var captionFontMiniBottomPosition = window.localStorage.getItem('double-translation-font-mini-position');
    captionFontMiniBottomPosition = captionFontMiniBottomPosition ? captionFontMiniBottomPosition : '10px';
    var captionFontSize = window.localStorage.getItem('double-translation-font-size') 
    captionFontSize = captionFontSize ? captionFontSize : '2.0em';
    var captionFontMiniSize = window.localStorage.getItem('double-translation-font-mini-size')
    captionFontMiniSize = captionFontMiniSize ? captionFontMiniSize :'1.4em';
    var captionFontPadding = '0px 6px';
    var captionFontColor = '#ffffff';
    var captionFontTextShadow = '0 0 2px #000';
    var captionFontTextStroke= '#00000f0 3px';
    
    window.doubleTranlationPluginState = {};

    function GenerateCaptionsUrl(toLang)
    {
        var url = window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl;
        /*
        if(url.indexOf('&lang=zh-Hant') !== -1) 
        {
            url = url.replace('&lang=zh-Hant', '&lang=zh-Hans');
        }
        */
        return url + '&fmt=json3&xorb=2&xobt=3&xovt=3&tlang=' + toLang;
    }
    function HasTranslateCaption()
    {
        try
        {
            window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
            return true;
        }catch(err)
        {
            return false;
        }
    }

    function GetCurrentVideoPlayerUrls()
    {
        var url = window.location.href + '&pbj=1';
        var headers = {
                    'x-youtube-client-name': 1,
                    'x-youtube-client-version': window.ytcfg.data_.INNERTUBE_CONTEXT_CLIENT_VERSION,
        };
        if(window.ytcfg.data_.ID_TOKEN) {
          headers['x-youtube-identity-token'] =  window.ytcfg.data_.ID_TOKEN
        };
      
        fetch(url, 
            {
                headers: headers
            })
        .then(function(response) 
        {
            response.json().then(function(response)
            {
                var videoListInfo = [];

                if(typeof response === 'string')
                {
                    response = JSON.parse(response);
                }
                
                for(var i=0; i<response.length; i++)
                {
                    // debugger
                    var item = response[i];
                    if(item.playerResponse)
                    {
                        var data = item.playerResponse;
                        if(data && data.streamingData && data.streamingData.adaptiveFormats) 
                        {
                            var dataList = data.streamingData.adaptiveFormats;
                            for(var x=0; x<dataList.length; x++)
                            {
                                var dataItem = dataList[x];

                                if(!dataItem.url) 
                                {
                                    if(dataItem.signatureCipher) 
                                    {
                                        var dict = DecodeURIParamToDict(dataItem.signatureCipher);
                                        dataItem.url = dict.url + '&' + dict.sp + '=' + encodeURIComponent(DecryptBySignatureCipher(dict.s));
                                    } else 
                                    {
                                        continue;
                                    }
                                }

                                var label = '';

                                if(dataItem.mimeType.indexOf('video/') > -1) 
                                {
                                    var videoType = dataItem.mimeType.match(/(\w+)\/(.*?);/i);
                                    var videoCodec = dataItem.mimeType.match(/codecs="(.*?)"/i)[1];
                                    label = '[视频]' + dataItem.qualityLabel + ';' + videoType[1] + '/' + videoType[2] + ';' + videoCodec;
      
                                } else 
                                {
                                    var videoType = dataItem.mimeType.match(/(\w+)\/(.*?);/i);
                                    var videoCodec = dataItem.mimeType.match(/codecs="(.*?)"/i)[1];
                                    label = '[未知]' + videoType[1] + '/' + videoType[2] + ';' + videoCodec;
                                }

                                var itemInfo = {
                                    'label': label,
                                    'url': dataItem.url
                                }
                                console.log(dataItem);
                                videoListInfo.push(itemInfo);
                                
                            }
                        }
                    }
                }
                
                // 移除原来的
                downloadVideoList.innerHTML = '';
                var option = document.createElement('option');
                option.setAttribute('value', 'none');

                if(videoListInfo.length > 0) 
                {
                    option.innerText = '选择视频下载';
                } else 
                {
                    option.innerText = '获取不到链接';
                }
                
                downloadVideoList.appendChild(option);
                // 添加到列表
                var index = 0;
                for(var i=0; i<videoListInfo.length; i++)
                {
                    var itemInfo = videoListInfo[i];
                    option = document.createElement('option');
                    option.setAttribute('value', itemInfo.url);
                    option.innerText = (++index) + '.' + itemInfo.label;
                    downloadVideoList.appendChild(option);
                }

                downloadVideoList.style.display = 'inline-block';
                saveDownloadVideoButton.style.display = 'inline-block';
                
            });
            
        }).catch(function(err)
        {

        });
    }

    function GetTranslateCaptionsUrl() 
    {
    
        var videoId = window.ytInitialPlayerResponse.videoDetails.videoId;
        var videoTitle = window.ytInitialPlayerResponse.videoDetails.title;
        var videoAuthor = window.ytInitialPlayerResponse.videoDetails.author;
        var videoViewCount = window.ytInitialPlayerResponse.videoDetails.viewCount;

        var captionTracks = window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
        var hasZhHans = false;
        var hasZhHant = false;
        var hasEn = false;
        var defaultLang = null;
        var selectLang = null;

        try
        {


            for(var i=0; i< captionTracks.length; i++)
            {
                var item = captionTracks[i];
                switch(item.languageCode)
                {
                    case 'zh-Hans':
                        hasZhHans = true;
                        break;
                    case 'zh-Hant':
                        hasZhHant = true;
                        break;
                    case 'en':
                        hasEn = true;
                        break;
                    default:
                        defaultLang = item.languageCode;
                        break;
                }
            }

            if(hasZhHans)
            {
                selectLang = 'zh-Hans';
            }
            else if(hasZhHant)
            {
                selectLang = 'zh-Hant';
            }
            else if(hasEn)
            {
                selectLang = 'en';
            }
            else if(defaultLang !== null)
            {
                selectLang = defaultLang;
            }

            // 没有可用翻译字幕
            if(selectLang === null)
            {
                console.log('没有可用翻译字幕');
                return;
            }

            // 双语字幕
            captionUrl_1 = GenerateCaptionsUrl('zh-Hans');
            captionUrl_2 = GenerateCaptionsUrl('en');

            console.log('-----------------youtube自动切换中文字幕(油猴插件)-----------------------');
            console.log('视频标题：' + videoTitle);
            console.log('视频作者：' + videoAuthor);
            console.log('视频ID：' + videoId);
            console.log('播放数：' + videoViewCount);
            console.log('中文字幕：' + captionUrl_1);
            console.log('英文字幕：' + captionUrl_2);
        }catch(e)
        {

        }

    }
  
    function ResetTranslateCaptionsUrl()
    {
        captionUrl_1 = null;
        captionUrl_2 = null;
    }

    function FetchTranslateCaptionsContent()
    {
        visiableCaption = false;
        captionTranslateContent_1 = null;
        captionTranslateContent_2 = null;

        if (captionUrl_1 !== null) {
            fetch(captionUrl_1)
            .then(function(response)
            {
                response.json().then(function(response)
                {
                    visiableCaption = true;
                    captionTranslateContent_1 = response.events;

                    if(hasFetchTranslationButton !== null) {
                        hasFetchTranslationButton.innerText = '正常';
                    }

                    // 显示字幕保存按钮
                    var subtitleContent = GenerateSRTFromZhhans();
                    var fileContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(subtitleContent);
                    var filename = '[中字]' +window.ytInitialPlayerResponse.videoDetails.title + '.srt';
                    saveZhhansSubtitleButton.setAttribute('href', fileContent);
                    saveZhhansSubtitleButton.setAttribute('download', filename);

                    hasSubtitleLabel.style.display = 'inline-block';
                    saveZhhansSubtitleButton.style.display = 'inline-block';

                    console.log('获取到字幕【中文】：成功');
                    
                }).catch(function(err)
                {
                    captionTranslateContent_1 = null;

                    if(hasFetchTranslationButton !== null) {
                        hasFetchTranslationButton.innerText = '失败';
                    }
                    console.log('获取到字幕【中文】：失败2');
                });

            }).catch(function(err)
            {
                captionTranslateContent_1 = null;

                if(hasFetchTranslationButton !== null) {
                    hasFetchTranslationButton.innerText = '失败';
                }
                console.log('获取到字幕【中文】：失败');
            });
        }

        if (captionUrl_2 !== null) {
            fetch(captionUrl_2)
            .then(function(response)
            {
                response.json().then(function(response)
                {
                    visiableCaption = true;
                    captionTranslateContent_2 = response.events;
                    // 显示字幕保存按钮
                    var subtitleContent = GenerateSRTFromEn();
                    var fileContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(subtitleContent);
                    var filename = '[英字]' + window.ytInitialPlayerResponse.videoDetails.title + '.srt';
                    saveEnSubtitleButton.setAttribute('href', fileContent);
                    saveEnSubtitleButton.setAttribute('download', filename);

                    hasSubtitleLabel.style.display = 'inline-block';
                    saveEnSubtitleButton.style.display = 'inline-block';

                    console.log('获取到字幕【英文】：成功');

                }).catch(function(err)
                {
                    console.log(err);
                    captionTranslateContent_2 = null;
                    console.log('获取到字幕【英文】：失败2');
                });

            }).catch(function(err)
            {
                captionTranslateContent_2 = null;
                console.log('获取到字幕【英文】：失败');
            });
        }

    }
    
    function CreateCaptionControl()
    {
        var mainPlayer = document.querySelector('#ytd-player .html5-video-player');
        if(mainPlayer === null) 
        {
            return false;
        }
        

        captionWidget = document.querySelector('#captionWidget');
        captionSubWidget = document.querySelector('#captionSubWidget');
        captionConrtol_1 = document.querySelector('#captionConrtol_1');
        captionConrtol_2 = document.querySelector('#captionConrtol_2');

        if (captionConrtol_1 !== null) {
            captionConrtol_1.style.display = 'none';
        }
        if (captionConrtol_2 !== null) {
            captionConrtol_2.style.display = 'none';
        }

        if(captionWidget !== null)
        {
            return true;
        } else 
        {
            captionWidget = document.createElement('div');
            captionSubWidget = document.createElement('div');
            captionConrtol_1 = document.createElement('p');
            captionConrtol_2 = document.createElement('p');

            captionWidget.id = 'captionWidget';
            captionSubWidget.id = 'captionSubWidget';
            captionConrtol_1.id = 'captionConrtol_1';
            captionConrtol_2.id = 'captionConrtol_2';

   
            mainPlayer.parentElement.style.height = '100%';

            captionWidget.style.pointerEvents = 'none';
            captionWidget.style.position = 'absolute';
            captionWidget.style.zIndex = 99999999;
            captionWidget.style.width = '100%';
            captionWidget.style.height = '100%';
            

            captionSubWidget.style.position = 'absolute';
            captionSubWidget.style.width = '100%';
            captionSubWidget.style.height = 'fit-content';
            captionSubWidget.style.bottom = captionFontBottomPosition;
            
            captionConrtol_1.style.width = captionConrtol_2.style.width = 'fit-content';
            captionConrtol_1.style.width = captionConrtol_2.style.width = '-moz-fit-content';
            captionConrtol_1.style.margin = captionConrtol_2.style.margin = '0 auto';
            captionConrtol_1.style.padding = captionConrtol_2.style.padding = captionFontPadding;
            captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontSize;
            captionConrtol_1.style.backgroundColor = captionConrtol_2.style.backgroundColor = 'rgb(0 0 0 / 0.6)';
            captionConrtol_1.style.color = captionConrtol_2.style.color = captionFontColor;
            captionConrtol_1.style.textShadow = captionConrtol_2.style.textShadow = captionFontTextShadow;
            captionConrtol_1.style.webkitTextStroke = captionConrtol_2.style.webkitTextStroke = captionFontTextStroke;
            captionConrtol_1.style.fontWeight = captionConrtol_2.style.fontWeight = 'bold';
            captionConrtol_1.style.display = captionConrtol_2.style.display = 'none';
            captionConrtol_1.style.wordBreak = captionConrtol_2.style.wordBreak = 'keep-all';

            captionSubWidget.appendChild(captionConrtol_1);
            captionSubWidget.appendChild(captionConrtol_2);
            captionWidget.appendChild(captionSubWidget);

            mainPlayer.prepend(captionWidget);

            captionWidget = document.querySelector('#captionWidget');
            captionSubWidget = document.querySelector('#captionSubWidget');
            captionConrtol_1 = document.querySelector('#captionConrtol_1');
            captionConrtol_2 = document.querySelector('#captionConrtol_2');
        }
    }

    function Wrap()
    {
        return arguments;
    }

    function HiddenDownloadSubtitleButton()
    {
        if(hasSubtitleLabel.style.display === 'inline-block')
        {
            hasSubtitleLabel.style.display = 'none';
        }
        if(saveEnSubtitleButton.style.display === 'inline-block')
        {
            saveEnSubtitleButton.style.display = 'none';
        }
        if(saveZhhansSubtitleButton.style.display === 'inline-block')
        {
            saveZhhansSubtitleButton.style.display = 'none';
        }
    }

    function HiddenDownloadVideoButton()
    {
        if(downloadVideoList.style.display === 'inline-block')
        {
            downloadVideoList.style.display = 'none';
        }
        if(saveDownloadVideoButton.style.display === 'inline-block')
        {
            saveDownloadVideoButton.style.display = 'none';
        }
    }

    function ShowCaption()
    {
        var createElement = document.createElement;
        document.createElement = function(tagName, options)
        {
            var domObject = createElement.apply(document, Wrap(tagName, options));
            if(tagName.toLowerCase() === 'video')
            {
                domObject.addEventListener('ended', function()
                {
                    if(this.classList.contains('html5-main-video'))
                    {
                        HiddenDownloadSubtitleButton();
                        HiddenDownloadVideoButton();
                    }
                });

                domObject.addEventListener('loadstart', function()
                {
                    if(this.classList.contains('html5-main-video'))
                    {
                        
                        if(checkTranslateCaptionTimer !== null)
                        {
                            clearInterval(checkTranslateCaptionTimer);
                            checkTranslateCaptionTimer = null;
                        }
                        checkTranslateCaptionTimer = setInterval(function()
                        {
                            if(HasTranslateCaption())
                            {
                                clearInterval(checkTranslateCaptionTimer);
                                checkTranslateCaptionTimer = null;

                                setTimeout(function()
                                {
                                    try
                                    {
                                        var mainPlayer = domObject;

                                        // 创建字幕控件
                                        CreateCaptionControl();
                                        // 字幕下载按钮隐藏，可能没有字幕
                                        HiddenDownloadSubtitleButton();
                                        // 隐藏下载视频按钮
                                        HiddenDownloadVideoButton();

                                        // 修复字幕不切换问题
                                        ResetTranslateCaptionsUrl();
                                        // 获取字幕url
                                        GetTranslateCaptionsUrl();
                                        FetchTranslateCaptionsContent();
                                        
                                        var lastTime = (+new Date());
                                        mainPlayer.addEventListener('timeupdate', function()
                                        {
                                            // 优化一下，限制速率30帧, 不要频繁进入
                                            var currentTime = (+new Date());
                                            if (currentTime - lastTime > 1000 / 30) {
                                                lastTime = currentTime;
                                            } else 
                                            {
                                                return;
                                            }
                                            // 获取字幕失败
                                            if(!visiableCaption)
                                            {
                                                return;
                                            }
                                            // 主动关闭字幕
                                            if(!GetTranslationState()) 
                                            {
                                                return;
                                            }
                                            // 创建字幕控件
                                            CreateCaptionControl();

                                            // 有些视频没有字幕, 所以导致显示上个视频字幕, 判断按钮隐藏字幕
                                            var subtitlesBtn = document.querySelector('.ytp-subtitles-button');
                                            if(subtitlesBtn === null || subtitlesBtn.style.display === 'none')
                                            {
                                                return;
                                            }
    
                                            // 判断迷你模式
                                            var miniPlayer = document.querySelector('.ytp-miniplayer-ui');
                                            if(miniPlayer && miniPlayer.style.display !== 'none')
                                            {
                                                // 迷你模式
                                                captionSubWidget.style.bottom = captionFontMiniBottomPosition;
                                                captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontMiniSize;
                                            } else 
                                            {
                                                // 正常模式
                                                captionSubWidget.style.bottom = captionFontBottomPosition;
                                                captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontSize;
                                            }
    
    
                                            var time = mainPlayer.currentTime * 1000;
                                            
                                            // 中文字幕
                                            if(captionTranslateContent_1 != null && captionTranslateContent_1 instanceof Array)
                                            {
                                                for(var i=0; i<captionTranslateContent_1.length; i++)
                                                {
                                                    var item = captionTranslateContent_1[i];
                                                    if(!item || !item.segs || !(item.segs instanceof Array)) 
                                                    {
                                                        continue;
                                                    }
                                                    if(time >= item.tStartMs && time <= item.tStartMs + item.dDurationMs)
                                                    {
                                                        var endTime = item.tStartMs + item.dDurationMs - time;
                                                        if(captionConrtol_1 !== null)
                                                        {
                                                            try
                                                            {
                                                                var text = [];
                                                                for(var k=0; k < item.segs.length; k++) 
                                                                {
                                                                    text.push(item.segs[k].utf8);
                                                                }
                                                                var displayText = text.join(' ');
                                                                displayText = displayText.replace(/\s+/ig, ' ');
                                                                if(captionConrtol_1.innerHTML !== displayText) 
                                                                {
                                                                    captionConrtol_1.innerHTML = displayText;
                                                                }

                                                                if(captionConrtol_1.style.display !== 'block') 
                                                                {
                                                                    captionConrtol_1.style.display = 'block';
                                                                    if (hiddenCaptionsTimer_1 !== null) {
                                                                        clearTimeout(hiddenCaptionsTimer_1);
                                                                    }
                                                                    hiddenCaptionsTimer_1 = setTimeout(function()
                                                                    {
                                                                        captionConrtol_1.style.display = 'none';
                                                                        clearTimeout(hiddenCaptionsTimer_1);
                                                                        hiddenCaptionsTimer_1 = null;
                                                                    }, endTime);
                                                                }
                                                            }catch(err)
                                                            {
                                                                continue;
                                                            }
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
                                            
                                            // 英文字幕
                                            // 屏蔽英文字幕
                                            if(void 0 && captionTranslateContent_2 != null && captionTranslateContent_2 instanceof Array)
                                            {
                                                for(var i=0; i<captionTranslateContent_2.length; i++)
                                                {
                                                    var item = captionTranslateContent_2[i];
                                                    if(!item || !item.segs || !(item.segs instanceof Array)) 
                                                    {
                                                        continue;
                                                    }
                                                    if(time >= item.tStartMs && time <= item.tStartMs + item.dDurationMs)
                                                    {
                                                        var endTime = item.tStartMs + item.dDurationMs - time;
                                                        if(captionConrtol_2 !== null)
                                                        {
                                                            try
                                                            {
                                                                var text = [];
                                                                for(var k=0; k < item.segs.length; k++) 
                                                                {
                                                                    text.push(item.segs[k].utf8);
                                                                }
                                                                var displayText = text.join(' ');
                                                                displayText = displayText.replace(/\s+/ig, ' ');
                                                                if(captionConrtol_2.innerHTML !== displayText) 
                                                                {
                                                                    captionConrtol_2.innerHTML = displayText;
                                                                }

                                                                if(captionConrtol_2.style.display !== 'block') 
                                                                {
                                                                    captionConrtol_2.style.display = 'block';
                                                                    if (hiddenCaptionsTimer_2 !== null) {
                                                                        clearTimeout(hiddenCaptionsTimer_2);
                                                                    }
                                                                    hiddenCaptionsTimer_2 = setTimeout(function()
                                                                    {
                                                                        captionConrtol_2.style.display = 'none';
                                                                        clearTimeout(hiddenCaptionsTimer_2);
                                                                        hiddenCaptionsTimer_2 = null;
                                                                    }, endTime);
                                                                }
                                                            }catch(err)
                                                            {
                                                                continue;
                                                            }
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
    
                                        });
                                    }catch(err)
                                    {

                                    }
                                    
                                }, captionDelayLoadTime);
                            }
                        }, 300);
                        
                    }
                });
            }
            return domObject;
        }

    }

    function isVideoAdsTime(){
        var ad = document.querySelector('.ad-showing');
        var skipAdButton = document.querySelector('.ytp-ad-skip-button');

        var volumeOpenState = document.querySelector("#ytp-svg-volume-animation-mask");
        var volumeButton = document.querySelector('.ytp-mute-button');

        // 底部广告
        var ads = document.querySelector('.ytp-ad-overlay-container');
        if(ads !== null)
        {
            ads.style.display = 'none';
        }

        /*
        // 判断有没有广告
        if(ad){
            // 关闭音量
            if(volumeOpenState && volumeButton)
            {
                volumeButton.click();
            }
        } else {
            // 正常视频，打开音量
            if(volumeOpenState == null && volumeButton){
                volumeButton.click();
            }
        }
        */
        
        // 跳过广告
        if(skipAdButton)
        {
            skipAdButton.click();
        }
        return ad != null;
    }

    function FuckAds()
    {
        setInterval(function()
        {
            try
            {
                isVideoAdsTime();
            }catch(err)
            {

            }

        }, 200);
    }

    function HookDataUpdate()
    {
        setInterval(function()
        {
            try
            {
                var pageManger = document.querySelector('#page-manager');
                if(pageManger !== null)
                {
                    if(pageManger.isHook !== undefined)
                    {
                        return;
                    }
                    pageManger.isHook = true;
                    var oldUpdatePageData = pageManger.updatePageData;
                    var updatePageData = function(data)
                    {
                        try
                        {
                            window.ytInitialPlayerResponse = data.playerResponse;
                            // 修复字幕不切换问题
                            ResetTranslateCaptionsUrl();
                            GetTranslateCaptionsUrl();
                            FetchTranslateCaptionsContent();
                        }catch(err)
                        {

                        }
                        
                        return oldUpdatePageData.apply(this, arguments);
                    }
                    
                    if(oldUpdatePageData !== updatePageData)
                    {
                       pageManger.updatePageData = updatePageData;
                    }
                }
            }catch(err)
            {

            }
        }, 1000);
        
    }

    function GetTranslationState()
    {
        return window.localStorage.getItem('double-translation-plugin-state') === 'on';
    }

    function AddTranslationButton() 
    {  
        var coltrolPanel = document.querySelector('.ytp-chrome-controls .ytp-right-controls');
        if(coltrolPanel && coltrolPanel.querySelector('.double-translation-plugin-btn') == null) {
            // 开启字幕
            var translationButton = document.createElement('button');
            translationButton.className = 'double-translation-plugin-btn';
            translationButton.style = 'position: relative;top: -36%; margin-right:10px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';

            translationButton.onclick = function(){
                var translationState = window.localStorage.getItem('double-translation-plugin-state');
                if(translationState == 'on') {
                    window.localStorage.setItem('double-translation-plugin-state', 'off');
                    translationButton.innerText = '开启字幕';
                    // 隐藏字幕
                    captionConrtol_1.style.display = captionConrtol_2.style.display = 'none';
                } else {
                    window.localStorage.setItem('double-translation-plugin-state', 'on');
                    translationButton.innerText = '关闭字幕';
                }
            }

            if(GetTranslationState()){
                translationButton.innerText = '关闭字幕';
            } else {
                translationButton.innerText = '开启字幕';
            }
            // 屏蔽youtube强行添加的事件
            translationButton.addEventListener = function() {};
  

            // 添加设置事件

            // 字体减大小
            var fontDecSizeButton = document.createElement('button');
            fontDecSizeButton.className = 'double-translation-plugin-font-dec-size-btn';
            fontDecSizeButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            fontDecSizeButton.innerText = '-';
            fontDecSizeButton.onclick = function() {
                var miniPlayer = document.querySelector('.ytp-miniplayer-ui');
                if(miniPlayer && miniPlayer.style.display !== 'none')
                {
                    // 迷你模式
                    var fontSize = parseFloat(captionFontMiniSize) - 0.1;
                    if(fontSize <= 0.1) 
                    {
                        fontSize = 0.1
                    }
                    fontSize = fontSize + 'em';
                    captionFontMiniSize = fontSize;
                    window.localStorage.setItem('double-translation-font-mini-size', captionFontMiniSize);
                    captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontMiniSize;
                } else 
                {
                    // 正常模式
                    var fontSize = parseFloat(captionFontSize) - 0.1;
                    if(fontSize <= 0.1) 
                    {
                        fontSize = 0.1
                    }
                    fontSize = fontSize + 'em';
                    captionFontSize = fontSize;
                    window.localStorage.setItem('double-translation-font-size', captionFontSize);
                    captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontSize;
                }
            }
            
            // 字体加大小
            var fontAddSizeButton = document.createElement('button');
            fontAddSizeButton.className = 'double-translation-plugin-font-add-size-btn';
            fontAddSizeButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            fontAddSizeButton.innerText = '+';
            fontAddSizeButton.onclick = function() {
                var miniPlayer = document.querySelector('.ytp-miniplayer-ui');
                if(miniPlayer && miniPlayer.style.display !== 'none')
                {
                    // 迷你模式
                    var fontSize = parseFloat(captionFontMiniSize) + 0.1;
                    if(fontSize >= 10) 
                    {
                        fontSize = 10
                    }
                    fontSize = fontSize + 'em';
                    captionFontMiniSize = fontSize;
                    window.localStorage.setItem('double-translation-font-mini-size', captionFontMiniSize);
                    captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontMiniSize;
                } else 
                {
                    // 正常模式
                    var fontSize = parseFloat(captionFontSize) + 0.1;
                    if(fontSize >= 10) 
                    {
                        fontSize = 10
                    }
                    fontSize = fontSize + 'em';
                    captionFontSize = fontSize;
                    window.localStorage.setItem('double-translation-font-size', captionFontSize);
                    captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontSize;
                }
            }
            // 字体向上
            var fontUpButton = document.createElement('button');
            fontUpButton.className = 'double-translation-plugin-font-add-size-btn';
            fontUpButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            fontUpButton.innerText = '▲';
            fontUpButton.onclick = function() {
                var miniPlayer = document.querySelector('.ytp-miniplayer-ui');
                if(miniPlayer && miniPlayer.style.display !== 'none')
                {
                    // 迷你模式
                    var position = parseFloat(captionFontMiniBottomPosition) + 2;
                    position = position + 'px';
                    captionFontMiniBottomPosition = position;
                    window.localStorage.setItem('double-translation-font-mini-position', captionFontMiniBottomPosition);
                    captionSubWidget.style.bottom = captionFontMiniBottomPosition;
                } else 
                {
                    // 正常模式
                    var position = parseFloat(captionFontBottomPosition) + 2;
                    position = position + 'px';
                    captionFontBottomPosition = position;
                    window.localStorage.setItem('double-translation-font-position', captionFontBottomPosition);
                    captionSubWidget.style.bottom = captionFontBottomPosition;
                }
            }
            // 字体向下
            var fontDownButton = document.createElement('button');
            fontDownButton.className = 'double-translation-plugin-font-add-size-btn';
            fontDownButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            fontDownButton.innerText = '▼';
            fontDownButton.onclick = function() {
                var miniPlayer = document.querySelector('.ytp-miniplayer-ui');
                if(miniPlayer && miniPlayer.style.display !== 'none')
                {
                    // 迷你模式
                    var position = parseFloat(captionFontMiniBottomPosition) - 2;
                    position = position + 'px';
                    captionFontMiniBottomPosition = position;
                    window.localStorage.setItem('double-translation-font-mini-position', captionFontMiniBottomPosition);
                    captionSubWidget.style.bottom = captionFontMiniBottomPosition;
                } else 
                {
                    // 正常模式
                    var position = parseFloat(captionFontBottomPosition) - 2;
                    position = position + 'px';
                    captionFontBottomPosition = position;
                    window.localStorage.setItem('double-translation-font-position', captionFontBottomPosition);
                    captionSubWidget.style.bottom = captionFontBottomPosition;
                }
            }
            

            // 重置按钮
            var fontResetButton = document.createElement('button');
            fontResetButton.className = 'double-translation-plugin-font-reset-btn';
            fontResetButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            fontResetButton.innerText = '重置';
            fontResetButton.onclick = function() {

                var miniPlayer = document.querySelector('.ytp-miniplayer-ui');
                if(miniPlayer && miniPlayer.style.display !== 'none')
                {
                    // 迷你模式
                    captionFontMiniBottomPosition = '10px';
                    window.localStorage.setItem('double-translation-font-mini-position', captionFontMiniBottomPosition);
                    captionFontMiniSize = '1.4em';
                    window.localStorage.setItem('double-translation-font-mini-size', captionFontMiniSize);

                    captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontMiniSize;
                    captionSubWidget.style.bottom = captionFontMiniBottomPosition;
                } 
                else 
                {
                    // 正常模式
                    captionFontBottomPosition = '60px';
                    window.localStorage.setItem('double-translation-font-position', captionFontBottomPosition);
                    captionFontSize = '2.0em';
                    window.localStorage.setItem('double-translation-font-size', captionFontSize);

                    captionConrtol_1.style.fontSize = captionConrtol_2.style.fontSize = captionFontSize;
                    captionSubWidget.style.bottom = captionFontBottomPosition;
                }
            }

            // 保存中文字幕
            saveZhhansSubtitleButton = document.createElement('a');
            saveZhhansSubtitleButton.style.display = 'none';
            var _saveZhhansSubtitleButton = document.createElement('button');
            _saveZhhansSubtitleButton.className = 'double-translation-plugin-download-zhhans-subtitle-btn';
            _saveZhhansSubtitleButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            _saveZhhansSubtitleButton.innerText = '中字';
            saveZhhansSubtitleButton.appendChild(_saveZhhansSubtitleButton);

            // 保存英文字幕
            saveEnSubtitleButton = document.createElement('a');
            saveEnSubtitleButton.style.display = 'none';
            var _saveEnSubtitleButton  = document.createElement('button');
            _saveEnSubtitleButton.className = 'double-translation-plugin-download-en-subtitle-btn';
            _saveEnSubtitleButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            _saveEnSubtitleButton.innerText = '英字';
            saveEnSubtitleButton.appendChild(_saveEnSubtitleButton);


            hasSubtitleLabel = document.createElement('span');
            hasSubtitleLabel.className = 'double-translation-plugin-download-label';
            hasSubtitleLabel.style = 'position: relative;top: -36%; margin-right:3px; color: #fff; outline:none; font-weight: bold;display:none;';
            hasSubtitleLabel.innerText = '字幕下载:';


            hasFetchTranslationButton = document.createElement('button');
            hasFetchTranslationButton.className = 'double-translation-plugin-has-translation-btn';
            hasFetchTranslationButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            hasFetchTranslationButton.innerText = '正常';

            // 视频下载
            downloadVideoList = document.createElement('select');
            downloadVideoList.className = 'double-translation-plugin-download-video-list';
            downloadVideoList.style = 'position: relative;top: -36%; margin-right:3px; opacity: 0.95; display:none;';
            downloadVideoList.onchange = function()
            {
                if(this.value === 'none')
                {
                    return;
                } else 
                {
                    // window.open(this.value, '_new' , 'video download');
                    var fileContent =  this.value;
                    var filename = window.ytInitialPlayerResponse.videoDetails.title + '.mp4';
                    saveDownloadVideoButton.setAttribute('download-url', fileContent);
                    saveDownloadVideoButton.setAttribute('download', filename);
                }
            }

            saveDownloadVideoButton = document.createElement('a');
            saveDownloadVideoButton.style.display = 'none';
            saveDownloadVideoButton.href = 'javascript:;';

            var _saveDownloadVideoButton  = document.createElement('button');
            _saveDownloadVideoButton.className = 'double-translation-plugin-download-en-subtitle-btn';
            _saveDownloadVideoButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none; ';
            _saveDownloadVideoButton.innerText = '下载';
            _saveDownloadVideoButton.onclick = function()
            {
                var downUrl = this.parentElement.getAttribute('download-url');
                if(!downUrl) 
                {
                    alert('请先选择需要下载的视频');
                } else 
                {
                    prompt('请复制地址到迅雷进行下载', downUrl);
                }
                
            }
            saveDownloadVideoButton.appendChild(_saveDownloadVideoButton);
            
            // 刷新视频下载地址
            var refreshVideoButton = document.createElement('a');
            refreshVideoButton.href = 'javascript:;';
            var _refreshVideoButton  = document.createElement('button');
            _refreshVideoButton.className = 'double-translation-plugin-download-en-subtitle-btn';
            _refreshVideoButton.style = 'position: relative;top: -36%; margin-right:3px; border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';
            _refreshVideoButton.innerText = '刷新';
            _refreshVideoButton.onclick = function()
            {
                HiddenDownloadVideoButton();
                GetCurrentVideoPlayerUrls();
            }
            refreshVideoButton.appendChild(_refreshVideoButton);


            // 管理面板
            var panel = document.createElement('div');
            panel.style.position = 'absolute';
            panel.style.bottom = '100%';
            panel.style.right = '0';


            panel.prepend(translationButton);
            panel.prepend(hasFetchTranslationButton);
            panel.prepend(fontResetButton);
            panel.prepend(fontAddSizeButton);
            panel.prepend(fontDecSizeButton);
            panel.prepend(fontDownButton);
            panel.prepend(fontUpButton);
            
            panel.prepend(saveZhhansSubtitleButton);
            panel.prepend(saveEnSubtitleButton);
            // panel.prepend(hasSubtitleLabel);

            panel.prepend(saveDownloadVideoButton);
            panel.prepend(downloadVideoList);

            panel.prepend(refreshVideoButton);
            coltrolPanel.prepend(panel);
            return true;
        }
    }

    function CalcTime(time)
    {
        var second = Math.floor(time / 1000);
        var minute = Math.floor(second / 60);
        var hour = Math.floor(minute / 60);
        minute = Math.floor(minute - hour * 60);
        second = Math.floor(second - minute * 60 - hour * 60 * 60);
        ms = Math.floor(time - (second + minute * 60 + hour * 60 * 60));

        hour = '00' + hour
        minute = '00' + minute
        second = '00' + second
        ms = ms + '000'

        hour = hour.substr(hour.length - 2, hour.length);
        minute = minute.substr(minute.length - 2, minute.length);
        second = second.substr(second.length - 2, second.length);
        ms = ms.substr(0, 3);
        return [hour, minute, second].join(':') + '.' + ms;
    }

    // 生成中文字幕
    function GenerateSRTFromZhhans() {
        var result = [];
        var index = 0;
        if(captionTranslateContent_1 != null && captionTranslateContent_1 instanceof Array)
        {
            for(var i=0; i<captionTranslateContent_1.length; i++)
            {
                var item = captionTranslateContent_1[i];
                if(!item || !item.segs || !(item.segs instanceof Array)) 
                {
                    continue;
                }
                var text = [];
                for(var k=0; k < item.segs.length; k++) 
                {
                    text.push(item.segs[k].utf8);
                }
                var displayText = text.join('').trim();
                displayText = displayText.replace(/\s+/ig, ' ');
                var displayTime = [CalcTime(parseInt(item.tStartMs)), CalcTime(parseInt(item.tStartMs) + parseInt(item.dDurationMs))].join(' --> ');
                if(displayText.length > 0) 
                {
                    result.push(++index);
                    result.push(displayTime);
                    result.push(displayText + '\n');
                }
            }
        }

        return result.join('\n');
    }

    // 生成英文字幕
    function GenerateSRTFromEn()
    {
        var result = [];
        var index = 0;
        if(captionTranslateContent_2 != null && captionTranslateContent_2 instanceof Array)
        {
            for(var i=0; i<captionTranslateContent_2.length; i++)
            {
                var item = captionTranslateContent_2[i];
                if(!item || !item.segs || !(item.segs instanceof Array)) 
                {
                    continue;
                }
                var text = [];
                for(var k=0; k < item.segs.length; k++) 
                {
                    text.push(item.segs[k].utf8);
                }
                var displayText = text.join(' ').trim();
                displayText = displayText.replace(/\s+/ig, ' ');
                var displayTime = [CalcTime(parseInt(item.tStartMs)), CalcTime(parseInt(item.tStartMs) + parseInt(item.dDurationMs))].join(' --> ');
                if(displayText.length > 0) 
                {
                    result.push(++index);
                    result.push(displayTime);
                    result.push(displayText + '\n');
                }
            }
        }
        return result.join('\n');
    }

    function DecodeURIParamToDict(a) 
    {
        a = a.split("&");
        for (var b = {}, c = 0, d = a.length; c < d; c++) {
            var e = a[c].split("=");
            if (1 == e.length && e[0] || 2 == e.length)
                try {
                    var f = decodeURIComponent(e[0] || "")
                      , h = decodeURIComponent(e[1] || "");
                    f in b ? Array.isArray(b[f]) ? vb(b[f], h) : b[f] = [b[f], h] : b[f] = h
                } catch (m) {
                    if ("q" != e[0]) {
                        var l = Error("Error decoding URL component");
                        l.params = {
                            key: e[0],
                            value: e[1]
                        };
                        throw(l)
                    }
                }
        }
        return b
    };

    // youtube视频解密
    function DecryptBySignatureCipher(s)
    {
        var Vu = {
            oG: function(a) {
                a.reverse()
            },
            Eu: function(a, b) {
                var c = a[0];
                a[0] = a[b % a.length];
                a[b % a.length] = c
            },
            zH: function(a, b) {
                a.splice(0, b)
            }
        };  
        
        a = s.split("");
        Vu.Eu(a, 29);
        Vu.oG(a, 9);
        Vu.Eu(a, 38);
        Vu.oG(a, 66);
        return a.join("")
    }

    function Main()
    {
        FuckAds();
        // 没法hook ajax，所以只能这么这样更新字幕数据
        setInterval(AddTranslationButton, 500);
        HookDataUpdate();
        ShowCaption();
    }
    

    Main();

})();
