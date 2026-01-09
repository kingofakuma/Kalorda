<!-- <script lang="ts">
export default {
    name: 'LayoutMainView'
};
</script> -->
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '@/store/globalStore';
const globalStore = useGlobalStore();
const { keepAliveNames } = storeToRefs(globalStore);
</script>
<template>
    <div>
        <!-- <a-watermark v-bind="watermark"> -->
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in" appear>
                <keep-alive :include="keepAliveNames" :max="50">
                    <component :is="Component" />
                </keep-alive>
            </transition>
        </router-view>
        <!-- </a-watermark> -->
    </div>
</template>

<style lang="scss" scoped>
// 部分电脑上chrome浏览器会出现动画造成的图标不显示问题
.fade-enter-active,
.fade-leave-active {
    // transition: opacity 0.25s;

    // will-change: transform;
    // transition: all 0.15s ease;
}

// .fade-enter, .fade-leave-to {
//     opacity: 0;
// }

.fade-enter-from {
    opacity: 0;
    transform: translateX(-5px);
}
.fade-leave-to {
    opacity: 0;
    transform: translateX(5px);
}
.fade-enter-from {
    @extend .fade-leave-to;
}
.fade-leave-to {
    @extend .fade-enter-from;
}
</style>
