import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { directives } from '@/directive/index';
import pinia from '@/store/createpinia';
import PrimeVue from 'primevue/config';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import ConfirmService from 'primevue/confirmationservice';
import Aura from '@primeuix/themes/aura';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { far } from '@fortawesome/free-regular-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { i18n } from '@/assets/lang/index';
import '@/assets/styles.scss';
// library.add(far, fas); // 添加所有空心图标和实心图标
const app = createApp(App);
app.use(router);
app.use(directives); //自定义指令注册
app.use(i18n);
app.use(pinia);
app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ConfirmService);
app.use(DialogService);
app.use(ToastService);
// app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');
