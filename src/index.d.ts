import { PluginFunction } from 'vue'


/* -- interfaces -- */

export interface MHStorageOptions {
    whiteList?: string[],
    storageType?: string,
    storageEngine?: null | object,
    keyPrefix?: string,
}

export interface MHStorageClass {

    new (args?: MHStorageOptions): MHStorageInstance

    install: PluginFunction<MHStorageOptions>
}

export interface MHStorageInstance {
    // public
    set: <T = any>(key:string, value:string, expireIn?:string, isEnableCache?:boolean) => Promise<T>
    get: <T = any>(key:string, isEnableCache?:boolean) => Promise<T>
    clear: <T = any>(whiteList?: string[]) => Promise<T>
    remove: <T = any>(key:string) => Promise<T>
    getInfo: <T = any>() => Promise<T>
    setSync: (key:string, value:string, expireIn?:string, isEnableCache?:boolean) => any
    getSync: (key:string, isEnableCache?:boolean) => any
    clearSync: (whiteList?: string[]) => any
    removeSync: (key:string) => any
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