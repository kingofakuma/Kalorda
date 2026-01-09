// import en_US from './resource/en_US'; // 英文语言包
// import zh_CN from './resource/zh_CN'; // 中文语言包
import { createI18n, I18nOptions } from 'vue-i18n';
import { getLanguage } from './language';

const langCode: any = getLanguage().code;

//只加载当前语言包，避免加载所有语言包（只加载当前1个语言包不会太大，就直接用同步加载的方式了）
//注：如果1个语言包都太大，需要项目改造按路由拆分成多个子语言包文件，然后在路由守卫中动态加载到i18n
const messages: any = {};
messages[langCode] = (await import(`./resource/${langCode}.ts`)).default;

// const messages: any = {
//     en_US: en_US,
//     zh_CN: zh_CN
// };

const i18nOptions: I18nOptions = {
    locale: langCode, // 设置当前语言
    fallbackLocale: langCode, // 设置备选语言，当前语言缺失时使用
    legacy: false, // 如果要支持compositionAPI，此项必须设置为false;
    globalInjection: true, // 全局注册$t方法，可以在template模板中使用$t
    messages
};

export const i18n = createI18n(i18nOptions);
