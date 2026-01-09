<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface TrainingStatus {
    code: string;
    value: number;
    name: string;
}

const props = defineProps({
    trainingStatuses: {
        type: Array as PropType<Array<TrainingStatus>>,
        default: () => []
    },
    getWaitingRank: {
        type: Function,
        default: () => {}
    },
    status: {
        type: Number,
        default: 0
    }
});
const op = ref();
const waiting_rank = ref();
const waiting_rank_total = ref();

// 总的训练状态 1 未开始 2 排队等待中 3 启动中 4 训练中 5 保存中 6 已完成 13 14 15 已失败 23 24 25 已中止
const no_start = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'not_start');
const waiting = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'waiting');
const starting = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'starting');
const running = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'running');
const saving = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'saving');
const completed = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'completed');
const failed = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'failed1');
const cancelled = props.trainingStatuses.find((item: TrainingStatus) => item.code == 'cancelled1');

const lastStepStatus = ref(); // 最后的step 0 已完成 1 已失败 2 已中止
const activeStep = ref(); // 取余后的setp

const emit = defineEmits(['trainingRunAction']);
const trainingRunAction = async (action: string) => {
    emit('trainingRunAction', action);
};
const getWaitingRank = async () => {
    waiting_rank.value = undefined;
    waiting_rank_total.value = undefined;
    let result = await props.getWaitingRank();
    if (result) {
        waiting_rank.value = result.waiting_rank;
        waiting_rank_total.value = result.waiting_rank_total;
    }
};
const showPopover = (event: any) => {
    if (activeStep.value == waiting?.value) {
        // 等待中状态时，还要获取实时排队信息
        getWaitingRank();
    }
    op.value.toggle(event);
};
const hidePopover = () => {
    op.value.hide();
};

const adjustStep = (orginal_status: number) => {
    console.log('orginal_status=', orginal_status);
    lastStepStatus.value = Math.floor(orginal_status / 10);
    activeStep.value = orginal_status % 10; //orginal_status - lastStepStatus.value * 10;
    // if (orginal_status != 2) {
    //     // 如果不是排队等待状态，隐藏排队等待提示
    //     hidePopover();
    // }
};

watch(
    () => props.status,
    (newVal) => {
        adjustStep(newVal);
    }
);
onMounted(() => {
    adjustStep(props.status);
});
</script>

