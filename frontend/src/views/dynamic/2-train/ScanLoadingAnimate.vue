<script setup lang="ts">
import { $dom } from '@/utils/Common';
const props = defineProps({
    targetFile: {
        type: Object,
        default: () => ({})
    },
    targetModel: {
        type: Object,
        default: () => ({})
    }
});
const scanWakeSize = ref(160);
const cssVar1 = ref(`-${scanWakeSize.value * 1.5}px`);
const cssVar2 = ref('');

let resizeOnceTimer: any = null;
// 监听容器大小变化
let observer1: ResizeObserver | null = null;
const bindResize = () => {
    observer1 = new ResizeObserver((entries, resizeOb) => {
        for (const entry of entries) {
            /* Firefox 实现的 contentBoxSize 是一个单项值, 并非数组 **/
            // const contentBoxSize = Array.isArray(entry.contentBoxSize)
            //     ? entry.contentBoxSize[0]
            //     : entry.contentBoxSize;
            if (resizeOnceTimer) clearTimeout(resizeOnceTimer);
            resizeOnceTimer = setTimeout(() => {
                cssVar2.value = $dom('#scanLoadingBox').clientHeight * 1.5 + 'px';
            }, 50);
            entry;
            resizeOb;
        }
    });
    observer1.observe($dom('#scanLoadingBox'));
};
const unBindResize = () => {
    if (observer1) {
        observer1.unobserve($dom('#scanLoadingBox'));
        observer1.disconnect();
    }
};

const onChange = (show?: boolean) => {
    if (show === undefined) {
        show = props.targetFile.model_ocr_count[props.targetModel.model_code].waiting;
    }
    $dom('#scanLoading').classList.remove('scan-loading');
    if (show) {
        setTimeout(() => {
            $dom('#scanLoading').classList.add('scan-loading');
        }, 1);
    }
};

watch(
    () => props.targetFile,
    () => {
        onChange();
    }
);

watch(
    () => props.targetModel,
    () => {
        onChange();
    }
);

onMounted(() => {
    bindResize();
    onChange();
});

onUnmounted(() => {
    unBindResize();
});
</script>

<template>
    <div id="scanLoadingBox">
        <div class="w-full h-full" :style="{ display: props.targetFile && props.targetFile.model_ocr_count[props.targetModel.model_code].waiting ? 'block' : 'none' }">
            <div style="position: absolute; z-index: 10; width: inherit; height: inherit">
                <div :style="{ width: 'inherit', height: 'inherit' }" style="position: absolute">
                    <slot name="default"></slot>
                </div>
            </div>
            <div style="position: absolute; z-index: 20; width: inherit; height: inherit; overflow: hidden">
                <div id="scanLoading" :style="{ width: 'inherit', height: scanWakeSize + 'px' }" style="position: absolute"></div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.scan-loading) {
    animation: scan 3s ease-in-out infinite;
}

@keyframes scan {
    0% {
        /*最开始块从顶部往下移动，块的位置需要溢出容器，处于容器顶部上方，块的背景颜色从底部到顶部由绿色逐渐透明*/
        margin-top: v-bind(cssVar1);
        background: linear-gradient(#0000 0%, var(--p-primary-500) 100%);
    }

    49% {
        /*动画进行到一半时间时，块必须移动到容器底部并溢出，完成从上到下扫描效果*/
        margin-top: v-bind(cssVar2);
        background: linear-gradient(#0000 0%, var(--p-primary-600) 100%);
    }

    51% {
        /*调转颜色方向，准备往回扫（从下往上）*/
        margin-top: v-bind(cssVar2);
        background: linear-gradient(var(--p-primary-600) 0%, #0000 100%);
    }

    100% {
        /*往回扫*/
        margin-top: v-bind(cssVar1);
        background: linear-gradient(var(--p-primary-500) 0%, #0000 100%);
    }
}
</style>
