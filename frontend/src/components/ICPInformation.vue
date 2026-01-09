<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const appName = t('app.name');
const curYear = ref<number>(new Date().getFullYear());
</script>

<template>
    <div style="position: absolute; bottom: 0; z-index: 0; text-align: center; width: 100%">
        <div class="text-primary dark:text-surface-500 font-bold icp-information text-sm">Copyright© 2024-{{ curYear }} {{ appName }} by VLMOCR.COM / {{ t('app.aliyun') }}</div>
        <!-- <div class="text-primary dark:text-surface-500 font-bold icp-information text-sm">
            <a href="https://beian.mps.gov.cn/#/query/webSearch" rel="noopener noreferrer" class="hover:underline">{{ t('app.wanganno') }}</a> /
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="hover:underline">{{ t('app.icpno') }}</a> / Copyright© 2024-{{ curYear }} {{ appName }} by VLMOCR.COM / {{ t('app.aliyun') }}
        </div> -->
    </div>
</template>

<style scoped>
.icp-information {
    padding: 1rem 0 0.5rem 0;
}
</style>
