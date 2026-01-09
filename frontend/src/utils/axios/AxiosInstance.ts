import axios from 'axios';
import { addAbortController, removeAbortController } from './AxiosAbort';
import { onRequestCheckCache, onResponseCacheHander } from './AxiosCache';
import { getAccessTokenValue } from '@/utils/Token';
import { localStorageUtil } from '@/utils/LocalStorageUtil';
import { getClientId } from '@/utils/Common';
const apiProxyPath = import.meta.env.VITE_API_PROXY_PATH;
const cid = await getClientId();

// 1. 创建axios实例
const axiosInstance = axios.create({
    // 默认请求地址
    baseURL: apiProxyPath,
    // 默认超时时间
    timeout: 5 * 60 * 1000,
    withCredentials: false //跨域请求时不带cookies
});

// 2.请求拦截
axiosInstance.interceptors.request.use(
    (config) => {
        // console.log("请求url=" + config.url);
        //console.log(config);

        let result = addAbortController(config);
        // console.log("是否存在config.cancelToken");
        // console.log(config.cancelToken);

        if (result == false && !config.cancelToken) {
            //false表示有相同的请求正在执行，需要取消本次请求
            let cancel = () => {};
            config.cancelToken = new axios.CancelToken((c) => {
                cancel = c;
            });
            cancel();
            //如果有loading层自动隐藏
            // autoHideLoading(config.data);
            // hideLoading();
        }

        //判断是否有缓存进行config处理
        config = onRequestCheckCache(config);
        let language = localStorageUtil.get('localConfig', 'language');
        if (language) {
            //用户当前登录的token凭证
            config.headers['User-Language'] = language.code;
            config.headers['Request-Cid'] = cid; //客户端浏览器的唯一指纹标识
        }
        let access_token_value = getAccessTokenValue();
        if (access_token_value) {
            config.headers['Authorization'] = `Bearer ${access_token_value}`;
        }

        // showLoading();

        return config;
    },
    (error) => {
        //请求发生错误，抛出异常
        Promise.reject(error);
    }
);

// 重建错误对象
const rebuildError = (code: number, message: string) => {
    let error = { code: code, message: message };
    return error;
};

// 3.响应拦截
axiosInstance.interceptors.response.use(
    (res) => {
        // 2xx 范围内的状态码都会触发该函数。对响数据成功时调用
        console.log('请求结果res=');
        console.log(res);

        //移除abortController
        removeAbortController(res.config, 350); //延迟750毫秒再清理可实现axios的前置防抖（axios防抖为兜底方案，防止调用程序没加防抖逻辑）
        onResponseCacheHander(res); //处理缓存保存逻辑（有根据是否需要缓存的条件进行判断后才决定是否缓存）

        //如果接口返回的状态码不是正常的200和断点下载206时抛出错误
        if (!(res.status == 200 || res.status == 206)) {
            // autoHideLoading(res.config.data);
            // let error = { code: res.status, message: "not supported response" };
            let error = rebuildError(res.status, 'not supported response');
            return Promise.reject(error);
        }

        //如果返回的数据中有自定义的业务状态码code，但不是业务成功的200状态码时也抛出自定义错误
        if (res.data.code && res.data.code != 2000) {
            // let error = { code: res.data.code, message: res.data.message };
            let error = rebuildError(res.data.code, res.data.message);
            return Promise.reject(error);
        }

        return res;
    },
    (error) => {
        console.log('请求错误error=');
        console.log(error);

        //清除abortController标记
        if (error && error.config) {
            //移除abortController
            removeAbortController(error.config);
        }

        //处理重试逻辑
        if (error && error.config) {
            let retryAllow = false; //默认不重试
            let retryDelay = 1500; //如果要重试的默认延迟1500毫秒

            //判断哪些情况下可以重试
            if (error.code == 'ECONNABORTED' || error.code == 'ECONNRESET' || error.code == 'ERR_BAD_RESPONSE') {
                retryAllow = true;
                retryDelay = 500;
            }

            if (error.response && (error.response.status == 407 || error.response.status == 408)) {
                retryAllow = true;
                retryDelay = 1500;
            }

            let contentType = error.config.headers?.get('Content-Type');
            if (contentType) {
                contentType = contentType.toLowerCase();
            } else {
                contentType = '';
            }

            //文件上传类的接口请求任何情况下都不要重试
            if (contentType.startsWith('multipart/') || contentType.startsWith('image/') || contentType == 'application/octet-stream' || contentType == 'application/pdf') {
                retryAllow = false;
            }

            if (retryAllow == true) {
                if (!error.config.retryCount) {
                    error.config.retryCount = 0;
                }

                //如果重试次数<2则走重试
                if (error.config.retryCount < 2) {
                    error.config.retryCount += 1;
                    console.log('第' + error.config.retryCount + '次重试定时' + retryDelay + '毫秒开始...');

                    return new Promise((resolve) => {
                        setTimeout(() => resolve(null), retryDelay);
                    }).then(() => {
                        return axiosInstance(error.config);
                    });
                    //return axiosInstance(error.config);
                }
            }
        }

        // 如果错误response.data = {code,data,message,time}信息
        if (error && error.response) {
            let message = '';
            let code = error.response.status;
            if (error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else if (error.response.data && error.response.data.detail) {
                if (typeof error.response.data.detail == 'string') {
                    message = error.response.data.detail;
                } else {
                    message = error.response.data.detail[0].msg;
                    if (message.indexOf(',') >= 0) {
                        message = message.split(',')[1];
                    }
                }
            } else if (error.response.statusText) {
                message = error.response.statusText;
            }
            if (message) {
                error = rebuildError(code, message);
                console.log('rebuildError请求错误', error);
            }
        }
        return Promise.reject(error);
    }
);

// 4.导出 axios 实例
export default axiosInstance;
