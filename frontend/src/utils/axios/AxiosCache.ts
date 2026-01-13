import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getMD5 } from '../Common';

//对axios请求提供进行前端本地缓存控制方案
//通过在发起请求时在请求头headers里添加自定义的Cache-Time设置来控制是否进行缓存及缓存的过期时间（单位秒）
//没有显式设置Cache-Time或设置Cache-time为0的都是表示不缓存
//注：一般来说动态接口数据不要滥用本地缓存策略，容易产生不必要的麻烦，虽然本方案支持对get和post请求都可以缓存，但强烈建议不要随便针对post接口开axios缓存

//数据缓存容器，内存级缓存页面刷新会清空
const cacheMap = new Map();
//带此header头指定大于0的时间请求会使用本地缓存策略，酌情使用，不要滥用动态接口进行长时间本地缓存
const CACHE_TIME_HEAD_NAME = 'Cache-Time';

const _getCacheTime = (config: InternalAxiosRequestConfig): number => {
    let cacheTime = 0; //默认0不缓存
    if (config.headers && config.headers.has(CACHE_TIME_HEAD_NAME)) {
        cacheTime = Number(config.headers.get(CACHE_TIME_HEAD_NAME));
    }
    return cacheTime;
};

//根据请求接口地址、方法、参数生成缓存key
const __getCacheKey = (config: InternalAxiosRequestConfig) => {
    let { url, method, params, data } = config;
    return getMD5(JSON.stringify({ url, method, params, data }));
};

export const onRequestCheckCache = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    let cacheTime = _getCacheTime(config);
    if (cacheTime > 0) {
        let cacheKey = __getCacheKey(config);
        if (cacheMap.has(cacheKey)) {
            let cacheValue = cacheMap.get(cacheKey);

            let timestamp = cacheValue.timestamp; //上次缓存的时间戳，毫秒
            let contentData = cacheValue.contentData;
            let contentType = cacheValue.contentType ? cacheValue.contentType : 'text/plain; charset=utf-8';

            if (Date.now() - timestamp < Number(cacheTime) * 1000) {
                //添加config.adapter，直接虚构response返回
                config.adapter = function (config) {
                    return new Promise((resolve) => {
                        const res = {
                            status: 200,
                            statusText: 'OK',
                            data: contentData,
                            headers: {
                                'content-type': contentType
                            },
                            config,
                            request: null //这里设为null为了与正常的从服务器返的情况进行区分
                        };
                        return resolve(res);
                    });
                };
            } else {
                cacheMap.delete(cacheKey);
            }
        }
    }

    return config;
};

export const onResponseCacheHander = (response: AxiosResponse) => {
    //从缓存中虚构出来的response时
    if (response.request == null) {
        //typeof response.config.adapter == "function"
        return;
    }

    //服务端实际返的response需要根据header请求头中Cache-Time属性来判断是否进行数据缓存
    let cacheTime = _getCacheTime(response.config);
    if (cacheTime > 0) {
        let cacheKey = __getCacheKey(response.config);
        const cacheValue = {
            timestamp: Date.now(), //缓存时间戳，毫秒
            contentData: response.data, //服务端返的数据内容
            contentType: response.config.headers?.get('Content-Type')
        };
        if (cacheMap.has(cacheKey)) {
            cacheMap.delete(cacheKey);
        }
        cacheMap.set(cacheKey, cacheValue);
    }
};
