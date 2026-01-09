import { get, post, postFile } from '@/utils/axios/HttpRequest'; // get, post
export const ModeltestService = {
    // 模型测试文件上传接口
    async uploadTestFile(
        file: File, //文件
        abortCallback?: Function, //控制请求中止
        progressCallback?: Function, //进度回调
        errorCallback?: Function, //出错回调
        finishedCallback?: Function //完成回调
    ) {
        let url = `/modeltest/file/upload`;
        return postFile(url, file, abortCallback, progressCallback, errorCallback, finishedCallback);
    },

    // 获取列表
    async allTestFiles(data: object) {
        let url = `/modeltest/file/list`;
        return get(url, data);
    },

    // 删除文件
    async deleteTestFiles(data: object) {
        let url = `/modeltest/file/delete`;
        return post(url, data);
    },

    // 更新备注
    async updateTestFile(data: object) {
        let url = `/modeltest/file/update`;
        return post(url, data);
    },

    // 获取已训练完成的模型列表
    async getCompletedModels(data: object) {
        let url = `/modeltest/model/list`;
        return get(url, data);
    },

    // 模型测试
    async createTest(data: object) {
        let url = `/modeltest/ocr/create`;
        return post(url, data);
    },

    // 停止OCR模型测试
    async stopTest() {
        let url = `/modeltest/ocr/stop`;
        return post(url);
    },

    // 获取OCR常量
    async getOCRConstants() {
        let url = `/modeltest/ocr/constants`;
        return get(url);
    },

    // 获取OCR测试文件列表
    async getTestOCRFileList(data: object) {
        let url = `/modeltest/ocr/file/list`;
        return post(url, data);
    },

    // 获取OCR测试结果
    async getModelOcrResult(data: object) {
        let url = `/modeltest/ocr/result`;
        return post(url, data);
    },

    // 清除文件的全部的ocr识别结果
    async removeOcrResult(data: object) {
        let url = `/modeltest/ocr/remove`;
        return post(url, data);
    },

    // 发送OCR识别结果到邮箱
    async sendOcrResultToEmail(data: object) {
        let url = `/modeltest/ocr/sendmail`;
        return post(url, data);
    }
};
