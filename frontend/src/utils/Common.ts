import useRouter from '@/router';
import useRoute from '@/router';
import { Base64 } from 'js-base64';
import { BigNumber } from 'bignumber.js';
import CryptoJS from 'crypto-js';
// import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { getFingerprint } from '@thumbmarkjs/thumbmarkjs';
import qs from 'qs';

// 第一步 常用 字符串 数字 时间等处理函数
export const isNumeric = (str: string) => {
    if (!str) {
        return false;
    }
    return /^\d+$/.test(str);
};
export const strIsEmpty = (str: string) => {
    return !str || str.trim().length == 0;
};
export const arrayIsEmpty = (arr?: Array<any>) => {
    return !arr || arr.length == 0;
};
//字符串转float，保留n位小数
export const str2Float = (str: string, n?: number) => {
    if (!str) {
        return NaN;
    }
    if (!n) {
        if (str.lastIndexOf('.') > 0) {
            n = str.substring(str.lastIndexOf('.')).length;
        }
    }
    return parseFloat(Number(str).toFixed(n));
};

//字符串简略显示，中间用...代替
export const strBrief = (str: string | undefined, left: number, right: number) => {
    if (!str) {
        return '';
    }
    if (str.length <= left + right) {
        return str;
    }
    return str.slice(0, left) + '...' + str.slice(str.length - right);
};
// 过滤emoji表情字符
export const filterEmoji = (str: string) => {
    if (!str || str.trim().length == 0) {
        return '';
    }
    let emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
    return str.replace(emojiRegex, '');
};
// 获取字符串的hash值
export const hashCode = (str: string) => {
    let hash = 0,
        i,
        chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

//获取随机字符串
export const randomStr = (size?: number) => {
    return nanoid(size);
};

//base64编码
export const base64Encode = (str: string) => {
    return Base64.encode(str);
};

//base64解码
export const base64Decode = (str: string) => {
    return Base64.decode(str);
};

// aes加密
export const aesEncode = (str: string, keyCode: string) => {
    if (!(keyCode.length == 16 || keyCode.length == 24 || keyCode.length == 32)) {
        console.log('aes密钥字符串长度应该等于16位');
        return '';
    }

    const key = CryptoJS.enc.Utf8.parse(keyCode); // 密钥必须是16、24或32位长
    const iv = CryptoJS.lib.WordArray.random(16); // 生成随机的16字节IV
    const encrypted = CryptoJS.AES.encrypt(str, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC, // 使用CBC模式
        padding: CryptoJS.pad.Pkcs7
    });
    return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString(); // 将IV和加密后的数据拼接在一起
};

// aes解密
export const aesDecode = (data: string, keyCode: string) => {
    if (!(keyCode.length == 16 || keyCode.length == 24 || keyCode.length == 32)) {
        console.log('aes密钥字符串长度应该等于16位');
        return '';
    }

    const parts = data.split(':');
    if (parts.length !== 2) {
        console.log('解密数据格式不正确');
        return '';
    }

    const iv = CryptoJS.enc.Hex.parse(parts[0]);
    const encrypted = parts[1];
    const key = CryptoJS.enc.Utf8.parse(keyCode); // 密钥必须是16、24或32位长

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC, // 使用CBC模式
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
};

//md5加密
export const getMD5 = (str: string) => {
    return CryptoJS.MD5(str).toString();
};

//获取uuid
// export const getUUID = () => {
//     return uuidv4().toString();
// };

//判断是否是合法的url
export const validUrl = (str: string) => {
    if (!str) {
        return false;
    }
    return str.startsWith('http://') || str.startsWith('https://');
};

export const validEmail = (str: string) => {
    if (!str) {
        return false;
    }
    return str.match(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/);
};

export const objectClone = (object: object) => {
    return JSON.parse(JSON.stringify(object));
};

//获取当前时间戳
export const curTimestamp = () => {
    return new Date().getTime();
};

export const curTimeStr = () => {
    return formatTime(new Date());
};

