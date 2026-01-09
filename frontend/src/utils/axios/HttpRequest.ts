import { AxiosRequestConfig, AxiosResponse, AxiosProgressEvent, ResponseType } from 'axios';
import axios from 'axios';
import AxiosInstance from './AxiosInstance';
import qs from 'qs';
import { convertBlob, convertHttpResult, errorHandler, HttpResult } from './HttpResponse';

//带cacheTime入参的方法表示可以对请求进行axios本地缓存策略，默认是不要本地缓存
//针对普通get和post设了cacheTime入参，文件上传下载的请求接口没设cacheTime入参
//强烈建议不要对数据可能会经常变的接口随便开本地缓存，避免引起不必要的麻烦）

export const get = (url: string, data?: object, cacheTime?: number): Promise<HttpResult> => {
    // let params = data ? qs.stringify(data, { arrayFormat: "brackets" }) : null;
    // console.log(params);
    let config: AxiosRequestConfig =
        cacheTime && cacheTime > 0
            ? {
                  params: data,
                  headers: {
                      'Cache-Time': cacheTime //Cache-Time为自定义请求头表示开启本地缓存以及缓存要保持的时间（即缓存过期时间），单位是秒
                  }
              }
            : {
                  params: data
                  // headers: {
                  //   "Cache-Control": "no-cache",
                  //   ["Pragma"]: "no-cache",
                  // },
              };

    return new Promise((resolve, reject) => {
        //console.log(url);
        AxiosInstance.get(url, config)
            .then((res) => {
                resolve(convertHttpResult(res));
            })
            .catch((err) => {
                errorHandler(err);
                //reject;
                reject(err);
            });
    });
};

export const post = (url: string, data?: object, cacheTime?: number, errorCallback?: Function): Promise<HttpResult> => {
    let config: AxiosRequestConfig =
        cacheTime && cacheTime > 0
            ? {
                  headers: {
                      'Cache-Time': cacheTime //Cache-Time为自定义请求头表示开启本地缓存以及缓存要保持的时间（即缓存过期时间），单位是秒
                  }
              }
            : {};

    return new Promise((resolve, reject) => {
        AxiosInstance.post(url, data, config)
            .then((res) => {
                resolve(convertHttpResult(res));
            })
            .catch((err) => {
                if (errorCallback) {
                    errorCallback(err);
                } else {
                    errorHandler(err);
                    //reject;
                    reject(err);
                }
            });
    });
};

//文件下载
export const getFile = (
    url: string,
    data?: object,
    abortCallback?: Function, //控制请求中止
    progressCallback?: Function, //进度回调
    errorCallback?: Function, //出错回调
    finishedCallback?: Function, //完成回调
    range?: Array<number> //指定下载区间
): Promise<Blob | null> => {
    //let params = data ? qs.stringify(data, { arrayFormat: "brackets" }) : null;

    let config: AxiosRequestConfig = {
        params: data,
        responseType: 'blob',
        timeout: 150 * 1000 // 指定请求超时的毫秒数，0表示无超时时间
        // cancelToken: new axios.CancelToken((c) => {
        //   if (abortCallback) {
        //     abortCallback(c);
        //   }
        // }),
        // onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        //   if (progressCallback) {
        //     progressCallback(progressEvent.loaded, progressEvent.total);
        //   }
        // },
    };

    if (abortCallback) {
        //中止回调
        config.cancelToken = new axios.CancelToken((c) => {
            abortCallback(c);
        });
    }

    if (progressCallback) {
        //进度回调
        config.onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
            progressCallback(progressEvent.loaded, progressEvent.total);
        };
    }

    //指定下载起止区间Range
    if (range && range.length > 0) {
        let start: string = range[0].toString();
        let end: string = range[1] ? range[1].toString() : '';
        let rangeValue = `bytes=${start}-${end}`;

        if (config.headers) {
            if (typeof config.headers.set == 'function') {
                config.headers.set('Range', rangeValue);
            }
        } else {
            config.headers = { Range: rangeValue };
        }
    }

    return new Promise((resolve, reject) => {
        AxiosInstance.get(url, config)
            .then((res) => {
                let blob: Blob | null = convertBlob(res);
                //完成回调
                if (finishedCallback) {
                    let total: number = 0; //这里获取文件真实总大小
                    //如果有断点请求返range从content-range里获取文件总大小
                    if (res.headers['content-range']) {
                        //一般支持分片下载的服务端在客户端发起分片请求标识后
                        //会规范的在response响应header头里带上content-range标识
                        //如content-range=bytes 41943042-52428801/92697854
                        //斜杠分割即可得到斜杠后面的总文件大小
                        total = Number(res.headers['content-range'].split('/')[1]);
                    } else if (res.headers['content-length']) {
                        total = Number(res.headers['content-length']);
                    }
                    finishedCallback(blob, total);
                } else {
                    resolve(blob);
                }
            })
            .catch((err) => {
                if (errorCallback) {
                    errorCallback(err);
                } else {
                    errorHandler(err);
                }
                //reject;
                reject(err);
            });
    });
};

