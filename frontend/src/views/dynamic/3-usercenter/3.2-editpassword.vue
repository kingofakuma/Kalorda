<script lang="ts">
import { RouteMeta } from '@/router/MetaType';
export const routeMeta: RouteMeta = {
    title: 'editpassword',
    icon: 'pi pi-lock',
    keepAlive: true
};
</script>
<script setup lang="ts">
import { showLoading, hideLoading, showToast } from '@/utils/GlobalUtil';
import { AuthService } from '@/services/AuthService';
import { promise2 } from '@/utils/Common';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const oldPassword = ref('');
const newPasword1 = ref('');
const newPasword2 = ref('');

const editPassword = async () => {
    let data = {
        old_password: oldPassword.value,
        new_password: newPasword1.value
    };
    if (newPasword1.value != newPasword2.value) {
        showToast('error', t('page.common.error'), t('page.editpassword.passworderror'), true);
        return;
    }
    showLoading();
    let [err, res] = await promise2(AuthService.editPassword(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        oldPassword.value = '';
        newPasword1.value = '';
        newPasword2.value = '';
        showToast('success', t('page.common.success'), t('page.editpassword.success'), true);
    }
};
</script>
<template>
    <div>
        <div class="card h-full">
            <div class="flex justify-between mb-4">
                <div class="font-semibold text-xl"><i class="pi pi-lock" /> {{ t('route.title.editpassword') }}</div>
                <div class="flex"></div>
            </div>
            <Divider />
            <div class="w-1/2">
                <div class="pt-2 pb-2">
                    <div class="flex justify-between pb-4">
                        <label for="title_input" class="mr-2">{{ t('page.editpassword.oldpassword') }}：</label>
                        <div class="text-sm text-gray-500">{{ t('page.editpassword.oldpasswordtip') }}</div>
                    </div>
                    <Password id="username" v-model="oldPassword" :feedback="false" fluid class="w-full" />
                </div>
                <div class="pt-2 pb-2">
                    <div class="flex justify-between pb-4">
                        <label for="title_input" class="mr-2">{{ t('page.editpassword.newpassword') }}：</label>
                        <div class="text-sm text-gray-500">{{ t('page.editpassword.newpasswordtip') }}</div>
                    </div>
                    <Password id="email" v-model="newPasword1" :feedback="false" fluid class="w-full" />
                </div>
                <div class="pt-2 pb-2">
                    <div class="flex justify-between pb-4">
                        <label for="title_input" class="mr-2">{{ t('page.editpassword.confirmpassword') }}：</label>
                        <div class="text-sm text-gray-500">{{ t('page.editpassword.confirmpasswordtip') }}</div>
                    </div>
                    <Password id="email" v-model="newPasword2" :feedback="false" fluid class="w-full" />
                </div>
                <div class="pt-2 pb-2">
                    <div class="flex justify-end">
                        <Button :label="t('page.common.submit')" severity="success" @click="editPassword" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
:deep(.p-password-input) {
    width: 100%;
}
</style>
