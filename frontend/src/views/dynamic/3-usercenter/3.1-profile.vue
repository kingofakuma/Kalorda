<script lang="ts">
import { RouteMeta } from '@/router/MetaType';
export const routeMeta: RouteMeta = {
    title: 'profile',
    icon: 'pi pi-user',
    keepAlive: true
};
</script>
<script setup lang="ts">
import { showLoading, hideLoading, showToast } from '@/utils/GlobalUtil';
import { AuthService } from '@/services/AuthService';
import { promise2 } from '@/utils/Common';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const user = ref<any>();
const roles = ref<any>([]); // 系统全部角色
const userRoles = ref<any>([]);
const userRoles2 = ref<any>([]);

const loadUserInfo = async () => {
    showLoading();
    let [err, res] = await promise2(AuthService.userInfo());
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        roles.value = res.data.roles;
        user.value = res.data.user;
        let user_roles = user.value.role.split(',');
        for (let user_role_code of user_roles) {
            if (user_role_code) {
                let role = roles.value.find((item: any) => item.code == user_role_code);
                if (role) {
                    userRoles.value.push(role);
                    userRoles2.value.push(role);
                }
            }
        }
    }
};

const editUserInfo = async () => {
    let data = {
        username: user.value.username,
        email: user.value.email
    };
    showLoading();
    let [err, res] = await promise2(AuthService.editUserInfo(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        showToast('success', t('page.common.success'), t('page.profile.userinfosaved'), true);
        userRoles.value = userRoles2.value; // 恢复用户角色
    }
};

onMounted(() => {
    loadUserInfo();
});
</script>
<template>
    <div>
        <div class="card h-full">
            <div class="flex justify-between mb-4">
                <div class="font-semibold text-xl"><i class="pi pi-user" /> {{ t('route.title.profile') }}</div>
                <div class="flex"></div>
            </div>
            <Divider />
            <div class="w-1/2" v-if="user">
                <div class="pt-2 pb-2">
                    <div class="flex justify-between pb-4">
                        <label for="title_input" class="mr-2">{{ t('page.profile.username') }}：</label>
                        <div class="text-sm text-gray-500">{{ t('page.profile.usernamehint') }}</div>
                    </div>
                    <InputText id="username" v-model="user.username" class="w-full" />
                </div>
                <div class="pt-2 pb-2">
                    <div class="flex justify-between pb-4">
                        <label for="title_input" class="mr-2">{{ t('page.profile.email') }}：</label>
                        <div class="text-sm text-gray-500">{{ t('page.profile.emailhint') }}</div>
                    </div>
                    <InputText id="email" v-model="user.email" class="w-full" />
                </div>
                <div class="pt-2 pb-2">
                    <div class="flex justify-between pb-4">
                        <label for="title_input" class="mr-2">{{ t('page.profile.role') }}：</label>
                        <div class="text-sm text-gray-500">{{ t('page.profile.rolehint') }}</div>
                    </div>
                    <MultiSelect v-model="userRoles" :options="roles" optionLabel="name" placeholder="选择角色" class="w-full" :show-toggle-all="false">
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.name }}（{{ slotProps.option.desc }}）</div>
                            </div>
                        </template>
                    </MultiSelect>
                </div>
                <div class="pt-2 pb-2">
                    <div class="flex justify-end">
                        <Button :label="t('page.common.submit')" severity="success" @click="editUserInfo" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
