import { localStorageUtil } from './LocalStorageUtil';
import { sessionStorageUtil } from './SessionStorageUtil';
import { aesDecode } from './Common';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
const EXPIRES_IN_KEY = 'expires_in';
const TOKEN_SAVE_TIME = 'time';
let LOCAL_KEY = 'token';
let access_token_value = '';
let access_token_time = 0;
let user_id = '';
let user_roles: string[] = [];

export const setToken = (token: any) => {
    delToken();
    access_token_value = token[ACCESS_TOKEN_KEY]; // 存内存
    access_token_time = Date.now(); // 保存的时间
    let rememberMe = getRememberMe();
    if (rememberMe) {
        localStorageUtil.set(LOCAL_KEY, REFRESH_TOKEN_KEY, token[REFRESH_TOKEN_KEY]); //存本地LocalStorage
        localStorageUtil.set(LOCAL_KEY, EXPIRES_IN_KEY, token[EXPIRES_IN_KEY]); // access_token有效期
        localStorageUtil.set(LOCAL_KEY, TOKEN_SAVE_TIME, access_token_time); // access_token保存时间
    } else {
        sessionStorageUtil.set(LOCAL_KEY, REFRESH_TOKEN_KEY, token[REFRESH_TOKEN_KEY]); //存本地seesionStorage
        sessionStorageUtil.set(LOCAL_KEY, EXPIRES_IN_KEY, token[EXPIRES_IN_KEY]); // access_token有效期
        sessionStorageUtil.set(LOCAL_KEY, TOKEN_SAVE_TIME, access_token_time); // access_token保存时间
    }

    // 从token中获取用户角色信息
    const aes_key = import.meta.env.VITE_APP_AES_KEY;
    let user_role = aesDecode(token['role'], aes_key);
    if (user_role && user_role.length > 0) user_roles = user_role.toLocaleLowerCase().split(',');
    // 用户id保存到本地变量
    user_id = token['user_id'];
};

export const getUserId = () => {
    // 从本地变量中获取用户id
    return user_id || '';
};

// 检查用户权限：是否有指定的角色
export const hasPermission = (roles: string[]): boolean => {
    for (let role of roles) {
        if (user_roles.includes(role.toLocaleLowerCase())) {
            return true;
        }
    }
    return false;
};

export const delToken = () => {
    access_token_value = '';
    access_token_time = 0;
    user_roles = [];
    localStorageUtil.remove(LOCAL_KEY);
    sessionStorageUtil.remove(LOCAL_KEY);
};

export const getAccessTokenValue = () => {
    return access_token_value;
};

export const getRefreshTokenValue = () => {
    if (getRememberMe()) {
        return localStorageUtil.get(LOCAL_KEY, REFRESH_TOKEN_KEY);
    } else {
        return sessionStorageUtil.get(LOCAL_KEY, REFRESH_TOKEN_KEY);
    }
};

export const ifMustRefreshToken = () => {
    let refresh_token_value = '';
    let expires_in = '';

    if (getRememberMe()) {
        refresh_token_value = localStorageUtil.get(LOCAL_KEY, REFRESH_TOKEN_KEY);
        expires_in = localStorageUtil.get(LOCAL_KEY, EXPIRES_IN_KEY);
    } else {
        refresh_token_value = sessionStorageUtil.get(LOCAL_KEY, REFRESH_TOKEN_KEY);
        expires_in = sessionStorageUtil.get(LOCAL_KEY, EXPIRES_IN_KEY);
    }
    if (refresh_token_value) {
        // 有刷新token
        if (!access_token_value) {
            // 没有access_token
            return true;
        } else {
            if (Date.now() - access_token_time > Number(expires_in) * 1000) {
                // 有access_token 但是过期了需要刷新token
                return true;
            }
        }
    }
    return false;
};

// 提供登录页控制是否保持登录记忆的方法
export const setRememberMe = (rememberMe: boolean) => {
    console.log('setRememberMe', rememberMe);
    localStorageUtil.set('localConfig', 'rememberMe', rememberMe);
};

export const getRememberMe = () => {
    return localStorageUtil.get('localConfig', 'rememberMe') === true;
};
