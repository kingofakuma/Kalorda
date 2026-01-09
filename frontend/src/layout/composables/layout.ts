import { computed, reactive } from 'vue';
import { localStorageUtil } from '@/utils/LocalStorageUtil';

const storageName = 'localConfig';
const storageKey = 'layout';

const defaultLayout = {
    preset: 'Aura',
    primary: 'emerald',
    surface: 'slate',
    darkTheme: true,
    menuMode: 'static'
};

const storageLayout = localStorageUtil.get(storageName, storageKey);
const layoutConfig = reactive(storageLayout ? storageLayout : defaultLayout);
// const layoutConfig = reactive({
//     preset: 'Aura',
//     primary: 'emerald',
//     surface: null,
//     darkTheme: false,
//     menuMode: 'static'
// });

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    activeMenuItem: null
});

watch(
    () => layoutConfig,
    (val) => {
        localStorageUtil.set(storageName, storageKey, val);
    },
    { deep: true }
);

export function useLayout() {
    const setActiveMenuItem = (item: any) => {
        layoutState.activeMenuItem = item.value || item;
    };

    // 这是个直接用js设置虚的当前菜单的选中状态，一般用于隐藏的页面需要挂靠一个高亮菜单的显示效果
    const virtualSetActiveMenu = (paths: any) => {
        if (typeof paths === 'string') {
            paths = [paths];
        }
        let layoutMenu = document.querySelector('.layout-menu') as HTMLElement;
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let targetMenu = layoutMenu.querySelector(`a[href="${path}"]`) as HTMLAnchorElement;
            // 保证这里和实际active菜单高亮样式一致
            targetMenu.style.color = 'var(--primary-color)';
            targetMenu.style.fontWeight = 'bold';
        }
    };

    const toggleDarkMode = (immediate?: any) => {
        if (!document.startViewTransition || immediate == true) {
            executeDarkModeToggle();
            return;
        }
        document.startViewTransition(() => executeDarkModeToggle());
    };

    // 明亮-暗黑模式切换
    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle('app-dark');
    };

    // 设置明亮还是暗黑模式，不
    const setDrakMode = (drak: boolean) => {
        layoutConfig.darkTheme = drak;
        if (drak) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    };

    const toggleMenu = (visible?: any) => {
        // 指定菜单显示或不显示
        if (typeof visible === 'boolean') {
            if (layoutConfig.menuMode === 'overlay') {
                layoutState.overlayMenuActive = visible;
            }
            if (window.innerWidth > 991) {
                layoutState.staticMenuDesktopInactive = !visible;
            } else {
                layoutState.staticMenuMobileActive = visible;
            }
            return;
        }
        // 菜单显示与不显示自动切换
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }
        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
        console.log('toggleMenu', visible);
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    const getPrimary = computed(() => layoutConfig.primary);

    const getSurface = computed(() => layoutConfig.surface);

    return {
        layoutConfig,
        layoutState,
        toggleMenu,
        isSidebarActive,
        isDarkTheme,
        getPrimary,
        getSurface,
        setActiveMenuItem,
        virtualSetActiveMenu,
        toggleDarkMode,
        setDrakMode
    };
}
