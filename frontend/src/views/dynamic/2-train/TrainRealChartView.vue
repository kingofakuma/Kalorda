<script setup lang="ts">
import { delayDebounce } from '@/utils/Common';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const VueChartJSLineXY = defineAsyncComponent(() => import('./VueChartJSLineXY.vue'));
const VueDataUIWheel = defineAsyncComponent(() => import('./VueDataUIWheel.vue'));

const props = defineProps({
    logs: {
        type: Array<object>,
        default: () => []
    },
    useAnimation: {
        type: Boolean,
        default: false
    }
});

interface TrainEpoch {
    id: string;
    loss: number;
    token_acc: number;
    grad_norm: number;
    learning_rate: number;
    epoch: number;
    global_step: number;
    train_speed: number;
}
interface EvalEpoch {
    id: string;
    eval_loss: number;
    eval_token_acc: number;
    epoch: number;
    global_step: number;
    train_speed: number;
}

interface Summary {
    train_runtime: number;
    train_samples_per_second: number;
    train_steps_per_second: number;
    train_loss: number;
    total_epoch: number;
    max_steps: number;
    percentage: number;
    elapsed_time: string;
    remaining_time: string;
}

const train_epochs = ref<Array<TrainEpoch>>([]);
const eval_epochs = ref<Array<EvalEpoch>>([]);
// 训练的总结性日志
const summary = ref<Summary>({
    train_runtime: 0,
    train_samples_per_second: 0,
    train_steps_per_second: 0,
    train_loss: 0,
    total_epoch: 0,
    max_steps: 0,
    percentage: 0,
    elapsed_time: '',
    remaining_time: ''
});

// 评估的总结性日志和普通的eval日志格式是一样的
const eval_summary = ref<EvalEpoch>({
    id: '',
    eval_loss: 0,
    eval_token_acc: 0,
    epoch: 0,
    global_step: 0,
    train_speed: 0
});

const train_loss_series = ref<number[]>([0]); // 训练数据loss
const train_gnorm_series = ref<number[]>([0]); // 训练数据grad_norm
const train_lrate_series = ref<number[]>([0]); // 训练数据learning_rate
const train_token_acc_series = ref<number[]>([0]); // 训练数据token_acc
const train_train_speed_series = ref<number[]>([0]); // 训练数据train_speed

const eval_loss_series = ref<number[]>([0]); // 评估数据loss
const eval_token_acc_series = ref<number[]>([0]); // 评估数据token_acc
const eval_train_speed_series = ref<number[]>([0]); // 评估数据train_speed
// x轴刻度
const xAxis = ref<number[]>([]);

const resetChart = () => {
    train_epochs.value.length = 0;
    train_loss_series.value.length = 0;
    train_gnorm_series.value.length = 0;
    train_lrate_series.value.length = 0;
    train_token_acc_series.value.length = 0;
    train_train_speed_series.value.length = 0;

    eval_epochs.value.length = 0;
    eval_loss_series.value.length = 0;
    eval_token_acc_series.value.length = 0;
    eval_train_speed_series.value.length = 0;

    xAxis.value.length = 0;

    summary.value = {
        train_runtime: 0,
        train_samples_per_second: 0,
        train_steps_per_second: 0,
        train_loss: 0,
        total_epoch: 0,
        max_steps: 0,
        percentage: 0,
        elapsed_time: '',
        remaining_time: ''
    };
};

