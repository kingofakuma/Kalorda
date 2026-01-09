<script setup lang="ts">
// import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import AppConfigLang from './AppConfigLang.vue';
import AppFullscreen from './AppFullscreen.vue';
import { AuthService } from '@/services/AuthService';
import { delToken, ACCESS_TOKEN_KEY, getAccessTokenValue } from '@/utils/Token';
import { gotoRoute, promise2 } from '@/utils/Common';
const { toggleMenu, toggleDarkMode, isDarkTheme, layoutState, layoutConfig } = useLayout();
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const appName = t('app.name');
const appTitle = t('app.title');

const getMenuVisible = (layoutState: any) => {
    if (layoutConfig.menuMode == 'overlay') {
        return layoutState.overlayMenuActive;
    }
    if (layoutState.staticMenuMobileActive) {
        return true;
    } else {
        if (!layoutState.staticMenuDesktopInactive) {
            return window.innerWidth > 991;
        } else {
            return false;
        }
    }
};

const isMenuVisible = ref(getMenuVisible(layoutState));

watch([layoutState, layoutConfig], ([newVal1, newVal2]) => {
    newVal2;
    isMenuVisible.value = getMenuVisible(newVal1);
});

const onWindowResize = () => {
    isMenuVisible.value = getMenuVisible(layoutState);
};

// 用户头像下拉菜单
const profileMenu = ref();
const profileMenuitems = ref([
    {
        label: t('route.title.profile'),
        icon: 'pi pi-user',
        command: () => {
            gotoRoute('/usercenter/profile');
        }
    },
    {
        separator: true
    },
    {
        label: t('route.title.logout'),
        icon: 'pi pi-sign-out',
        command: () => {
            logout();
        }
    }
]);

const toggleProfileMenu = (event: any) => {
    profileMenu.value.toggle(event);
};

const logout = async () => {
    delToken();
    let data = { [ACCESS_TOKEN_KEY]: getAccessTokenValue() };
    await promise2(AuthService.userLogout(data));
    gotoRoute('/login');
};
// 用户下拉菜单结束

onMounted(() => {
    window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);
});
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <router-link to="/" class="layout-topbar-logo" v-tooltip.bottom="appTitle">
                <img src="/logo.svg" :alt="appTitle" style="height: 32px; margin-right: 2px" />
                <span>{{ appName }}</span>
                <!-- 菜单{{ isMenuVisible }} -->
            </router-link>
            <span>&nbsp;</span>
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <!-- <i class="pi pi-bars"></i> -->
                <i style="color: #999" class="iconfont" :class="isMenuVisible ? 'icon-icon-menu-fold' : 'icon-icon-menu-expand'" v-tooltip.bottom="isMenuVisible ? t('app.hideMenu') : t('app.showMenu')"></i>
            </button>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <!-- <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div> -->
                <AppConfigurator />
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action"
                    >
                        <i class="iconfont icon-language"></i>
                        <!-- <i class="pi pi-language"></i> -->
                    </button>
                    <AppConfigLang />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <AppFullscreen />
                    <button type="button" class="layout-topbar-action" @click="toggleProfileMenu">
                        <i class="pi pi-user"></i>
                        <span>{{ t('route.title.usercenter') }}</span>
                    </button>
                    <Menu ref="profileMenu" id="overlay_menu" :model="profileMenuitems" :popup="true" style="min-width: 8rem" />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
