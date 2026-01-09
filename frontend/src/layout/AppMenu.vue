<script setup lang="ts">
// import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useLayout } from '@/layout/composables/layout';
import AppMenuItem from './AppMenuItem.vue';
import { IRouteMenu } from '@/router/MetaType';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '@/store/globalStore';
const { dynamicMenus } = storeToRefs(useGlobalStore());
const { setActiveMenuItem } = useLayout();
const route = useRoute();
const curRouteMemuItemKey = ref<string>('');
const foundRouteMenuKey = (menus: IRouteMenu[], parentItemKey: string) => {
    for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.to.toLowerCase() === route.path.toLowerCase()) {
            curRouteMemuItemKey.value = parentItemKey + '' + i;
        } else if (menu.items) {
            foundRouteMenuKey(menu.items, parentItemKey + '' + i + '-');
        }
    }
};

onMounted(() => {
    // 查找当前路由对应的菜单项key
    foundRouteMenuKey(dynamicMenus.value, '');
    // console.log('curRouteMemuItemKey.value', curRouteMemuItemKey.value);
    // 设置当前路由对应的菜单项为激活选中状态
    if (curRouteMemuItemKey.value) {
        setActiveMenuItem(curRouteMemuItemKey.value);
    }
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in dynamicMenus" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
