import { createRouter, createWebHistory } from 'vue-router';
import { staticRoutes } from './RouteStatic';
import { dynamicRoutes, keepAliveNames, convertRoutes2Menus } from './RouteDynamic';
import pinia from '@/store/createpinia';
import { useGlobalStore } from '@/store/globalStore';
import { AuthService } from '@/services/AuthService';
import { ifMustRefreshToken, getRefreshTokenValue, setToken, delToken, hasPermission } from '@/utils/Token';
import { promise2 } from '@/utils/Common';
const globalStore = useGlobalStore(pinia);
globalStore.setKeepAliveNames(keepAliveNames);

import { i18n } from '@/assets/lang/index';
const t = i18n.global.t;
const base = import.meta.env.VITE_APP_BASE;

const router = createRouter({
    history: createWebHistory(base),
    routes: [...staticRoutes, ...dynamicRoutes],
    scrollBehavior: () => ({ left: 0, top: 0 })
});

router.beforeEach(async (to, from, next) => {
    console.log('from.name=' + String(from.name));
    console.log('to.name=' + String(to.name));
    console.log('to.path=' + String(to.path));

    //未匹配到的路由拦截到404页面
    if (to.matched.length === 0) {
        next('/notfound');
    }

    // 页面刷新时通过refresh_token_value重新获取access_token（存内存的，一刷新就没有了，必须要重新获取）
    if (ifMustRefreshToken()) {
        // 刷新token
        const [err, res] = await promise2(
            AuthService.refreshToken({
                refresh_token: getRefreshTokenValue()
            })
        );
        if (err) {
            delToken();
            next('/login');
        }
        if (res && res.code === 2000) {
            console.log('刷新token成功');
            setToken(res.data);
        }
    }

    // 系统菜单的显示与否需要等refresh token -->确定用户role之后处理
    let dynamicMenus = convertRoutes2Menus(dynamicRoutes);
    globalStore.setDynamicMenus(dynamicMenus);

    // 对有权限的路由访问时检查是否有对应的访问权限
    let permissions = to.meta?.permissions;
    if (permissions && Array.isArray(permissions)) {
        if (!hasPermission(permissions)) {
            // 未授权访问
            next('/notauth');
        }
    }

    // document.title = String(to.meta && to.meta.title ? to.meta.title + ' - ' : '') + t(`app.title`);
    document.title = t(`route.title.${to.meta.title}`) + ' - ' + t(`app.name`) + ' - ' + t(`app.title`);
    //保证国际化语言包配置文件中需要有对应的路由title配置

    next();
});

export default router;
