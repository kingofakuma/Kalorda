import { AxiosResponse } from 'axios';
import { showToast } from '@/utils/GlobalUtil';
import { i18n } from '@/assets/lang/index';
const t = i18n.global.t;
const loginPath = import.meta.env.VITE_LOGIN_PATH;
import { debounce, gotoRoute } from '@/utils/Common';
// const [messageApi, contextHolder] = message.useMessage();

//业务成功时，接收的对象
export interface HttpResult {
    code: number;
    data: any;
    message: string;
    time: any;
}

export const convertBlob = (res: AxiosResponse): Blob | null => {
    if (res.status == 200 || res.status == 206) {
        return new Blob([res.data], { type: res.data.type });
    }
    return null;
};

//eval执行字符串为object对象
//如果后端返回的map类型且key是数字的如{1:[10,11]}会出错，需要eval处理(虽然效率低但没有办法，除非后端修改)
const evalStr2Object = (str: string | undefined) => {
    let result = {};
    if (!str || str.trim().length == 0) {
        return result;
    }

    try {
        result = eval('(' + str + ')');
    } catch (e: any) {
        console.log(e);
    }
    return result;
};

//AxiosResponse转HttpResult业务对象
export const convertHttpResult = (res: AxiosResponse): HttpResult => {
    //提取业务数据，正常走到这里都是网络200/206和业务2000的，除非接口写错调用方式
    if (res.status == 200) {
        let resData = res.data;
        if (typeof resData == 'object') {
            //正常的数据
        } else if (typeof resData == 'string') {
            resData = evalStr2Object(resData);
        }

        //业务数据齐全
        if (resData.code && (resData.data || resData.message) && resData.time) {
            return {
                code: resData.code,
                data: resData.data,
                message: resData.message,
                time: resData.time
            };
        }
    }

    if (res.status == 206) {
        //...
    }

    //意外情况都统一返这样的HttpResult对象给后续处理程序
    return { code: 0, data: undefined, message: 'incorrect data', time: 0 };
};

//错误统一处理
export const errorHandler = (error: any) => {
    if (error.name && error.name == 'CanceledError') {
        console.log('主动取消了一个完全相同的请求');
        error.message = ''; // 置空，避免后续对error.message又弹一遍
        return; //不弹统一处理的message
    }

    let errorMsg = error.message ? error.message : '未知错误';
    let showErrorMsg = '';

    //网络错误
    if (errorMsg.indexOf('Network Error') >= 0) {
        showErrorMsg = t('app.networkerror');
    }
    //超时错误
    if (errorMsg.indexOf('timeout') >= 0) {
        showErrorMsg = t('app.timeout');
    }

    if (error.code == 401 || error.code == 4001) {
        //当前处于登录页不用弹未登录信息
        if (window.location.href.split('?')[0].endsWith(loginPath)) {
            return;
        } else {
            debounce(() => {
                setTimeout(() => {
                    gotoRoute(loginPath);
                }, 1000);
            }, 1000);
        }
    }

    showErrorMsg = errorMsg;
    if (showErrorMsg.length > 0) {
        showToast('error', t('page.common.error'), showErrorMsg, true);
        // showMessage('error', showErrorMsg, { icon: 'pi pi-exclamation-triangle' });
        error.message = ''; // 弹出错误信息后置空避免后续对error.message的判断来弹消息
        return;
    }
};
