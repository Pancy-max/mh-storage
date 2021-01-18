import formatMethodsByAS from './storageEngines/asyncStorage';
import formatMethodsByLS from './storageEngines/localStorage';
import formatMethodsByWX from './storageEngines/wxStorage';
import { TIME_IN_MS, DELIMITER } from './constants';

export default class MHStorage {

  /**
   * @param @requires {object} args
   * @param {string[]} [args.whiteList = []] 白名单数组
   * @param {object} args.storageEngine 存储引擎
   * @param {string} args.storageType 存储类型：WX、WEB、RN
   * @param {string} [args.keyPrefix = ''] 默认存储前缀
   */
  constructor({
    whiteList = [],
    storageEngine = null,
    storageType = '',
    keyPrefix = ''
  } = {}) {
    this.SE = storageEngine;
    this.whiteList = whiteList;
    this.storageEngine = storageEngine;
    this.storageType = storageType;
    this.keyPrefix = keyPrefix;

    // 内存缓存
    this._cache = Object.create(null);

    // 根据 SE 获取各种适配好的方法对象
    this.SEMethods = this._getSEMethods();

    if (this.keyPrefix) {
      this.keyPrefix = this.keyPrefix + DELIMITER;
    }
  }

  /**
   * 异步保存数据
   * @param {string} key
   * @param {object} value
   * @param {boolean} [item.isEnableCache = true] 是否使用内存缓存
   * @param {string} expireIn 过期时间
   * @return {Promise}
   */
  set(key, value, expireIn = '', isEnableCache = true) {
    ({key, value} = this._set(key, value, expireIn, isEnableCache));

    return this.SEMethods._setItem(key, value);
  }

  /**
   * 同步保存数据
   * @param {string} key
   * @param {object} value
   * @param {boolean} [item.isEnableCache = true] 是否使用内存缓存
   * @param {string} expireIn 过期时间
   * @return {Promise}
   */
  setSync(key, value, expireIn = '', isEnableCache = true) {
    ({key, value} = this._set(key, value, expireIn, isEnableCache));

    try {
      this.SEMethods._setItemSync(key, value);
    } catch(e) {
      delete this._cache(key);

      throw e;
    };
  }

  _set(key, value, expireIn, isEnableCache) {
    if (key.indexOf(DELIMITER) !== -1) {
      throw new Error(`key值不应该含有${DELIMITER}`);
    }
    key = this.keyPrefix + key;
    let serializeValue = JSON.stringify(value);
    if (expireIn) {
      const checkExpireIn = (t) => t.match(/[dhms]$/) && !t.split(/\D$/)[0].match(/\D/);

      if (!checkExpireIn(expireIn)) {
        throw new Error('expireIn参数不合法');
      }

      const expire = new Date().getTime()
        + TIME_IN_MS[expireIn[expireIn.length - 1]] * parseInt(expireIn.split(/\D/)[0]);
      
      console.log('exp', new Date(expire));

      serializeValue = serializeValue + DELIMITER + expire;
    }

    if (isEnableCache) {
      this._cache[key] = serializeValue;
    }
    
    return {key, value: serializeValue};
  }

  /**
   * 异步读取数据
   * @param {string} key
   * @param {boolean} [item.isEnableCache = true] 是否使用内存缓存
   */
  get(key, isEnableCache = true) {
    key = this.keyPrefix + key;
    const cacheData = this._cache[key];

    return (isEnableCache && cacheData)
      ? this._get({key, cacheData})
      : this.SEMethods._getItem(key)
        .catch(() => null)
        .then(data => this._get({key, data}));
  }

  /**
   * 同步读取数据
   * @param {string} key
   * @param {boolean} [item.isEnableCache = true] 是否使用内存缓存
   */
  getSync(key, isEnableCache = true) {
    key = this.keyPrefix + key;
    const cacheData = this._cache[key];
    const data = (isEnableCache && cacheData)
      ? cacheData
      : this.SEMethods._getItemSync(key);
    
    return this._get({key, data});
  }

  _get({key, data}) {
    if (!data) return '';
    const [value, expire] = data.split(DELIMITER);
    if (expire) {
      const now = new Date().getTime();
      if (now > expire) {
        this.remove(key);
        return '';
      }
    }

    return JSON.parse(value);
  }

  /**
   * 异步删除数据
   * @param {string} key
   */
  remove(key) {
    key = key.indexOf(DELIMITER) != -1 ?
      key :
      this.keyPrefix + key;
    delete this._cache[key];
    try {
      this.SEMethods._removeItem(key);
    } catch(e) {
      console.log(e);
    }

    return this;
  }

  /**
   * 同步删除数据
   * @param {object} key
   */ 
  removeSync (key) {
    key = key.indexOf(DELIMITER) != -1 ?
      key :
      this.keyPrefix + key;
    delete this._cache[key];

    this.SEMethods._removeItemSync(key);
  }

  /**
   * 异步清理
   * @param {string[]} whiteList
   */ 
  clear (whiteList = []) {
    // 首先清除缓存
    this._clearFromCache(whiteList)

    return this.SEMethods._clear(whiteList)
}

  /**
   * 同步清理
   * @param {string[]} whiteList
   */ 
  clearSync (whiteList = []) {
    // 首先清除缓存
    this._clearFromCache(whiteList)
    this.SEMethods._clearSync(whiteList)
  }

  _getAllCacheKeys () {
    return Object.keys(this._cache)
  }

  /**
   * 清除 cache 中非白名单数组中的数据
   * @param {string[]} whiteList 白名单数组
   */
  _clearFromCache (whiteList) {
    const allCacheKeys = this._getAllCacheKeys()

    this._getKeysByWhiteList(whiteList)(allCacheKeys)
        .forEach(key => { delete this._cache[key] })
  }

  /**
   * 获取过滤白名单数组后的 keys
   * @param {string[]} whiteList 白名单数组
   */
  _getKeysByWhiteList(whiteList) {
    const mergedWhiteList = [
      ...whiteList,
      ...this.whiteList,
    ];

    return (keys) => keys.filter(
      key => mergedWhiteList
        .every(item => key.indexOf(item) === -1 && key.indexOf(this.keyPrefix) !== -1)
    );
  }

  /**
   * 同步搜索
   * @param {RegExp | Function} filter 正则表达式 | Function
   */ 
  findSync(filter) {
    if (!filter) return [];
    try {
      const { keys } = this.SEMethods._getInfoSync();

      // 过滤前缀符合的keys
      const keyCheckPrefix = (key) =>
        this.keyPrefix ? key.indexOf(this.keyPrefix) !== -1 : key.indexOf(DELIMITER) === -1;

      // 过滤符合正则/Function的keys
      const keyCheckReg = (key) =>
        typeof filter === 'function' ? filter(key) : filter.exec(key);

      const filterPrefixKeys = keys.filter(keyCheckPrefix).map(key =>
        this.keyPrefix ? key.split(this.keyPrefix)[1] : key);

      return filterPrefixKeys.filter(keyCheckReg).map(key => ({
        key, 
        value: this.getSync(key)
      }));
    }catch (err) {
      console.log('find storage fail', err);
    }
  }

  /**
   * 统一规范化 wx、localStorage、AsyncStorage 三种存储引擎的调用方法
   * @return {object | null}
   */
  _getSEMethods () {
    if (this.storageType === 'WX') return formatMethodsByWX.call(this);
    if (this.storageType === 'RN') return formatMethodsByAS.call(this);
    if (this.storageType === 'WEB') return formatMethodsByLS.call(this);
  }

}