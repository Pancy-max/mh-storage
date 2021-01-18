import { PluginFunction } from 'vue'

/* -- interfaces -- */

export interface MHStorageOptions {
    /** 存储类型：WEB/WX/RN */
    storageType: string,
    /** 存储引擎：wx的wx/Taro, WEB的localStorage, RN的AsyncStorage */
    storageEngine: null | object,
    /** 存储key前缀 */
    keyPrefix?: string,
    /** 白名单 */
    whiteList?: string[],
}

export interface MHStorageClass {

    new (args: MHStorageOptions): MHStorageInstance

    install: PluginFunction<MHStorageOptions>
}

export interface MHStorageInstance {
    //public
    /** 异步设置key值 */
    set: <T = any>(key:string, value:string, expireIn?:string, isEnableCache?:boolean) => Promise<T>
    /** 异步获取key值 */
    get: <T = any>(key:string, isEnableCache?:boolean) => Promise<T>
    /** 异步清除 */
    clear: <T = any>(whiteList?: string[]) => Promise<T>
    /** 异步清除key值 */
    remove: <T = any>(key:string) => Promise<T>
    /** 同步设置key值 */
    setSync: (key:string, value:string, expireIn?:string, isEnableCache?:boolean) => any
    /** 同步获取key值 */
    getSync: (key:string, isEnableCache?:boolean) => any
     /** 同步清除 */
    clearSync: (whiteList?: string[]) => any
    /** 同步清除key值 */
    removeSync: (key:string) => any
    /** 同步查找 */
    getInfoSync: () => any

    // private
    _cache: object
}

/* -- export default -- */

declare const MHStorage: MHStorageClass
export default MHStorage


/* -- vue plugin -- */

declare module 'vue/types/vue' {
    interface Vue {
        $MHStorage: MHStorageInstance
    }
}