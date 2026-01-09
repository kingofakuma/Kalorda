import { get, post } from '@/utils/axios/HttpRequest';

export const SystemService = {
    async getSystemInfo() {
        let url = `/system/info`;
        return await get(url);
    },

    async downloadModelWeights(data: any) {
        let url = `/system/model/download`;
        return await post(url, data);
    },

    async saveSystemConfig(data: any) {
        let url = `/system/config/save`;
        return await post(url, data);
    }
};
