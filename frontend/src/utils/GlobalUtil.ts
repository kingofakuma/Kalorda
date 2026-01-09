// import { storeToRefs } from "pinia";
import { useGlobalStore } from '@/store/globalStore';

export const showLoading = (loading?: any) => {
    let message = '';
    let position = ['50%', '50%'];
    let size = '60px';
    let mask = true;
    let strokeWidth = 0; //0表示不设置粗细，采用默认的粗细
    if (loading) {
        if (loading.message) {
            message = loading.message;
        }
        if (loading.position) {
            position = loading.position;
        }
        if (loading.size) {
            size = loading.size;
        }
        if (typeof loading.mask === 'boolean') {
            mask = loading.mask;
        }
        if (loading.strokeWidth > 0) {
            strokeWidth = loading.strokeWidth;
        }
    }

    loading = {
        display: 'block',
        message: message,
        position: position,
        strokeWidth: strokeWidth,
        size: size,
        mask: mask
    };

    useGlobalStore().setGlobalLoading(loading);
};

export const hideLoading = () => {
    let display = 'none';
    let loading = { display: display };
    useGlobalStore().setGlobalLoading(loading);
};

export const showMessage = (severity: string, detail: string, more?: any) => {
    let icon = 'pi pi-exclamation-circle';
    let summary = severity;
    let life = 1500;
    let closable = true;
    if (more) {
        if (more.icon) {
            icon = more.icon;
        }
        if (more.severity) {
            severity = more.severity;
        }
        if (more.summary) {
            summary = more.summary;
        }
        if (typeof more.life === 'number') {
            life = more.life;
        }
        if (typeof more.closable === 'boolean') {
            closable = more.closable;
        }
    }
    let message = {
        id: Date.now(),
        detail: detail, // 消息内容
        icon: icon, // 图标
        severity: severity, // 类型
        summary: summary, // 概要信息
        life: life, // 显示时长（毫秒）
        closable: closable // 是否可关闭
    };
    useGlobalStore().addGlobalMessage(message);
};

export const clearMessage = () => {
    useGlobalStore().clearGlobalMessage();
};

export const showToast = (severity: any, summary: string, detail: string, autoClose?: boolean) => {
    useGlobalStore().setGlobalToast({ severity: severity, summary: summary, detail: detail, autoClose: autoClose == undefined ? true : autoClose });
};

export const setCache = (key: any, value: any) => {
    useGlobalStore().setGlobalCache(key, value);
};

export const getCache = (key: any) => {
    return useGlobalStore().getGlobalCache(key);
};

export const delCache = (key: any) => {
    return useGlobalStore().delGlobalCache(key);
};
