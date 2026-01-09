<script lang="ts">
import { RouteMeta } from '@/router/MetaType';
export const routeMeta: RouteMeta = {
    title: 'usermanage',
    icon: 'pi pi-users',
    keepAlive: true,
    displayMenu: 'auto',
    permissions: ['admin']
};
</script>
<script setup lang="ts">
import { showLoading, hideLoading, showToast } from '@/utils/GlobalUtil';
import { AdminService } from '@/services/AdminService';
import { promise2, objectClone } from '@/utils/Common';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
const confirm = useConfirm();
const { t } = useI18n();

// 开放或关闭外部注册功能
const freeRegist = ref(false);
const userList = ref<any>();
const first = ref(0);
const roles = ref<any>();
const search = ref<any>();
const filterRole = ref<any>();

const getAllUsers = async (role: any, search: any, toFirstPage: boolean) => {
    let data = {
        role: role,
        search: search
    };
    showLoading();
    let [err, res] = await promise2(AdminService.allUsers(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        freeRegist.value = res.data.free_regist == 'True';
        userList.value = res.data.user_list ? res.data.user_list : [];
        userList.value.forEach((item: any) => {
            item.login_count = item.login_count ? item.login_count : 0;
        });
        roles.value = res.data.roles ? res.data.roles : [];
        roles.value.unshift({
            code: undefined,
            name: t('page.common.all'),
            desc: t('page.common.all')
        });
        for (let item of userList.value) {
            item.role2 = [];
            let role_codes = item.role.split(',');
            for (let role_code of role_codes) {
                for (let role of roles.value) {
                    if (role.code == role_code) {
                        item.role2.push(role);
                    }
                }
            }
            // item.role2 = item.role2.substring(0, item.role2.length - 1);
        }
        if (toFirstPage) {
            first.value = 0;
        }
    }
};

const searchUsers = (toFirstPage: boolean) => {
    getAllUsers(filterRole.value?.code, search.value, toFirstPage);
};

const deleteUserConfirm = (user: any, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: t('page.usermanage.askdelete', [user.username]),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('page.common.cancel'),
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: t('page.common.confirm'),
            severity: 'danger'
        },
        accept: () => {
            delUser(user);
        },
        reject: () => {
            // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    });
};

const delUser = async (user: any) => {
    showLoading();
    let [err, res] = await promise2(AdminService.delUser(user.id));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        showToast('success', t('page.common.success'), t('page.usermanage.delsuccess'), true);
        searchUsers(false);
    }
};

const drawerVisible = ref(false);
const drawerHeader = ref<string>();
const drawerShowUser = ref<any>();

const addNewUser = () => {
    drawerVisible.value = true;
    drawerShowUser.value = {};
    drawerHeader.value = t('page.usermanage.adduser');
};

const editUserInfo = (user: any) => {
    drawerVisible.value = true;
    drawerShowUser.value = objectClone(user);
    drawerHeader.value = t('page.usermanage.edituser');
};

