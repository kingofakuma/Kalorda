export const sessionStorageUtil = {
    //存储
    set(name: string, key: string, value: any) {
        if (!name || !key) {
            return;
        }
        const storageStr = window.sessionStorage.getItem(name);
        if (!storageStr) {
            window.sessionStorage.setItem(name, JSON.stringify({ [key]: value }));
        } else {
            const storage = JSON.parse(storageStr);
            storage[key] = value;
            window.sessionStorage.setItem(name, JSON.stringify(storage));
        }
    },
    //取出数据
    get(name: string, key: string) {
        if (!name || !key) {
            return undefined;
        }
        const storageStr = window.sessionStorage.getItem(name);
        if (!storageStr) {
            return undefined;
        } else {
            return JSON.parse(storageStr)[key];
        }
    },
    // 删除数据
    del(name: string, key: string) {
        this.set(name, key, undefined);
    },
    //清空全部
    remove(name: string) {
        window.sessionStorage.removeItem(name);
    },
    clear() {
        window.sessionStorage.clear();
    }
};
