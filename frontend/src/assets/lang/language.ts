import { localStorageUtil } from '@/utils/LocalStorageUtil';

export interface language {
    name: string;
    code: string;
    icon: string;
}

// 系统已支持的语言
export const languages: language[] = [
    { name: '简体中文', code: 'zh_CN', icon: 'iconfont icon-wen' },
    { name: 'English', code: 'en_US', icon: 'iconfont icon-yingyu' }
];

const storageName = 'localConfig';
const storageKey = 'language';

const defaultLanguage = languages[0];

export const getLanguage = () => {
    // 本地设置过优先
    let language = localStorageUtil.get(storageName, storageKey);
    if (language && language.code) {
        return language;
    }
    // 浏览器系统语言
    const navLang = navigator.language.replace('-', '_');
    language = languages.find((lang) => lang.code.toLowerCase() === navLang.toLowerCase());
    if (language && language.code) {
        return language;
    }
    return defaultLanguage;
};

export const setLanguage = (language: any) => {
    if (language && language.code) {
        localStorageUtil.set(storageName, storageKey, language);
    }
};