const saveUser = async () => {
    let username = drawerShowUser.value.username;
    if (!username) {
        showToast('error', t('page.common.error'), t('page.usermanage.usernameerror'), true);
        return;
    }
    let email = drawerShowUser.value.email;
    if (!email) {
        showToast('error', t('page.common.error'), t('page.usermanage.emailerror'), true);
        return;
    }
    let password = drawerShowUser.value.password;
    if (password) {
        if (password.length < 6) {
            showToast('error', t('page.common.error'), t('page.usermanage.passworderror1'), true);
            return;
        }
        if (/^\d+$/.test(password)) {
            showToast('error', t('page.common.error'), t('page.usermanage.passworderror2'), true);
            return;
        }
    }
    if (!drawerShowUser.value.id) {
        if (!password) {
            showToast('error', t('page.common.error'), t('page.usermanage.passworderror3'), true);
            return;
        }
    }

    let role2 = drawerShowUser.value.role2;
    if (!role2) {
        showToast('error', t('page.common.error'), t('page.usermanage.roleerror'), true);
        return;
    }
    let role = '';
    for (let item of role2) {
        role += item.code + ',';
    }
    role = role.substring(0, role.length - 1);

    let data = {
        user_id: drawerShowUser.value.id,
        username: drawerShowUser.value.username,
        email: drawerShowUser.value.email,
        password: drawerShowUser.value.password,
        role: role
    };

    showLoading();
    let [err, res] = await promise2(AdminService.saveUser(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        let isAddNewUser = !drawerShowUser.value.id;
        if (isAddNewUser) {
            showToast('success', t('page.common.success'), t('page.usermanage.addsuccess'), true);
            searchUsers(true);
        } else {
            showToast('success', t('page.common.success'), t('page.usermanage.editsuccess'), true);
            // searchUsers(false);
            userList.value.forEach((item: any, index: number) => {
                if (item.id == drawerShowUser.value.id) {
                    userList.value[index] = drawerShowUser.value;
                }
            });
        }
        drawerVisible.value = false;
    }
};

const changeFreeRegist = async () => {
    let data = {
        free_regist: freeRegist.value
    };
    showLoading();
    let [err, res] = await promise2(AdminService.changeFreeRegist(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        showToast('success', t('page.common.success'), t('page.usermanage.already') + (freeRegist.value ? t('page.usermanage.openregister') : t('page.usermanage.closeregister')), true);
    }
};

const smtpDialogVisible = ref(false);
const smtpSetting = ref<any>({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: ''
});
const { smtp_host, smtp_port, smtp_user, smtp_password } = toRefs(smtpSetting.value);
const showSmtpDialog = async () => {
    if (smtp_host.value && smtp_port.value && smtp_user.value && smtp_password.value) {
        smtpDialogVisible.value = true;
        return;
    }

    showLoading();
    let [err, res] = await promise2(AdminService.getSmtpSetting());
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        smtpSetting.value = res.data;
        smtp_host.value = res.data.smtp_host;
        smtp_port.value = res.data.smtp_port;
        smtp_user.value = res.data.smtp_user;
        smtp_password.value = res.data.smtp_password;
        smtpDialogVisible.value = true;
    }
};
const saveSmtpSetting = async () => {
    let data = {
        smtp_host: smtp_host.value,
        smtp_port: smtp_port.value,
        smtp_user: smtp_user.value,
        smtp_password: smtp_password.value
    };
    showLoading();
    let [err, res] = await promise2(AdminService.saveSmtpSetting(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        showToast('success', t('page.common.success'), res.message, true);
        smtpDialogVisible.value = false;
    }
};

onMounted(() => {
    getAllUsers(undefined, undefined, true);
});

// 页面开启keepalive时，弹出组件都要手动关闭防止残留到下一个页面
onDeactivated(() => {
    drawerVisible.value = false;
    smtpDialogVisible.value = false;
    confirm.close();
});
</script>
<template>
    <div>
        <div class="card h-full">
            <div class="flex justify-between mb-1">
                <div class="font-semibold text-xl"><i class="pi pi-users" /> {{ t('route.title.usermanage') }}</div>
                <div class="flex items-center gap-2">
                    <div class="text-gray-500 text-sm pt-1">
                        <span v-if="freeRegist">{{ t('page.usermanage.openregister') }}</span>
                        <span v-else>{{ t('page.usermanage.closeregister') }}</span>
                    </div>
                    <ToggleSwitch v-model="freeRegist" @change="changeFreeRegist" />
                    <Button @click="showSmtpDialog" icon="pi pi-cog" severity="secondary" size="small" rounded aria-label="Star" class="mr-[0.5rem]" />
                    <Dialog v-model:visible="smtpDialogVisible" modal :header="t('page.usermanage.smtpsetting')" :style="{ width: '30rem' }">
                        <span class="text-surface-500 dark:text-surface-400 block mb-8">{{ t('page.usermanage.smtpdesc') }}</span>
                        <div class="flex items-center gap-4 mb-4">
                            <label for="smtp_host" class="font-semibold w-24">{{ t('page.usermanage.smtphost') }}</label>
                            <InputText id="smtp_host" class="flex-auto" autocomplete="off" v-model="smtp_host" />
                        </div>
                        <div class="flex items-center gap-4 mb-8">
                            <label for="smtp_port" class="font-semibold w-24">{{ t('page.usermanage.smtpport') }}</label>
                            <InputText id="smtp_port" class="flex-auto" autocomplete="off" v-model="smtp_port" />
                        </div>
                        <div class="flex items-center gap-4 mb-8">
                            <label for="smtp_user" class="font-semibold w-24">{{ t('page.usermanage.smtpuser') }}</label>
                            <InputText id="smtp_user" class="flex-auto" autocomplete="off" v-model="smtp_user" />
                        </div>
                        <div class="flex items-center gap-4 mb-8">
                            <label for="smtp_password" class="font-semibold w-24">{{ t('page.usermanage.smtppassword') }}</label>
                            <InputText id="smtp_password" class="flex-auto" autocomplete="off" v-model="smtp_password" />
                        </div>
                        <div class="flex justify-end gap-2">
                            <Button type="button" :label="t('page.common.cancel')" severity="secondary" @click="smtpDialogVisible = false"></Button>
                            <Button type="button" :label="t('page.common.submit')" @click="saveSmtpSetting"></Button>
                        </div>
                    </Dialog>
                </div>
            </div>

            <div>
                <DataTable v-model:first="first" ref="dt" :value="userList" dataKey="id" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]" selectionMode="single">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <div class="flex gap-2">
                                <Select v-model="filterRole" name="roles" :options="roles" optionLabel="name" :placeholder="t('page.usermanage.rolefilter')" fluid @change="searchUsers(true)" />
                                <InputGroup>
                                    <InputText :placeholder="t('page.usermanage.searchuser')" v-model="search" @keydown.enter="searchUsers(true)" />
                                    <InputGroupAddon>
                                        <Button icon="pi pi-search" severity="secondary" variant="text" @click="searchUsers(true)" />
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                            <div class="flex gap-2">
                                <Button type="button" icon="pi pi-plus" :label="t('page.common.add')" @click="addNewUser()" />
                            </div>
                        </div>
                    </template>
                    <Column field="id" :header="t('page.common.index')" style="width: 10%">
                        <template #body="slotProps"> # {{ slotProps.data.id }} </template>
                    </Column>
                    <Column field="username" :header="t('page.usermanage.username')" style="width: 15%"></Column>
                    <Column field="email" :header="t('page.usermanage.email')">
                        <template #body="slotProps">
                            {{ slotProps.data.email }}
                        </template>
                    </Column>
                    <Column field="role2" :header="t('page.usermanage.role')" style="width: 20%">
                        <template #body="slotProps">
                            {{ slotProps.data.role2.map((item: any) => item.name).join(',') }}
                        </template>
                    </Column>
                    <Column field="created_at" :header="t('page.usermanage.registertime')" sortable style="width: 12%">
                        <template #body="slotProps">
                            {{ slotProps.data.created_at.split('T')[0] }}
                        </template>
                    </Column>
                    <Column field="login_count" :header="t('page.usermanage.logincount')" sortable style="width: 12%">
                        <template #body="slotProps">
                            <div class="w-full pl-[2rem]">{{ slotProps.data.login_count }}</div>
                        </template>
                    </Column>
                    <Column :exportable="false" style="width: 5%">
                        <template #body="slotProps">
                            <div class="w-full flex justify-end">
                                <Button icon="pi pi-pencil" :size="'small'" variant="outlined" rounded class="mr-2" @click="editUserInfo(slotProps.data)" />
                                <Button icon="pi pi-times" :size="'small'" variant="outlined" rounded severity="danger" @click="deleteUserConfirm(slotProps.data, $event)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <ConfirmPopup></ConfirmPopup>
                <Drawer v-model:visible="drawerVisible" position="right" :header="drawerHeader" class="w-full md:!w-[35%] lg:!w-[35%]">
                    <!-- 添加新用户或修改用户信息 -->
                    <div class="w-full">
                        <div class="pt-2 pb-2">
                            <div class="flex justify-between pb-4">
                                <label for="title_input" class="mr-2">{{ t('page.usermanage.username') }}：</label>
                                <div class="text-sm text-gray-500">{{ t('page.usermanage.usernamelimit') }}</div>
                            </div>
                            <InputText id="username" v-model="drawerShowUser.username" class="w-full" maxLength="20" />
                        </div>
                        <div class="pt-2 pb-2">
                            <div class="flex justify-between pb-4">
                                <label for="title_input" class="mr-2">{{ t('page.usermanage.email') }}：</label>
                                <div class="text-sm text-gray-500">{{ t('page.usermanage.emaillimit', ['@']) }}</div>
                            </div>
                            <InputText id="email" v-model="drawerShowUser.email" class="w-full" maxLength="50" />
                        </div>
                        <div class="pt-2 pb-2">
                            <div class="flex justify-between pb-4">
                                <label for="title_input" class="mr-2">{{ t('page.usermanage.setpassword') }}：</label>
                                <div class="text-sm text-gray-500">
                                    <span v-if="drawerShowUser.id">{{ t('page.usermanage.passwordnote') }}</span
                                    ><span v-else>{{ t('page.usermanage.passwordlimit') }}</span>
                                </div>
                            </div>
                            <InputText id="password" v-model="drawerShowUser.password" class="w-full" maxLength="50" />
                        </div>
                        <div class="pt-2 pb-2">
                            <div class="flex justify-between pb-4">
                                <label for="title_input" class="mr-2">{{ t('page.usermanage.role') }}：</label>
                                <div class="text-sm text-gray-500"></div>
                            </div>
                            <MultiSelect v-model="drawerShowUser.role2" :options="roles.slice(1)" optionLabel="name" :placeholder="t('page.usermanage.selectrole')" class="w-full" :show-toggle-all="false">
                                <template #option="slotProps">
                                    <div class="flex items-center">
                                        <div>{{ slotProps.option.name }}（{{ slotProps.option.desc }}）</div>
                                    </div>
                                </template>
                            </MultiSelect>
                        </div>

                        <div class="pt-2 pb-2">
                            <div class="flex justify-end">
                                <Button :label="t('page.common.submit')" severity="success" @click="saveUser" />
                            </div>
                        </div>
                    </div>
                </Drawer>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
