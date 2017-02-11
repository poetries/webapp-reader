import {storage} from './storage.js';
import {getJonpData} from './getJonpData.js';

// 对使用多次的变量进行缓存 提升性能
const DOM = {
    top_nav: $("#top_nav"),
    bottom_nav: $(".bottom_nav"),
    nav_pannel_bg: $(".nav_pannel_bg"),
    font_button: $("#font_button"),
    chapter_content: $("#chapter_content"),
    win: $(window),
    doc: $(document)
};


// 初始化 对localStorage进行取值
// localstorage只能存字符串 取得时候去字符串
let initFontSize = parseInt(Storage.StorageGetter('font_size'));

if (!initFontSize) {
    initFontSize = 14;
}

DOM.chapter_content.css("font-size",initFontSize);



// 实现和阅读器相关的数据交互
let readerModule = () => {
    let Chapter_id;
    let chapterTotal;
    let init = (UIcallback) => {
        /**
        getChapterInfo(() => {
            getCurrChapterContent(Chapter_id, (data) => {
                UIcallback && UIcallback(data);
            });
        });**/
        // Promise 改善
        getChapterInfoPromise().then((d) => {
            return getCurrChapterContentPromise();
        }).then((data) => {
            UIcallback && UIcallback(data);
        });
    };
    /**
    let getChapterInfo = (callback) => {
      $.get('/data/chapter.json',(data) => {
            // todo获取信息的回调
          Chapter_id = Storage.StorageGetter('last_chapter_id');
          if (Chapter_id == null) {
              Chapter_id = data.chapters[1].chapter_id;
          }
          chapterTotal = data.chapters[1].length;
          callback && callback();
      }, 'json');
    };**/

    // Promise改善异步回调操作
    let getChapterInfoPromise = () => {
        return new Promise((resolve, reject) => {
             $.get('/data/chapter.json',(data) => {
                // todo获取信息的回调
                if (data.result == 0) { // 成功的时候
                    Chapter_id = Storage.StorageGetter('last_chapter_id');
                    if (Chapter_id == null) {
                        Chapter_id = data.chapters[1].chapter_id;
                    }
                    chapterTotal = data.chapters[1].length;
                    resolve();
                } else { // fail
                    reject();
                }

            }, 'json');
        });
    };


    /**
    let getCurrChapterContent = (chapter_id,callback) => {
      $.get('data/data' + Chapter_id + '.json', (data) => {
          if (data.result == 0) {
              let url = data.jsonp;
              getJsonpData.getData(url, () => {
                  callback && callback(data);
              });
          }
      }, 'json');
    };**/

    // Promise改善异步回调操作
    let getCurrChapterContentPromise = () => {
        return new Promise((resolve, reject) => {
             $.get('data/data' + Chapter_id + '.json', (data) => {
                if (data.result == 0) {
                    let url = data.jsonp;
                    getJonpData.getData(url, () => {
                        resolve(data);
                    });
                } else {
                    reject({msg:'fail'});
                }
            }, 'json');
        });
    };
    let prevChapter = (UIcallback) => {
        Chapter_id = parseInt(Chapter_id,10);
        if (Chapter_id == 0) {
            return;
        }
        Chapter_id -= 1;
        getCurrChapterContent(cid, UIcallback);
        storage.StorageSetter('last_chapter_id',Chapter_id);
    };
    let nextChapter = (UIcallback) => {
        Chapter_id = parseInt(Chapter_id,10);
        if (Chapter_id == chapterTotal) {
            return;
        }
        Chapter_id += 1;
        getCurrChapterContent(cid, UIcallback);
        Storage.StorageSetter('last_chapter_id',Chapter_id);
    };
    return { // 暴露接口
        init,
        prevChapter,
        nextChapter
    }
};

// 渲染基本的UI结构
let readerBaseStruct = (container) => {
    let parseChapterData = (jsonData) => {
      let json = JSON.parse(jsonData);
      let html = '<h4>' + json.t + '</h4>';

      for (var i = 0; i < json.p.length; i++) {
        html +='<p>' + json.p[i] + '</p>';
      }
        return html;
    };
    return (data) => {
        container.html(parseChapterData(data));
    };
};

// 交互的事件绑定
let eventHandle = () => {
    let hideShowStatus = () => {
        DOM.nav_pannel_bg.hide();
        DOM.font_button.find(".item-wrap").removeClass("current");
    };

    $("#action-mid").click(() => {
       if (DOM.top_nav.css('display') == 'none') {
            DOM.top_nav.show();
            DOM.bottom_nav.show();
       } else {
            DOM.top_nav.hide();
            DOM.bottom_nav.hide();
            hideShowStatus();
       }
    });
    DOM.font_button.click(() => {
        if (DOM.nav_pannel_bg.css('display') == 'none') {
            DOM.nav_pannel_bg.show();
            DOM.font_button.find(".item-wrap").addClass("current");
        } else {
            hideShowStatus();
        }
    });
    $("#night_day_button").click(() => {
        //todo触发背景切换的事件
    });
    $("#large-font").click(() => {
        if (initFontSize >= 20) {
            return;
        }
        initFontSize +=1;
        DOM.chapter_content.css("font-size",initFontSize+'px');
        Storage.StorageSetter('font_size',initFontSize);
    });
    $("#small-font").click(() => {
        if (initFontSize <= 12){
            return;
        }
        initFontSize -=1;
        DOM.chapter_content.css("font-size",initFontSize+'px');
        Storage.StorageSetter('font_size',initFontSize);
    });
    DOM.win.scroll(() => {
        DOM.top_nav.hide();
        DOM.bottom_nav.hide();
        hideShowStatus();
    });
    $("#prev_button").click(() => {
       //todo获得章节的翻页数据 把数据拿来渲染
       readerModule().prevChapter((data) => {
           readerUI(data);
       });
    });
    $("#next_button").click(() => {
        readerModule().nextChapter((data) => {
            readerUI(data);
        });
    });
};

export default{
    eventHandle,
    readerBaseStruct,
    readerModule
};
