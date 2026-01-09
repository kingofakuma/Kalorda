import { get } from '@/utils/axios/HttpRequest'; // get, post

export const HomeService = {
    // 获取首页数据
    async getHomeData() {
        let url = `/home/data`;
        return get(url, {});
    }
};
