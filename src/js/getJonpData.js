let getJsonpData = (() => {
    let getData = (url, callback) => {
      return $.jsonp({
         url: url,
         cache: true,
         callback: 'duokan_fiction_chapter', //duokan_fiction_chapter 回调函数名
         success: (result) => {
              //debugger
              let data = $.base64.decode(result);// base64对返回的数据进行解码
              let json = decodeURIComponent(escape(data));
              callback(data);
          }
      });
    };
    return {
        getData
    };
})();