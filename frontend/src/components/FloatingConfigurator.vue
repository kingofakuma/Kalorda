<script setup lang="ts">
import AppConfigurator from '@/layout/AppConfigurator.vue';
import AppConfigLang from '@/layout/AppConfigLang.vue';
import { useLayout } from '@/layout/composables/layout';

const { toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="fixed flex gap-4 top-8 right-8">
        <Button type="button" @click="toggleDarkMode" rounded :icon="isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" />
        <div class="relative">
            <Button
                icon="pi pi-palette"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                type="button"
                rounded
            />
            <AppConfigurator />
        </div>
        <div class="relative">
            <Button
                severity="secondary"
                rounded
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                type="button"
                class="layout-topbar-action"
                style="width: 35px; height: 35px"
            >
                <i class="iconfont icon-language"></i>
                <!-- <i class="pi pi-language"></i> -->
            </Button>
            <AppConfigLang />
        </div>
    </div>
</template>