const parseJSON = (str: string) => {
    str = str.replace(/'/g, '"');
    str = str.replace(/nan/gi, '0');
    return JSON.parse(str);
};

const parseLogs = (logs: Array<any>) => {
    delayDebounce(() => {
        _parseLogs(logs);
    }, 400);
};

const _parseLogs = (logs: Array<any>) => {
    if (logs.length == 0) {
        resetChart();
        return;
    }

    let train_epochs_arr: any = [];
    let eval_epochs_arr: any = [];
    let summary_obj: any = {};
    let eval_summary_obj: any = {};
    let latest_global_step = 0;
    for (let i = 0; i < logs.length; i++) {
        let msg_id = logs[i].msg_id;
        let log = logs[i].data.log;
        // 单步训练日志，包含loss、grad_norm、learning_rate、token_acc、epoch、global_step/max_steps
        if (log.startsWith("{'loss':")) {
            let data = parseJSON(log);
            if (train_epochs_arr.find((epoch: any) => epoch.id == msg_id)) {
                continue;
            }
            let global_step = Number(data['global_step/max_steps'].split('/')[0]);
            let max_steps = Number(data['global_step/max_steps'].split('/')[1]);
            let train_epoch = {
                id: msg_id, // 每个log的唯一标识msg_id
                loss: data['loss'],
                grad_norm: data['grad_norm'],
                learning_rate: data['learning_rate'],
                token_acc: data['token_acc'],
                epoch: data['epoch'],
                global_step: global_step, // 类似23/50的格式，取23
                train_speed: data['train_speed(iter/s)']
            };
            train_epochs_arr.push(train_epoch);

            // 总步数，第一条日志出现就可提取到数值进行赋值
            if (!summary_obj.max_steps && max_steps > 0) {
                summary_obj.max_steps = max_steps;
            }
            if (global_step > latest_global_step) {
                latest_global_step = global_step;
            }
            // 进度百分比
            if (typeof data['percentage'] === 'string') {
                summary_obj.percentage = Number(data['percentage'].replace('%', ''));
            }
            // 已用时间
            summary_obj.elapsed_time = data['elapsed_time'];
            // 剩余时间
            summary_obj.remaining_time = data['remaining_time'];
        }

        if (log.startsWith("{'eval_loss':")) {
            let data = parseJSON(log);
            if (eval_epochs_arr.find((epoch: any) => epoch.id == msg_id)) {
                continue;
            }
            let global_step = Number(data['global_step/max_steps'].split('/')[0]);
            let max_steps = Number(data['global_step/max_steps'].split('/')[1]);
            let eval_epoch = {
                id: msg_id, // 每个log的唯一标识msg_id
                eval_loss: data['eval_loss'],
                eval_token_acc: data['eval_token_acc'],
                eval_train_speed: data['train_speed(iter/s)'],
                epoch: data['epoch'],
                global_step: global_step, // 类似23/50的格式，取23
                train_speed: data['train_speed(iter/s)']
            };
            if (!summary_obj.max_steps && max_steps > 0) {
                summary_obj.max_steps = max_steps;
            }
            if (global_step > latest_global_step) {
                latest_global_step = global_step;
            }
            // 因为eval总结性日志和普通eval打印格式一样，需要判断处理一下
            let find_index = eval_epochs_arr.findIndex((item: any) => item.global_step == eval_epoch.global_step);
            if (find_index < 0) {
                eval_epochs_arr.push(eval_epoch);
            } else {
                eval_summary_obj = eval_epoch; // eval的总结性日志
            }
        }

        // 最后总结日志，包含train_runtime、train_samples_per_second、train_steps_per_second、train_loss、epoch
        if (log.startsWith("{'train_runtime':")) {
            let data = parseJSON(log);
            summary_obj.train_runtime = Number(data['train_runtime']);
            summary_obj.train_samples_per_second = Number(data['train_samples_per_second']);
            summary_obj.train_steps_per_second = Number(data['train_steps_per_second']);
            summary_obj.train_loss = Number(data['train_loss']);
            summary_obj.total_epoch = Number(data['epoch']);
        }
    }

    if (summary_obj.max_steps && latest_global_step) {
        let computed_percentage = Math.min(100, (latest_global_step / summary_obj.max_steps) * 100);
        if (!summary_obj.percentage || computed_percentage > summary_obj.percentage) {
            summary_obj.percentage = Number(computed_percentage.toFixed(2));
        }
    }
    if (summary_obj.train_runtime) {
        summary_obj.percentage = 100;
    }

    let train_loss_arr = [];
    let train_gnorm_arr = [];
    let train_lrate_arr = [];
    let train_token_acc_arr = [];
    let train_train_speed_arr = [];
    let eval_loss_arr = [];
    let eval_token_acc_arr = [];
    let eval_train_speed_arr = [];
    let xAxis_arr = [];

    for (let i = 0; i < train_epochs_arr.length; i++) {
        let epoch = train_epochs_arr[i];
        train_loss_arr.push(epoch.loss);
        train_gnorm_arr.push(epoch.grad_norm);
        train_lrate_arr.push(epoch.learning_rate);
        train_token_acc_arr.push(epoch.token_acc);
        train_train_speed_arr.push(epoch.train_speed);
        xAxis_arr.push(epoch.global_step || i + 1);
    }
    for (let i = 0; i < eval_epochs_arr.length; i++) {
        let epoch = eval_epochs_arr[i];
        eval_loss_arr.push(epoch.eval_loss);
        eval_token_acc_arr.push(epoch.eval_token_acc);
        eval_train_speed_arr.push(epoch.train_speed);
    }

    train_epochs.value = train_epochs_arr;
    eval_epochs.value = eval_epochs_arr;
    xAxis.value = xAxis_arr;
    train_loss_series.value = train_loss_arr;
    train_gnorm_series.value = train_gnorm_arr;
    train_lrate_series.value = train_lrate_arr;
    train_token_acc_series.value = train_token_acc_arr;
    train_train_speed_series.value = train_train_speed_arr;
    eval_loss_series.value = eval_loss_arr;
    eval_token_acc_series.value = eval_token_acc_arr;
    eval_train_speed_series.value = eval_train_speed_arr;
    summary.value = summary_obj;
    eval_summary.value = eval_summary_obj; // 暂时没用上
};

const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
            document.querySelectorAll('.chart').forEach((item: any) => {
                item.style.width = (width - 40) / 3 + 'px';
            });
        }
    }
});

