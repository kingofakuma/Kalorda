import { get, post } from '@/utils/axios/HttpRequest';

export const AuthService = {
    async freeRegist() {
        let url = `/auth/freeRegist`;
        return await get(url);
    },

    // 发送注册验证码到邮箱
    // async createRegisterCaptcha(data: object) {
    //     let url = `/auth/createRegisterCaptcha`;
    //     return await post(url, data);
    // },

    // 发送重置密码验证码到邮箱
    async createResetPasswdCode(data: object) {
        let url = `/auth/createResetPasswdCode`;
        return await post(url, data);
    },

    async resetPassword(data: object) {
        let url = `/auth/resetPassword`;
        return await post(url, data);
    },

    async userRegister(data: object) {
        let url = `/auth/register`;
        return await post(url, data);
    },

    //---------------------

    async userLogin(data: object) {
        let url = `/auth/login`;
        return await post(url, data);
    },

    async refreshToken(data: object) {
        let url = `/auth/refresh`;
        return await post(url, data);
    },

    async userLogout(data: object) {
        let url = `/auth/logout`;
        return post(url, data);
    },

    async userInfo() {
        let url = `/auth/userInfo`;
        return await post(url);
    },

    async editUserInfo(data: object) {
        let url = `/auth/editUserInfo`;
        return await post(url, data);
    },

    async editPassword(data: object) {
        let url = `/auth/editPassword`;
        return await post(url, data);
    }
};
