import { get, post, getFile } from '@/utils/axios/HttpRequest'; // get, post

export const FinetuneService = {
    // 获取微调任务列表页
    async allFinetuneTasks(data: object) {
        let url = `/finetune/task/list`;
        return post(url, data);
    },
    // 创建微调任务
    async createFinetuneTask(data: object) {
        let url = `/finetune/task/create`;
        return post(url, data);
    },
    // 更新微调任务
    async updateFinetuneTask(data: object) {
        let url = `/finetune/task/update`;
        return post(url, data);
    },

    // 删除微调任务
    async delFinetuneTask(task_id: number) {
        let url = `/finetune/task/delete/${task_id}`;
        return post(url, {});
    },

    // 合并数据集数据生成训练数据jsonl数据文件
    async combineFinetuneData(task_id: number) {
        let url = `/finetune/task/${task_id}/combine_data`;
        return post(url, {});
    },

    // 训练实例相关接口

    //查询某微调任务下所有已创建的未删除的训练实例的分页接口
    async allTrainingRuns(task_id: number, data: object) {
        let url = `/finetune/task/${task_id}/runs/list`;
        return post(url, data);
    },

    // 创建训练实例
    async createTrainingRun(data: object) {
        let url = `/finetune/run/create`;
        return post(url, data);
    },
    // 修改训练实例超参数
    async updateTrainingRun(run_id: number, data: object) {
        let url = `/finetune/run/${run_id}/update`;
        return post(url, data);
    },

    //删除训练实例
    async delTrainingRun(run_id: number) {
        let url = `/finetune/run/${run_id}/delete`;
        return post(url, {});
    },

    // 启动训练实例
    async startTrainingRun(run_id: number) {
        let url = `/finetune/run/${run_id}/start`;
        return post(url, {});
    },

    // 重新设为未开始状态
    async resetTrainingRun(run_id: number) {
        let url = `/finetune/run/${run_id}/reset`;
        return post(url, {});
    },
    // 中止运行中的训练实例
    async cancelTrainingRun(run_id: number) {
        let url = `/finetune/run/${run_id}/cancel`;
        return post(url, {});
    },

    // 获取训练实例排队位置信息
    async getWaitingRank(run_id: number) {
        let url = `/finetune/run/${run_id}/waiting_rank`;
        return post(url, {});
    },

    // 获取训练实例日志
    async getTrainingRunLog(task_id: number, run_id: number) {
        let url = `/finetune/task/${task_id}/run/${run_id}/log`;
        return get(url, {});
    },

    // 获取训练实例检查点
    async getTrainingRunCheckpoint(task_id: number, run_id: number) {
        let url = `/finetune/task/${task_id}/run/${run_id}/checkpoint`;
        return get(url, {});
    },

    // 获取训练实例文件内容
    async getCheckpointFileContent(data: object) {
        let url = `/finetune/run/checkpoint/filecontent`;
        return post(url, data);
    },

    // 下载训练实例检查点
    async downloadCheckpointFile(run_id: number, finishedCallback?: Function, errorCallback?: Function, progressCallback?: Function) {
        let url = `/finetune/run/checkpoint/download/${run_id}`;
        let abortCallback = undefined;
        return getFile(url, {}, abortCallback, progressCallback, errorCallback, finishedCallback);
    },

    // 向客户端发送消息
    async sendMessageToClient(user_id: number, data: object) {
        let url = `/stream/send/${user_id}`;
        return post(url, data);
    }
};