export const formatTime = (time: any) => {
    let date;
    let timeType = typeof time;
    if (timeType == 'string' && time.length > 0) {
        date = new Date(time.replace(/-/g, '/')); //兼容safari浏览器
    } else if (timeType == 'object') {
        date = time;
    } else {
        return '';
    }

    //const date = new Date(time);
    const y = (date.getFullYear() + '').padStart(2, '0');
    const m = (date.getMonth() + 1 + '').padStart(2, '0');
    const d = (date.getDate() + '').padStart(2, '0');
    const h = (date.getHours() + '').padStart(2, '0');
    const M = (date.getMinutes() + '').padStart(2, '0');
    const S = (date.getSeconds() + '').padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${M}:${S}`;
};
//获取时间差描述
export const timeDiffStr = (time1: string, time2: string) => {
    let t1 = new Date(time1.replace(/-/g, '/')).getTime();
    let t2 = new Date(time2.replace(/-/g, '/')).getTime();
    let diff = Math.abs(t1 - t2) / 1000; //秒
    if (diff < 60) {
        return diff + '秒前';
    } else if (diff < 60 * 60) {
        return parseInt(diff / 60 + '') + '分钟前';
    } else if (diff < 24 * 60 * 60) {
        return parseInt(diff / (60 * 60) + '') + '小时前';
    } else if (diff < 30 * 24 * 60 * 60) {
        return parseInt(diff / (24 * 60 * 60) + '') + '天前';
    } else {
        return parseInt(diff / (30 * 24 * 60 * 60) + '') + '个月前';
    }
};

//文件大小转换
export const fileSizeStr = (file_size: string | number) => {
    let fileSize = new BigNumber(file_size);
    if (fileSize.isLessThan(1024)) {
        return fileSize + ' B';
    } else if (fileSize.isLessThan(1024 * 1024)) {
        return fileSize.dividedBy(1024).toNumber().toFixed(2) + ' KB';
    } else if (fileSize.isLessThan(1024 * 1024 * 1024)) {
        return (
            fileSize
                .dividedBy(1024 * 1024)
                .toNumber()
                .toFixed(2) + ' MB'
        );
    } else {
        return (
            fileSize
                .dividedBy(1024 * 1024 * 1024)
                .toNumber()
                .toFixed(2) + ' GB'
        );
    }
};

export const fileNameLimit = (file_name: string, max_len: number = 20) => {
    let result = file_name;
    if (file_name.length <= max_len) {
        return result;
    }
    result = file_name.substring(0, parseInt(String(max_len / 2))) + '...' + file_name.substring(file_name.length - parseInt(String(max_len / 2)));
    return result;
};

//获取随机整数
export const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

//数字每千位加逗号
export const numberCommafy = (number: number) => {
    return (
        number &&
        number.toString().replace(/\d+/, function (s) {
            return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        })
    );
};

//比较两个数组包含的元素是否相同，忽略空值、排列顺序、大小写
export const arrayCompare = (a1: any, a2: any) => {
    if ((!a1 && a2) || (a1 && !a2)) return false;
    a1 = a1.filter((item: any) => item !== null && item !== undefined);
    a2 = a2.filter((item: any) => item !== null && item !== undefined);
    if (a1.length !== a2.length) return false;
    a1 = [].concat(a1);
    a2 = [].concat(a2);
    a1 = a1.sort();
    a2 = a2.sort();
    for (let i = 0, n = a1.length; i < n; i++) {
        if (JSON.stringify(a1[i]).toLowerCase() !== JSON.stringify(a2[i]).toLowerCase()) return false;
    }
    return true;
};

//获取两个Number数组的相同元素，取交集（并集）
export const arrayIntersection = (a: Array<number>, b: Array<number>) => {
    return a.filter((item) => b.includes(item));
};

//数组元素位置交换
export const arraySwap = (arr: Array<any>, index1: number, index2: number) => {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
};

// 第二部分 DOM URL 常用处理
export const $dom = (selector: string) => {
    return document.querySelector(selector) as HTMLElement;
};
//html转义
export const htmlEncode = (str: string) => {
    let s = '';
    if (strIsEmpty(str)) {
        return '';
    }
    s = str.replace(/&/g, '&amp;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/ /g, '&nbsp;');
    s = s.replace(/\\'/g, '&#39;');
    s = s.replace(/\\"/g, '&quot;');
    s = s.replace(/\n/g, '<br/>');
    return s;
};

//html反转义
export const htmlDecode = (str: string) => {
    let s = '';
    if (strIsEmpty(str)) {
        return '';
    }
    s = str.replace(/&amp;/g, '&');
    s = s.replace(/&lt;/g, '<');
    s = s.replace(/&gt;/g, '>');
    s = s.replace(/&nbsp;/g, ' ');
    s = s.replace(/&#39;/g, "'");
    s = s.replace(/&quot;/g, '"');
    s = s.replace(/<br\/>/g, '\n');
    return s;
};

//将url参数a=1&b=2转成对象{a:"1",b:"2"}
export const queryParamObjects = (url: string) => {
    let str = '';
    if (url.includes('?')) {
        str = url.substring(url.indexOf('?') + 1);
    }
    return strIsEmpty(str) ? {} : qs.parse(str);
};

//获取url请求中的指定参数内容
export const queryParamValue = (url: string, paramName: string) => {
    let params = queryParamObjects(url);
    return params[paramName];
};

// 第三步部分 路由 浏览器 相关
export const gotoRoute = (path: string, query?: any, replaceMode?: boolean) => {
    let route = {
        path: path,
        query: query
    };
    replaceMode ? useRouter.replace(route) : useRouter.push(route);
};

//路由返回
export const routeBack = () => {
    useRouter.back();
};

//获取当前路由地址
export const getCurRoute = () => {
    return useRoute.currentRoute.value;
};

//获取当前页面url
export const getCurUrl = () => {
    return window.location.href;
};

export const windowOpen = (url: string) => {
    window.open(url, '_blank');
};

export const copyTextToClipboard = (str: string): boolean => {
    const textarea = document.createElement('textarea');
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.top = '-99999px';
    textarea.value = str;
    document.body.appendChild(textarea);
    textarea.select();
    const res = document.execCommand('Copy');
    document.body.removeChild(textarea);
    return res;
};

export const getClientId = async () => {
    const f = await getFingerprint();
    return f;
};

// 下载文件
export const downloadFile = (displayFileName: string, fileData: Blob) => {
    if (strIsEmpty(displayFileName)) {
        console.error('下载文件名错误');
        return;
    }

    if (!fileData) {
        console.log('文件数据错误');
        return;
    }

    let dataUrl = window.URL.createObjectURL(fileData);
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = dataUrl;
    link.setAttribute('download', displayFileName);
    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(dataUrl);
};

// 防抖与节流函数
const debounceTimer: any = {};
const delayDebounceTimer: any = {};
const throttleTimer: any = {};

//私有方法：获取元素的data-random-id值，如果没有就立即设置一个以区分元素element
const getTimerId = (event?: any) => {
    let timerId = 'x-random-id';
    if (!event) {
        return timerId;
    }
    let element = event.srcElement ? event.srcElement : event.target;
    if (!element) {
        timerId = String(event); //如果不是Html对象,应该传一个用于区分的标记字符串
    } else {
        timerId = element.dataset.timerId_3wfg2010vx;
        if (strIsEmpty(timerId)) {
            timerId = randomStr();
            element.dataset.timerId_3wfg2010vx = timerId;
        }
    }
    return timerId;
};

//前置防抖（一开始立即执行fn，在最后一次点击后的delay时间内不再执行）
export const debounce = (fn: Function, time?: number, event?: any) => {
    let timerId = getTimerId(event);
    let currentTime = curTimestamp();

    if (!time) {
        //如果没有指定时间，则等fn执行完后才能下次执行
        if (!debounceTimer[timerId]) {
            debounceTimer[timerId] = currentTime;
            fn();
            debounceTimer[timerId] = null;
        }
        return;
    }

    //判断是否应该拦截
    let intercept = debounceTimer[timerId] && currentTime - debounceTimer[timerId] < time;
    debounceTimer[timerId] = currentTime;
    if (!intercept) {
        fn();
        setTimeout(() => {
            debounceTimer[timerId] = null;
        }, time);
    }
};

//防抖（后置防抖，等最后一次点击再延迟delay时间后执行）
export const delayDebounce = (fn: Function, time?: number, event?: any) => {
    let timerId = getTimerId(event);
    time = time || 1000;
    if (delayDebounceTimer[timerId]) {
        clearTimeout(delayDebounceTimer[timerId]);
        delayDebounceTimer[timerId] = null;
    }
    delayDebounceTimer[timerId] = setTimeout(() => {
        fn();
        delayDebounceTimer[timerId] = null;
    }, time);
};

//节流（与前置防抖区别在于：前置防抖时如果一直点，后面的一直不执行delay会顺延；而节流是到一定时间后是可以继续执行的，强调的是频率限制，即delay时间内执行一次）
export const throttle = (fn: Function, time?: number, event?: any) => {
    time = time || 1000;
    let timerId = getTimerId(event);
    if (throttleTimer[timerId]) {
        return;
    }
    throttleTimer[timerId] = setTimeout(() => {
        fn();
        throttleTimer[timerId] = null;
    }, time);
};

const lockMap: any = {};
// 加锁执行（页面级，非应用级），防止同时重复执行
export const lock = (lockId: any, fn: Function) => {
    if (!lockId) {
        return;
    }
    if (!lockMap[String(lockId)]) {
        console.log('任务锁不存在，任务执行：', lockId);
        lockMap[String(lockId)] = true;
        fn();
    } else {
        console.log('任务锁已存在，任务不执行：', lockId);
    }
};
// 解锁
export const unlock = (lockId: any) => {
    lockMap[String(lockId)] = null;
    console.log('已移除任务锁：', lockId);
};

// promise [err, data]合并返回函数
export const promise2 = <T, U = Error>(promise: Promise<T>, errorExt?: object): Promise<[U, undefined] | [null, T]> => {
    return promise
        .then<[null, T]>((data: T) => [null, data])
        .catch<[U, undefined]>((err: U) => {
            if (errorExt) {
                const parsedError = Object.assign({}, err, errorExt);
                return [parsedError, undefined];
            }
            return [err, undefined];
        });
};
