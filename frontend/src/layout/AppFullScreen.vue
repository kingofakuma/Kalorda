<script lang="ts" setup>
import { useFullscreen } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const { toggle, isFullscreen } = useFullscreen();
</script>

<template>
    <button type="button" class="layout-topbar-action" @click="toggle" id="fullscreen-btn">
        <i class="pi" :class="isFullscreen ? 'pi-window-minimize' : 'pi-window-maximize'"></i>
        <span>{{ t('app.fullscreen') }}</span>
    </button>
</template>