const watchChartContainerResize = () => {
    const target = document.querySelector('#train-chart-container');
    if (!target) {
        return;
    }
    resizeObserver.observe(target);
};

const unwatchChartContainerResize = () => {
    const target = document.querySelector('#train-chart-container');
    if (!target) {
        return;
    }
    resizeObserver.unobserve(target);
    resizeObserver.disconnect();
};

watch(
    () => props.logs,
    (newLogs: Array<any>) => {
        parseLogs(newLogs);
    },
    { deep: 1 }
);

onMounted(() => {
    parseLogs(props.logs);
    watchChartContainerResize();
});
onUnmounted(() => {
    unwatchChartContainerResize();
});
</script>

<template>
    <div id="train-chart-container" class="w-[100%] h-full p-2 overflow-y-auto overflow-x-hidden select-none">
        <div class="w-[100%] flex gap-4 h-[20rem]">
            <div class="flex-1 rounded-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
                <VueDataUIWheel :title="t('page.trainchart.progress')" :summary="summary" :useAnimation="useAnimation" />
            </div>
            <div class="flex-1 rounded-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
                <VueChartJSLineXY
                    :title="t('page.trainchart.loss')"
                    :data="[
                        { name: 'train_loss', series: train_loss_series, color: '#ea1a1a' },
                        { name: 'eval_loss', series: eval_loss_series, color: '#0f8feb' }
                    ]"
                    :xAxis="xAxis"
                    :yFormatter="'format1'"
                    class="chart"
                />
            </div>
            <div class="flex-1 rounded-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
                <VueChartJSLineXY :title="t('page.trainchart.lrate')" :data="[{ name: 'train_lrate', series: train_lrate_series, color: '#ea1a1a' }]" :xAxis="xAxis" :yFormatter="'format2'" class="chart" />
            </div>
        </div>
        <div class="w-[100%] flex gap-4 h-[20rem] mt-4">
            <div class="flex-1 rounded-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
                <VueChartJSLineXY :title="t('page.trainchart.gnorm')" :data="[{ name: 'train_gnorm', series: train_gnorm_series, color: '#ea1a1a' }]" :xAxis="xAxis" :yFormatter="'format1'" class="chart" />
            </div>
            <div class="flex-1 rounded-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
                <VueChartJSLineXY
                    :title="'token_acc'"
                    :data="[
                        { name: 'train_token_acc', series: train_token_acc_series, color: '#ea1a1a' },
                        { name: 'eval_token_acc', series: eval_token_acc_series, color: '#0f8feb' }
                    ]"
                    :xAxis="xAxis"
                    :yFormatter="'format3'"
                    class="chart"
                />
            </div>
            <div class="flex-1 rounded-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
                <VueChartJSLineXY
                    :title="t('page.trainchart.train_speed')"
                    :data="[
                        { name: 'train_speed', series: train_train_speed_series, color: '#ea1a1a' },
                        { name: 'eval_speed', series: eval_train_speed_series, color: '#0f8feb' }
                    ]"
                    :xAxis="xAxis"
                    :yFormatter="'format1'"
                    class="chart"
                />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
