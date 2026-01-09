import { RouteRecordRaw } from 'vue-router';
const loginPath = import.meta.env.VITE_LOGIN_PATH;

// 静态的路由页面定义（统一都加上env里配置的虚拟目录
// 虚拟目录一般情况下不需要设置，只有在多个vue项目同时部署到同一个nginx主站下有用）
export const staticRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: '',
        alias: ['/index'],
        redirect: loginPath
    },
    {
        path: loginPath,
        name: 'login',
        meta: { title: 'login' },
        component: () => import('@/views/pages/Login.vue')
    },
    {
        path: '/register',
        name: 'register',
        meta: { title: 'register' },
        component: () => import('@/views/pages/Register.vue')
    },
    {
        path: '/password-forgot',
        name: 'password-forgot',
        meta: { title: 'password_forgot' },
        component: () => import('@/views/pages/PasswdForgot.vue')
    },
    {
        path: '/password-reset',
        name: 'password-reset',
        meta: { title: 'password_reset' },
        component: () => import('@/views/pages/PasswdReset.vue')
    },
    {
        path: '/notauth',
        name: 'notauth',
        meta: { title: 'notauth' },
        component: () => import('@/views/pages/NotAuth.vue')
    },
    {
        path: '/notfound',
        name: 'notfound',
        meta: { title: 'notfound' },
        component: () => import('@/views/pages/NotFound.vue')
    }
];
