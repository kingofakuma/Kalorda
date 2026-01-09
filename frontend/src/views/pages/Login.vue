<script setup lang="ts">
import ICPInformation from '@/components/ICPInformation.vue';
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import AppGlobal from '@/layout/APPGlobal.vue';
import { showLoading, hideLoading, showToast } from '@/utils/GlobalUtil';
import { useLayout } from '@/layout/composables/layout';
import { AuthService } from '@/services/AuthService';
import { strIsEmpty, promise2, debounce } from '@/utils/Common';
import { gotoRoute, queryParamValue } from '@/utils/Common';
import { setToken, getAccessTokenValue, setRememberMe, getRememberMe } from '@/utils/Token';
import { useI18n } from 'vue-i18n';
const { isDarkTheme } = useLayout();
const { t } = useI18n();
const base = import.meta.env.VITE_APP_BASE;
const defaultEmail: any = queryParamValue(window.location.href, 'email');
const email = ref(defaultEmail ? defaultEmail : '');

const password = ref('');
const lasting = ref(getRememberMe());

//页面跳转
const gotoHome = async () => {
    // let access_token_value = getAccessTokenValue();
    // const [err, res] = await promise2(AuthService.getUserInfo());
    let url = `/home/index`;
    gotoRoute(url);
};

const isLogined = () => {
    const access_token_value = getAccessTokenValue();
    if (!access_token_value) {
        return;
    }
    gotoHome();
};

const login = (e: any) => {
    debounce(
        async () => {
            if (strIsEmpty(email.value.trim())) {
                showToast('warn', t('page.common.warn'), t('page.login.emailempty'));
                return;
            }

            if (strIsEmpty(password.value.trim())) {
                showToast('warn', t('page.common.warn'), t('page.login.passwordempty'));
                return;
            }

            showLoading();
            // aesEncode(password.value, aesKey)
            let data = { username: email.value, password: password.value };
            const [err, res] = await promise2(AuthService.userLogin(data));
            hideLoading();
            if (err && err.message) {
                showToast('error', t('page.common.error'), err.message);
                return;
            }
            if (res && res.code == 2000) {
                // showToast('success', t('page.common.success'), res.message);
                showToast('success', t('page.common.success'), t('page.login.success'));
                setToken(res.data);
                setTimeout(() => {
                    gotoHome();
                }, 1000);
            }
        },
        1000,
        e
    );
};

const rememberMeChange = (reverse: boolean) => {
    if (reverse) {
        lasting.value = !lasting.value;
    }
    setRememberMe(lasting.value);
};

const handleEnter = (event: any) => {
    if (event.key === 'Enter') {
        document.getElementById('loginButton')?.click();
    }
};

onBeforeMount(async () => {
    await isLogined();
});

onMounted(() => {
    window.addEventListener('keydown', handleEnter);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleEnter);
});
</script>

<template>
    <div>
        <!-- 页面背景 -->
        <div style="position: absolute; top: 0; left: 0; z-index: 0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 800" class="fixed left-0 top-0 min-h-screen min-w-[100vw]" preserveAspectRatio="none">
                <rect :fill="'var(--p-' + (isDarkTheme ? 'surface' : 'primary') + '-600)'" width="1600" height="800"></rect>
                <path
                    :fill="'var(--p-' + (isDarkTheme ? 'surface' : 'primary') + '-800)'"
                    d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2
        478.4 581z"
                ></path>
                <path
                    :fill="'var(--p-' + (isDarkTheme ? 'surface' : 'primary') + '-300)'"
                    d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
                ></path>
                <path
                    :fill="'var(--p-' + (isDarkTheme ? 'surface' : 'primary') + '-200)'"
                    d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"
                ></path>
                <path
                    :fill="'var(--p-' + (isDarkTheme ? 'surface' : 'primary') + '-50)'"
                    d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z"
                ></path>
            </svg>
        </div>
        <FloatingConfigurator style="z-index: 2" />
        <div class="flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center" style="z-index: 1">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="bg-surface-100 dark:bg-surface-900 w-full py-5 px-8 sm:px-20" style="border-radius: 53px; opacity: 0.95">
                        <div class="text-center mb-8">
                            <div style="display: flex; justify-content: center; align-items: center">
                                <img src="/logo.svg" width="58" height="58" class="py-5" />
                            </div>
                            <div class="text-3xl font-medium mb-4">{{ t('page.login.welcome') }}</div>
                            <span class="text-muted-color font-medium">{{ t('page.login.slogan') }}</span>
                        </div>

                        <div>
                            <label for="email" class="block text-xl font-medium mb-2">{{ t('page.login.email') }}</label>
                            <InputText id="email" type="text" :placeholder="t('page.login.emailaddress')" class="w-full md:w-[30rem] mb-8" v-model="email" maxLength="50" />

                            <label for="password" class="block font-medium text-xl mb-2">{{ t('page.login.password') }}</label>
                            <Password id="password" :placeholder="t('page.login.yourpassword')" :toggleMask="true" class="mb-4" fluid :feedback="false" v-model="password" maxLength="50"></Password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <Checkbox v-model="lasting" id="rememberme1" binary class="mr-2" @change="rememberMeChange(false)"></Checkbox>
                                    <label for="rememberme1" class="block" @click="rememberMeChange(true)">{{ t('page.login.rememberme') }}</label
                                    ><i class="pi pi-question-circle text-sm ml-2 mt-0.5" v-tooltip.right="t('page.login.rememberme_tip')"></i>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary"
                                    ><a :href="`${base}/password-forgot`" target="_blank">{{ t('page.login.forgotpassword') }}</a></span
                                >
                            </div>
                            <Button id="loginButton" :label="t('page.login.login')" class="w-full" as="router-link" to="" @click="login"></Button>
                            <div class="text-center py-5">
                                {{ t('page.login.registertext') }} <a :href="`${base}/register`" class="text-primary">{{ t('page.login.registerlink') }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ICPInformation />
        <AppGlobal />
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
