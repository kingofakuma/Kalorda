import { InternalAxiosRequestConfig } from 'axios';
import { getMD5, getCurRoute } from '../Common';

//提供对axios重复请求的中止控制
//发起某个请求后，如果在该请求未返回数据前如果又发送相同请求，后发送的重复请求会自动abort掉，只留第一次发送的请求，前置防抖

//自定义header头存储一个请求的唯一key
const REQUEST_KEY_HEAD_NAME = 'Request-Key';
//const requestKeyAbortMapping: { [key: string]: AbortController } = {};
const requestKeyAbortMapping: { [key: string]: AbortController } = {};
const requestKey2DataMapping: { [key: string]: RequestInfoData } = {};

export const getRequestKey = (url: string, method: string, params: any) => {
    return __generateRequestKey(url, method, params);
};

export interface RequestInfoData {
    routerPath: string;
    url: string;
    method: string;
    params: string;
}

//创建requestInfoData对象
const __generateRequestInfoData = (url: string, method: string, params: any) => {
    let requestInfoData: RequestInfoData = {
        routerPath: getCurRoute().fullPath,
        url: url,
        method: method,
        params: joinParams(params)
    };
    return requestInfoData;
};

//根据当前页面url+请求接口url_method_params生成一个key
const __generateRequestKey = (url: string, method: string, params: any) => {
    let requestInfoData = __generateRequestInfoData(url, method, params);

    let requestKey = getMD5(JSON.stringify(requestInfoData));
    // console.log("加密的requestKey=" + requestKey);
    return requestKey;
};

const __getRequestKey = (config: InternalAxiosRequestConfig): string => {
    //先从headers里拿，没有重新生成一个key
    let requestKey = config.headers[REQUEST_KEY_HEAD_NAME] ? String(config.headers[REQUEST_KEY_HEAD_NAME]) : __generateRequestKey(String(config.url), String(config.method), config.params ? config.params : config.data);
    return requestKey;
};

const joinParams = (param: any, key?: string): string => {
    if (!param) return '';
    let arr = [];
    let t = typeof param;
    if (t == 'string' || t == 'number' || t == 'boolean') {
        arr.push(key + '=' + encodeURIComponent(param));
    } else {
        for (let i in param) {
            let k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
            arr.push(joinParams(param[i], k));
        }
    }
    return arr.join('&');
};

//根据key判断AbortController是否已经添加过了（添加过代表请求正在执行）
const __existAbortController = (requestKey: string): boolean => {
    return requestKeyAbortMapping[requestKey] && requestKey2DataMapping[requestKey] ? true : false;
};

//========================= main =========================//

export const abortAbortController = (url: string, method: string, params: any) => {
    let requestKey = __generateRequestKey(url, method, params);
    __abortAbortController(requestKey);
};

//添加AbortController
export const addAbortController = (config: InternalAxiosRequestConfig): boolean => {
    let requestKey = __getRequestKey(config);
    // console.log(
    //   ">>当前时间戳t=" + new Date().getTime() + ",requestKey=" + requestKey
    // );
    // console.log(
    //   "是否有存在的相同请求" +
    //     __existAbortController(requestKey) +
    //     ",url=" +
    //     config.url
    // );
    //如果之前有相同请求中止掉
    if (__existAbortController(requestKey)) {
        return false;
    }
    let abortController = new AbortController();
    config.signal = abortController.signal;
    config.headers[REQUEST_KEY_HEAD_NAME] = requestKey;

    let requestInfoData = __generateRequestInfoData(String(config.url), String(config.method), config.params ? config.params : config.data);

    requestKeyAbortMapping[requestKey] = abortController;
    requestKey2DataMapping[requestKey] = requestInfoData;

    // console.log("添加请求,当前路由"+tool().getCurRoute().fullPath+",url=" + config.url + ",requestkey=" + requestKey);
    return true;
};

//移除AbortController
export const removeAbortController = (config: InternalAxiosRequestConfig, delayTimeout?: number) => {
    let requestKey = __getRequestKey(config);
    if (requestKeyAbortMapping[requestKey]) {
        //设置了延迟删除
        if (delayTimeout && delayTimeout > 0) {
            let removeTimer = setTimeout(() => {
                // requestKeyAbortMapping[requestKey].abort();//正常请求自己结束移除controller时不需要调abort
                delete requestKeyAbortMapping[requestKey];
                delete requestKey2DataMapping[requestKey];
                clearTimeout(removeTimer);
            }, delayTimeout);
        } else {
            // requestKeyAbortMapping[requestKey].abort();//正常请求自己结束移除controller时不需要调abort
            delete requestKeyAbortMapping[requestKey];
            delete requestKey2DataMapping[requestKey];
        }
    }
};

//cancel/abort单个AbortController
const __abortAbortController = (requestKey: string) => {
    if (requestKeyAbortMapping[requestKey]) {
        if (requestKeyAbortMapping[requestKey].signal && requestKeyAbortMapping[requestKey].signal.aborted == false) {
            requestKeyAbortMapping[requestKey].abort();
        }
        // requestKeyAbortMapping[requestKey].abort();
        delete requestKeyAbortMapping[requestKey];
        delete requestKey2DataMapping[requestKey];
    }
};

//中止from路由上位尚未结束的的请求的AbortController
export const abortFromRouteAbortController = () => {
    let routerPath = getCurRoute().fullPath;
    abortAllAbortController(routerPath);
};

//路由跳转时强行中止未结束的axios请求（白名单里的例外）
export const abortAllAbortController = (routePath?: string) => {
    //let routerPathMd5 = routePath ? $tool.getMD5(routePath) + "&" : "";
    Object.keys(requestKeyAbortMapping).forEach((requestKey) => {
        let requestInfoData = requestKey2DataMapping[requestKey];
        if (routePath && routePath.trim().length > 0) {
            if (routePath.toLowerCase() == requestInfoData.routerPath.toLowerCase()) {
                //不在白名单的
                if (!requestUrlIsInWhiteList(requestInfoData.url)) {
                    __abortAbortController(requestKey);
                }
            }
        } else {
            //不在白名单的
            if (!requestUrlIsInWhiteList(requestInfoData.url)) {
                __abortAbortController(requestKey);
            }
        }
    });
};

//白名单管理，本项目默认设定在路由跳转时会中止所有未结束的请求，但白名单里的请求例外
const urlWhiteList: Array<string> = [];

export const requestUrlIsInWhiteList = (requestUrl: string) => {
    let result = false;
    urlWhiteList.forEach((whiteUrl) => {
        if (requestUrl.toLocaleLowerCase().includes(whiteUrl.toLocaleLowerCase())) {
            result = true;
        }
    });
    return result;
};

export const addUrlToWhiteList = (url: string) => {
    if (url && url.length > 0) {
        url = url.toLowerCase();
        if (!urlWhiteList.includes(url)) {
            urlWhiteList.push(url);
        }
    }
};

export const removeUrlFromWhiteList = (url: string) => {
    if (url && url.length > 0) {
        url = url.toLocaleLowerCase();
        if (urlWhiteList.includes(url)) {
            urlWhiteList.splice(urlWhiteList.indexOf(url), 1);
        }
    }
};

export const emptyWhiteList = () => {
    urlWhiteList.length = 0;
};

// export const isExistAbortController = (
//   url: string,
//   method: string,
//   params: any
// ) => {
//   let requestKey = __generateRequestKey(url, method, params);
//   return __existAbortController(requestKey);
// };