//混合表单上传
export const postForm = (url: string, data: FormData, timeout?: number): Promise<HttpResult> => {
    //application/x-www-form-urlencoded//axiso默认的
    //multipart/form-data
    //application/json

    let config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: timeout ? 30 * 1000 : timeout
    };

    return new Promise((resolve, reject) => {
        AxiosInstance.post(url, data, config)
            .then((res) => {
                resolve(convertHttpResult(res));
            })
            .catch((err) => {
                errorHandler(err);
                //reject;
                reject(err);
            });
    });
};

//单文件上传（其实也是混合表单上传，只是调用参数不同）
export const postFile = (
    url: string,
    file: File,
    abortCallback?: Function, //控制请求中止
    progressCallback?: Function, //进度回调
    errorCallback?: Function, //出错回调
    finishedCallback?: Function //完成回调
): Promise<HttpResult> => {
    let config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 180 * 1000 // 指定请求超时的毫秒数，0表示无超时时间
    };

    if (abortCallback) {
        //中止回调
        config.cancelToken = new axios.CancelToken((c) => {
            abortCallback(c);
        });
    }

    if (progressCallback) {
        //进度回调
        config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
            progressCallback(progressEvent.loaded, progressEvent.total);
        };
    }

    //只传单个文件
    let data = new FormData();
    data.append('file', file);

    return new Promise((resolve, reject) => {
        AxiosInstance.post(url, data, config)
            .then((res) => {
                let result = convertHttpResult(res);
                if (finishedCallback) {
                    finishedCallback(result);
                } else {
                    resolve(result);
                }
            })
            .catch((err) => {
                if (errorCallback) {
                    errorCallback(err);
                } else {
                    errorHandler(err);
                }
                //reject;
                reject(err);
            });
    });
};

//get返原始的response
export const axiosGet = (url: string, data?: object): Promise<AxiosResponse> => {
    return new Promise((resolve, reject) => {
        AxiosInstance.get(url, { params: data })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

//post返原始的response
export const axiosPost = (
    url: string,
    data: object,
    abortCallback?: Function, //控制请求中止
    progressCallback?: Function, //进度回调
    errorCallback?: Function, //出错回调
    finishedCallback?: Function //完成回调
) => {
    return new Promise((resolve, reject) => {
        let config: AxiosRequestConfig = {};

        if (abortCallback) {
            //中止回调
            config.cancelToken = new axios.CancelToken((c) => {
                abortCallback(c);
            });
        }

        if (progressCallback) {
            //进度回调
            config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                progressCallback(progressEvent.loaded, progressEvent.total);
            };
        }

        let postData = data ? qs.stringify(data, { arrayFormat: 'brackets' }) : null;

        AxiosInstance.post(url, postData, config)
            .then((res) => {
                if (finishedCallback) {
                    finishedCallback(res);
                } else {
                    resolve(res);
                }
            })
            .catch((err) => {
                if (errorCallback) {
                    errorCallback(err);
                } else {
                    reject(err);
                }
            });
    });
};

//put返原始的response
export const axiosPut = (
    url: string,
    data: object,
    abortCallback?: Function, //控制请求中止
    progressCallback?: Function, //进度回调
    errorCallback?: Function, //出错回调
    finishedCallback?: Function, //完成回调
    contentType?: string,
    responseType?: ResponseType
) => {
    return new Promise((resolve, reject) => {
        let config: AxiosRequestConfig = {
            headers: {
                'Content-Type': contentType ? contentType : 'application/octet-stream'
            },
            responseType: responseType ? responseType : 'blob'
        };

        if (abortCallback) {
            //中止回调
            config.cancelToken = new axios.CancelToken((c) => {
                abortCallback(c);
            });
        }

        if (progressCallback) {
            //进度回调
            config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                progressCallback(progressEvent.loaded, progressEvent.total);
            };
        }

        AxiosInstance.put(url, data, config)
            .then((res) => {
                if (finishedCallback) {
                    finishedCallback(res);
                } else {
                    resolve(res);
                }
            })
            .catch((err) => {
                if (errorCallback) {
                    errorCallback(err);
                } else {
                    reject(err);
                }
            });
    });
};

export default {
    get,
    post,
    getFile,
    postFile,
    postForm,
    axiosPost, //原始post，返回的响应response没有经过二次封装处理
    axiosGet, //原始get，返回的响应response没有经过二次封装处理
    axiosPut //原始put，返回的响应response没有经过二次封装处理
};