<template>
    <div>
        <Popover ref="op">
            <div class="text-sm">
                <div v-if="activeStep == no_start?.value">
                    {{ t('page.trainstatus.starttrain') }}
                </div>
                <div v-if="activeStep == waiting?.value">
                    <div>
                        {{ t('page.trainstatus.currentwait') }} <span v-if="waiting_rank >= 0 && waiting_rank_total >= 0">{{ waiting_rank }}/{{ t('page.trainstatus.total') }}{{ waiting_rank_total }}</span
                        ><span v-else><i class="pi pi-spinner-dotted pi-spin"></i></span> {{ t('page.trainstatus.task') }}，<br />{{ t('page.trainstatus.restart') }}
                    </div>
                </div>
                <div v-if="activeStep == starting?.value && lastStepStatus == 0">
                    {{ t('page.trainstatus.starting') }}
                </div>
                <div v-if="activeStep == running?.value && lastStepStatus == 0">
                    {{ t('page.trainstatus.running') }}
                </div>
                <div v-if="activeStep == saving?.value && lastStepStatus == 0">
                    {{ t('page.trainstatus.saving') }}
                </div>
                <div v-if="activeStep == completed?.value && lastStepStatus == 0">
                    {{ t('page.trainstatus.completed') }}
                </div>
                <div v-if="lastStepStatus == 1">
                    {{ t('page.trainstatus.failed') }}
                </div>
                <div v-if="lastStepStatus == 2">
                    {{ t('page.trainstatus.cancelled') }}
                </div>
            </div>
        </Popover>
        <Stepper :value="activeStep" linear>
            <StepList class="flex items-center gap-1 overflow-hidden select-none">
                <Step v-slot="{ value }" asChild :value="no_start?.value">
                    <div class="flex flex-row flex-auto">
                        <div
                            class="flex flex-row flex-auto"
                            :class="{ 'cursor-pointer': activeStep == no_start?.value }"
                            @click="activeStep == no_start?.value ? trainingRunAction('start') : null"
                            @mouseenter="($event) => (activeStep == no_start?.value ? showPopover($event) : null)"
                            @mouseleave="hidePopover"
                        >
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="{ 'cursor-pointer': activeStep == no_start?.value }">
                                <span
                                    :class="[
                                        'rounded-full border-2 w-8 h-8 inline-flex items-center justify-center',
                                        {
                                            'bg-primary text-primary-contrast border-primary': Number(value.toString()) <= activeStep,
                                            'border-surface-200 dark:border-surface-700': Number(value.toString()) > activeStep
                                        }
                                    ]"
                                >
                                    <i class="pi pi-caret-right" size="small" v-if="activeStep == no_start?.value" />
                                    <i class="pi pi-spinner" size="small" v-else />
                                </span>
                            </button>
                            <div
                                class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap"
                                :class="{
                                    'text-primary': Number(value.toString()) <= activeStep,
                                    'text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep
                                }"
                                style="font-size: 13px"
                            >
                                {{ activeStep == no_start?.value ? no_start?.name : t('page.trainstatus.started') }}
                            </div>
                        </div>
                        <Divider :class="['h-1', { 'border-primary bg-primary': Number(value.toString()) < activeStep, 'border-surface-200 bg-surface-200 dark:border-surface-200 dark:bg-surface-700': Number(value.toString()) >= activeStep }]" />
                    </div>
                </Step>
                <Step v-slot="{ value }" asChild :value="waiting?.value">
                    <div class="flex flex-row flex-auto">
                        <div
                            class="flex flex-row flex-auto"
                            :class="{ 'cursor-pointer': activeStep == waiting?.value }"
                            @click="activeStep == waiting?.value ? trainingRunAction('reset') : null"
                            @mouseenter="($event) => (activeStep == waiting?.value ? showPopover($event) : null)"
                            @mouseleave="hidePopover"
                        >
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="{ 'cursor-pointer': activeStep == waiting?.value }">
                                <span
                                    :class="[
                                        'rounded-full border-2 w-8 h-8 inline-flex items-center justify-center',
                                        {
                                            'bg-primary text-primary-contrast border-primary': Number(value.toString()) <= activeStep,
                                            'border-surface-200 dark:border-surface-700 text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep
                                        }
                                    ]"
                                >
                                    <i :class="['pi pi-spinner', { 'pi-spin rotating': activeStep == waiting?.value }]" size="small" />
                                </span>
                            </button>
                            <div
                                class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap"
                                :class="{ 'text-primary': Number(value.toString()) <= activeStep, 'text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep }"
                                style="font-size: 13px"
                            >
                                {{ waiting?.name }}
                            </div>
                        </div>
                        <Divider :class="['h-1', { 'border-primary bg-primary': Number(value.toString()) < activeStep, 'border-surface-200 bg-surface-200 dark:border-surface-200 dark:bg-surface-700': Number(value.toString()) >= activeStep }]" />
                    </div>
                </Step>
                <Step v-slot="{ value }" asChild :value="starting?.value">
                    <div class="flex flex-row flex-auto">
                        <div
                            class="flex flex-row flex-auto"
                            :class="{ 'cursor-pointer': activeStep == starting?.value && lastStepStatus == 0 }"
                            @click="activeStep == starting?.value && lastStepStatus == 0 ? trainingRunAction('cancel') : null"
                            @mouseenter="($event) => (activeStep == starting?.value && lastStepStatus == 0 ? showPopover($event) : null)"
                            @mouseleave="hidePopover"
                        >
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="{ 'cursor-pointer': activeStep == starting?.value && lastStepStatus == 0 }">
                                <span
                                    :class="[
                                        'rounded-full border-2 w-8 h-8 inline-flex items-center justify-center',
                                        {
                                            'bg-primary text-primary-contrast border-primary': Number(value.toString()) <= activeStep,
                                            'border-surface-200 dark:border-surface-700 text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep
                                        }
                                    ]"
                                >
                                    <i :class="['pi pi-spinner', { 'pi-spin rotating': activeStep == starting?.value && lastStepStatus == 0 }]" size="small" />
                                </span>
                            </button>
                            <div
                                class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap"
                                :class="{ 'text-primary': Number(value.toString()) <= activeStep, 'text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep }"
                                style="font-size: 13px"
                            >
                                {{ starting?.name }}
                            </div>
                        </div>

                        <Divider :class="['h-1', { 'border-primary bg-primary': Number(value.toString()) < activeStep, 'border-surface-200 bg-surface-200 dark:border-surface-200 dark:bg-surface-700': Number(value.toString()) >= activeStep }]" />
                    </div>
                </Step>
                <Step v-slot="{ value }" asChild :value="running?.value">
                    <div class="flex flex-row flex-auto">
                        <div
                            class="flex flex-row flex-auto"
                            :class="{ 'cursor-pointer': activeStep == running?.value && lastStepStatus == 0 }"
                            @click="activeStep == running?.value && lastStepStatus == 0 ? trainingRunAction('cancel') : null"
                            @mouseenter="($event) => (activeStep == running?.value && lastStepStatus == 0 ? showPopover($event) : null)"
                            @mouseleave="hidePopover"
                        >
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="{ 'cursor-pointer': activeStep == running?.value && lastStepStatus == 0 }">
                                <span
                                    :class="[
                                        'rounded-full border-2 w-8 h-8 inline-flex items-center justify-center',
                                        {
                                            'bg-primary text-primary-contrast border-primary': Number(value.toString()) <= activeStep,
                                            'border-surface-200 dark:border-surface-700 text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep
                                        }
                                    ]"
                                >
                                    <i :class="['pi pi-spinner', { 'pi-spin rotating': activeStep == running?.value && lastStepStatus == 0 }]" size="small" />
                                </span>
                            </button>
                            <div
                                class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap"
                                :class="{ 'text-primary': Number(value.toString()) <= activeStep, 'text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep }"
                                style="font-size: 13px"
                            >
                                {{ running?.name }}
                            </div>
                        </div>

                        <Divider :class="['h-1', { 'border-primary bg-primary': Number(value.toString()) < activeStep, 'border-surface-200 bg-surface-200 dark:border-surface-200 dark:bg-surface-700': Number(value.toString()) >= activeStep }]" />
                    </div>
                </Step>
                <Step v-slot="{ value }" asChild :value="saving?.value">
                    <div class="flex flex-row flex-auto">
                        <div
                            class="flex flex-row flex-auto"
                            :class="{ 'cursor-pointer': activeStep == saving?.value && lastStepStatus == 0 }"
                            @click="activeStep == saving?.value && lastStepStatus == 0 ? trainingRunAction('cancel') : null"
                            @mouseenter="($event) => (activeStep == saving?.value && lastStepStatus == 0 ? showPopover($event) : null)"
                            @mouseleave="hidePopover"
                        >
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="{ 'cursor-pointer': activeStep == saving?.value && lastStepStatus == 0 }">
                                <span
                                    :class="[
                                        'rounded-full border-2 w-8 h-8 inline-flex items-center justify-center',
                                        {
                                            'bg-primary text-primary-contrast border-primary': Number(value.toString()) <= activeStep,
                                            'border-surface-200 dark:border-surface-700 text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep
                                        }
                                    ]"
                                >
                                    <i :class="['pi pi-spinner', { 'pi-spin rotating': activeStep == saving?.value && lastStepStatus == 0 }]" size="small" />
                                </span>
                            </button>
                            <div
                                class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap"
                                :class="{ 'text-primary': Number(value.toString()) <= activeStep, 'text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep }"
                                style="font-size: 13px"
                            >
                                {{ saving?.name }}
                            </div>
                        </div>

                        <Divider :class="['h-1', { 'border-primary bg-primary': Number(value.toString()) < activeStep, 'border-surface-200 bg-surface-200 dark:border-surface-200 dark:bg-surface-700': Number(value.toString()) >= activeStep }]" />
                    </div>
                </Step>

                <!-- 已完成 -->
                <Step v-slot="{ value }" asChild :value="completed?.value" v-if="lastStepStatus == 0">
                    <div class="flex flex-row flex-auto">
                        <div
                            class="flex flex-row flex-auto"
                            :class="{ 'cursor-pointer': activeStep == completed?.value && lastStepStatus == 0 }"
                            @click="activeStep == completed?.value && lastStepStatus == 0 ? trainingRunAction('reset') : null"
                            @mouseenter="($event) => (activeStep == completed?.value && lastStepStatus == 0 ? showPopover($event) : null)"
                            @mouseleave="hidePopover"
                        >
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="{ 'cursor-pointer': activeStep == completed?.value && lastStepStatus == 0 }">
                                <span
                                    :class="[
                                        'rounded-full border-2 w-8 h-8 inline-flex items-center justify-center',
                                        {
                                            'bg-primary text-primary-contrast border-primary': Number(value.toString()) <= activeStep,
                                            'border-surface-200 dark:border-surface-700 text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep
                                        }
                                    ]"
                                >
                                    <i :class="['pi', { 'pi-check': activeStep == completed?.value, 'pi-spinner': activeStep != completed?.value }]" size="small" />
                                </span>
                            </button>
                            <div
                                class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap"
                                :class="{ 'text-primary': Number(value.toString()) <= activeStep, 'text-surface-300 dark:text-surface-500': Number(value.toString()) > activeStep }"
                                style="font-size: 13px"
                            >
                                {{ completed?.name }}
                            </div>
                        </div>
                    </div>
                </Step>
                <!-- 已失败 -->
                <Step v-slot="{ value }" asChild :value="failed?.value" v-if="lastStepStatus == 1">
                    <div class="flex flex-row flex-auto">
                        <div class="flex flex-row flex-auto" :class="'cursor-pointer'" @click="trainingRunAction('reset')" @mouseenter="showPopover($event)" @mouseleave="hidePopover">
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="'cursor-pointer'">
                                <span :class="['rounded-full border-2 w-8 h-8 inline-flex items-center justify-center', { 'border-red-200 dark:border-red-700 bg-red-500 dark:text-red-500-contrast text-white': Number(value.toString()) > 0 }]">
                                    <i class="pi pi-times" size="small" />
                                </span>
                            </button>
                            <div class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap" :class="['text-red-500']" style="font-size: 13px">{{ failed?.name }}</div>
                        </div>
                    </div>
                </Step>
                <!-- 已中止 -->
                <Step v-slot="{ value }" asChild :value="cancelled?.value" v-if="lastStepStatus == 2">
                    <div class="flex flex-row flex-auto">
                        <div class="flex flex-row flex-auto" :class="'cursor-pointer'" @click="trainingRunAction('reset')" @mouseenter="showPopover($event)" @mouseleave="hidePopover">
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" :class="'cursor-pointer'">
                                <span
                                    :class="[
                                        'rounded-full border-2 w-8 h-8 inline-flex items-center justify-center',
                                        { 'border-yellow-200 dark:border-yellow-700 bg-yellow-500 dark:text-yellow-500-contrast text-white': Number(value.toString()) > 0 }
                                    ]"
                                >
                                    <i class="pi pi-ban" size="small" />
                                </span>
                            </button>
                            <div class="flex items-center justify-center mx-1 font-medium text-center whitespace-nowrap" :class="['text-yellow-500']" style="font-size: 13px">{{ cancelled?.name }}</div>
                        </div>
                    </div>
                </Step>
            </StepList>
        </Stepper>
    </div>
</template>

<style scoped>
:deep(.p-divider-horizontal:before) {
    border-block-start: 0;
}

@keyframes rotateAnimation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.rotating {
    animation-name: rotateAnimation;
    animation-duration: 1s;
    /* 2秒完成一次完整的旋转 */
    animation-iteration-count: infinite;
    /* 无限次重复 */
    animation-timing-function: linear;
    /* 匀速旋转 */
    display: inline-block;
    /* 确保元素有足够的空间进行旋转 */
}
</style>
