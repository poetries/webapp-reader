"use strict";

// ================== 对使用多次的变量进行缓存 提升性能

var DOM = {
    top_nav: $("#top_nav"),
    bottom_nav: $(".bottom_nav"),
    nav_pannel_bg: $(".nav_pannel_bg"),
    font_button: $("#font_button"),
    chapter_content: $("#chapter_content"),
    win: $(window),
    doc: $(document),
    rootContainer: $("body")
};
var ReaderModule;
var readerUI;
var mark = true;

// ============= 工具函数

var Util = function () {
    'use strict';

    var prefix = 'h5_reader_'; //在localStorage前加前缀为了防止误操作删除数据
    var StorageGetter = function StorageGetter(key) {
        return localStorage.getItem(prefix + key);
    };
    var StorageSetter = function StorageSetter(key, val) {
        return localStorage.setItem(prefix + key, val);
    };
    // 数据解密
    var getData = function getData(url, callback) {
        return $.jsonp({
            url: url,
            cache: true,
            callback: 'duokan_fiction_chapter', //duokan_fiction_chapter 回调函数名
            success: function success(result) {
                //debugger
                var data = $.base64.decode(result); // base64对返回的数据进行解码
                var json = decodeURIComponent(escape(data));
                callback(json);
            }
        });
    };
    return {
        StorageGetter: StorageGetter,
        StorageSetter: StorageSetter,
        getData: getData
    };
}();

// ======================  从缓存中读取的信息进行展示


// 字体设置信息初始化 对localStorage进行取值
var initFontSize = parseInt(Util.StorageGetter('font_size'));
if (!initFontSize) {
    initFontSize = 14;
}
DOM.chapter_content.css("font-size", initFontSize);

var bgColor = Util.StorageGetter('background_color');
if (bgColor) {
    DOM.rootContainer.css("background", bgColor);
}
// ============= 入口
function main() {
    ReaderModule = readerModule();
    readerUI = readerBaseStruct(DOM.chapter_content);
    ReaderModule.init(function (data) {
        readerUI(data);
    });
    eventHandle();
}

// ====================== 实现和阅读器相关的数据交互(数据层)
var readerModule = function readerModule() {
    var Chapter_id;
    var chapterTotal;
    var Fiction_id = 'id_';
    var init = function init(UIcallback) {
        getChapterInfo(function () {
            getCurrChapterContent(Chapter_id, function (data) {
                UIcallback && UIcallback(data);
            });
        });
    };
    // 获得章节信息
    var getChapterInfo = function getChapterInfo(callback) {
        $.get('data/chapter.json', function (data) {
            // 获取信息的回调
            Chapter_id = Util.StorageGetter(Fiction_id + 'last_chapter_id');

            if (Chapter_id == null) {
                Chapter_id = data.chapters[1].chapter_id;
            }
            chapterTotal = data.chapters[1].length;
            callback && callback();
        }, 'json');
    };
    // 获得章节内容
    var getCurrChapterContent = function getCurrChapterContent(chapter_id, callback) {

        $.get('data/data' + chapter_id + '.json', function (data) {
            if (data.result == 0) {
                var url = data.jsonp;
                Util.getData(url, function (data) {
                    $('#init_loading').hide();
                    callback && callback(data);
                });
                // $("#m-btn-tab").css("display","none");
            }
        }, 'json');
    };

    // 上一章
    var prevChapter = function prevChapter(UIcallback) {
        Chapter_id = parseInt(Chapter_id, 10);
        if (Chapter_id == 0) {
            return false;
        }
        Chapter_id -= 1;
        getCurrChapterContent(Chapter_id, UIcallback);
        Util.StorageSetter(Fiction_id + 'last_chapter_id', Chapter_id);
    };

    // 下一章
    var nextChapter = function nextChapter(UIcallback) {
        Chapter_id = parseInt(Chapter_id, 10);
        if (Chapter_id == chapterTotal) {
            return false;
        }

        Chapter_id += 1;
        getCurrChapterContent(Chapter_id, UIcallback);
        Util.StorageSetter(Fiction_id + 'last_chapter_id', Chapter_id);
    };
    return {
        init: init,
        prevChapter: prevChapter,
        nextChapter: nextChapter
    };
};

// ========================= 渲染基本的UI结构（UI层）
var readerBaseStruct = function readerBaseStruct(container) {
    var parseChapterData = function parseChapterData(jsonData) {
        var jsonObj = JSON.parse(jsonData);
        var html = '<h4>' + jsonObj.t + '</h4>';

        for (var i = 0; i < jsonObj.p.length; i++) {
            html += '<p>' + jsonObj.p[i] + '</p>';
        }
        return html;
    };
    return function (data) {
        container.html(parseChapterData(data));
    };
};

// ========================== 交互的事件绑定（事件）
var eventHandle = function eventHandle() {

    var hideShowStatus = function hideShowStatus() {
        DOM.nav_pannel_bg.hide();
        DOM.font_button.find(".item-wrap").removeClass("current");
    };

    $("#action-mid").click(function () {
        if (DOM.top_nav.css('display') == 'none') {
            DOM.top_nav.show();
            DOM.bottom_nav.show();
        } else {
            DOM.top_nav.hide();
            DOM.bottom_nav.hide();
            hideShowStatus();
        }
    });
    DOM.font_button.click(function () {
        if (DOM.nav_pannel_bg.css('display') == 'none') {
            DOM.nav_pannel_bg.show();
            DOM.font_button.find(".item-wrap").addClass("current");
        } else {
            hideShowStatus();
        }
    });

    $("#night_day_button").click(function () {

        if (mark) {
            $("#icon-day").show();
            $("#icon-text-day").show();
            $("html").css("background", "#0f1410");
            $("#icon-night").hide();
            $("#icon-text-night").hide();
        } else {
            $("#icon-day").hide();
            $("#icon-text-day").hide();
            $("#icon-night").show();
            $("#icon-text-night").show();
            $("html").css("background", "#fff");
        }
        mark = !mark;
    });
    $(".item").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
    });
    $(".item").click(function () {
        var bg = $(this).css("background");
        DOM.rootContainer.css("background", bg);
        Util.StorageSetter('background_color', bg);
        console.log(Util.StorageGetter('background_color'));
    });
    $("#large-font").click(function () {
        if (initFontSize >= 20) {
            return;
        }
        initFontSize += 1;
        DOM.chapter_content.css("font-size", initFontSize + 'px');
        Util.StorageSetter('font_size', initFontSize);
    });
    $("#small-font").click(function () {
        if (initFontSize <= 12) {
            return;
        }
        initFontSize -= 1;
        DOM.chapter_content.css("font-size", initFontSize + 'px');
        Util.StorageSetter('font_size', initFontSize);
    });
    DOM.win.scroll(function () {
        DOM.top_nav.hide();
        DOM.bottom_nav.hide();
        hideShowStatus();
    });
    $("#prev_button").click(function () {
        //todo获得章节的翻页数据 把数据拿来渲染
        ReaderModule.prevChapter(function (data) {
            readerUI(data);
        });
    });
    $("#next_button").click(function () {
        ReaderModule.nextChapter(function (data) {
            readerUI(data);
        });
    });
    $('.icon-back').click(function () {
        location.href = 'https://github.com/poetries/webapp-reader';
    });
};

main();