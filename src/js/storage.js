// localstorage只能存字符串
let Storage = (() => {
  let prefix = 'h5_reader_'; //在localStorage前加前缀为了防止误操作删除数据
  let StorageGetter = (key) => {
      return localStorage.getItem(prefix + key);
  };
  let StorageSetter = (key, val) => {
      return localStorage.setItem(prefix + key,val);
  };
    return {
        StorageGetter,
        StorageSetter
    };
})();

