<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const appName = t('app.name');
const base = import.meta.env.VITE_APP_BASE;
</script>

<template>
    <div class="layout-footer">
        {{ appName }} by
        <a :href="`${base}/`" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">vlmocr.com</a>
    </div>
</template>
