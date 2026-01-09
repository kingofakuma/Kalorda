<script setup lang="ts">
// import { onMounted, onUpdated, ref, watch, watchEffect } from 'vue'; // computed,
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '@/store/globalStore';
const { globalMessage, globalLoading, globalToast } = storeToRefs(useGlobalStore());
const toast = useToast();
// message
const messageStyle = ref({});

// loading
const loadingMaskStyle = ref({});
const loadingBoxStyle = ref({});
const loadingStyle = ref({});
const defaultLoadingStrokeWidth = 4; // 环形 loading 默认宽度
const loadingStrokeWidth = ref(String(defaultLoadingStrokeWidth));

watch(
    globalMessage,
    () => {
        let left = document.body.clientWidth / 2;
        messageStyle.value = { left: left + 'px', transform: 'translateX(-50%)' };
    },
    { deep: true, immediate: true }
);

watch(
    globalLoading,
    () => {
        if (!globalLoading.value || Object.keys(globalLoading.value).length === 0 || globalLoading.value.display == 'none') {
            loadingMaskStyle.value = { display: 'none' };
            loadingBoxStyle.value = { display: 'none' };
            return;
        }
        // let message = globalLoading.value.message;
        let position = globalLoading.value.position; //圆形loading的圆心位置 [left, top]
        let size = globalLoading.value.size;
        let mask = globalLoading.value.mask;
        let strokeWidth = globalLoading.value.strokeWidth;
        loadingMaskStyle.value = { display: mask != false ? 'block' : 'none' };
        loadingBoxStyle.value = { display: 'block', left: position[0], top: position[1], transform: 'translate(-50%, -50%)' };
        loadingStyle.value = { width: size, height: size };
        loadingStrokeWidth.value = String(strokeWidth > 0 ? strokeWidth : defaultLoadingStrokeWidth);
    },
    { deep: true, immediate: true }
);

const showToast = (severity: any, summary: string, detail: string, autoClose?: boolean) => {
    //没有指定则默认为3秒后自动关闭
    if (autoClose === undefined) {
        autoClose = true;
    }
    toast.add({ severity: severity, summary: summary, detail: detail, life: autoClose ? 3000 : undefined });
};

onMounted(() => {
    // 防止从其他页面跳转时显示旧页面的提示，清空消息列表和toast内容
    globalMessage.value = [];
    globalToast.value = {};

    watchEffect(() => {});

    watch(
        globalToast,
        (newVal) => {
            if (newVal && Object.keys(newVal).length > 0) {
                showToast(newVal.severity, newVal.summary, newVal.detail, newVal.autoClose);
            }
        },
        { deep: true, immediate: true }
    );
});

onUpdated(() => {});
</script>
<template>
    <div>
        <Toast />
    </div>
    <div class="layout-global-message" :style="messageStyle">
        <Message v-for="(msg, index) of globalMessage" :key="index" :severity="msg.severity" :summary="msg.summary" variant="outlined" :icon="msg.icon" :life="msg.life" :closable="msg.closable">{{ msg.detail }}</Message>
    </div>

    <div class="layout-global-loading-mask" :style="loadingMaskStyle"></div>
    <div class="layout-global-loading-box" :style="loadingBoxStyle">
        <ProgressSpinner :style="loadingStyle" :strokeWidth="loadingStrokeWidth" fill="transparent" animationDuration="0.5s" aria-label="Loading" />
        <div class="layout-global-loading-message">{{ globalLoading.message }}</div>
    </div>
</template>
<style lang="scss" scoped></style>
