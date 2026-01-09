import { post } from '@/utils/axios/HttpRequest';

export const AdminService = {
    // 开放或关闭外部注册功能
    async changeFreeRegist(data: object) {
        let url = `/admin/changeFreeRegist`;
        return post(url, data);
    },

    async allUsers(data: object) {
        let url = `/admin/allUsers`;
        return post(url, data);
    },
    async delUser(data: object) {
        let url = `/admin/delUser`;
        return post(url, data);
    },
    async saveUser(data: object) {
        let url = `/admin/saveUser`;
        return post(url, data);
    },
    async getSmtpSetting() {
        let url = `/admin/getSmtpSetting`;
        return post(url, {});
    },
    async saveSmtpSetting(data: object) {
        let url = `/admin/saveSmtpSetting`;
        return post(url, data);
    }
};
