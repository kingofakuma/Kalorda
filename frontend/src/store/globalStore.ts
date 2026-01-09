import { defineStore } from 'pinia';

export interface GlobalState {
    dynamicMenus: Array<any>;
    keepAliveNames: Array<any>;
    globalMessage: Array<any>;
    globalLoading: any;
    globalToast: any;
    globalCache: Map<any, any>;
}

export const useGlobalStore = defineStore('globalStore', {
    state: (): GlobalState => {
        return {
            // 默认值
            dynamicMenus: [],
            keepAliveNames: [],
            globalMessage: [],
            globalLoading: {},
            globalToast: {},
            globalCache: new Map()
        };
    },
    actions: {
        setDynamicMenus(dynamicMenus: Array<any>) {
            this.dynamicMenus = dynamicMenus;
        },
        getDynamicMenus() {
            return this.dynamicMenus;
        },

        setKeepAliveNames(keepAliveNames: Array<any>) {
            this.keepAliveNames = keepAliveNames;
        },
        getKeepAliveNames() {
            return this.keepAliveNames;
        },

        addGlobalMessage(message: any) {
            this.globalMessage.push(message);
        },

        clearGlobalMessage() {
            this.globalMessage = [];
        },

        setGlobalLoading(loading: any) {
            this.globalLoading = loading;
        },

        setGlobalToast(toast: any) {
            this.globalToast = toast;
        },

        getGlobalCache(key: any) {
            return this.globalCache.get(key);
        },
        setGlobalCache(key: any, value: any) {
            this.globalCache.set(key, value);
        },
        delGlobalCache(key: any) {
            this.globalCache.delete(key);
        }
    }
});
