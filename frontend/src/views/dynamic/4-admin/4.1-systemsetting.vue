<script lang="ts">
import { RouteMeta } from '@/router/MetaType';
export const routeMeta: RouteMeta = {
    title: 'systemsetting',
    icon: 'pi pi-cog',
    displayMenu: 'auto',
    permissions: ['admin']
};
</script>
<script setup lang="ts">
import { getUserId } from '@/utils/Token';
import { SSEClient } from '@/utils/SSEUtil';
import { showLoading, hideLoading, showToast } from '@/utils/GlobalUtil'; //, showToast
import { SystemService } from '@/services/SystemService';
import { promise2, debounce } from '@/utils/Common';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// const base = import.meta.env.VITE_APP_BASE;
const server_url = import.meta.env.VITE_API_SERVER_URL;

const systemInfo = ref<any>({});
const gpu_info = ref<any>({});
const ocr_models = ref<any>([]);

const saveSystemConfig = async () => {
    let data = [];
    for (let model of ocr_models.value) {
        data.push({
            model_code: model.code,
            weights_dir: model.weights_dir
        });
    }

    showLoading();
    const [err, res] = await promise2(SystemService.saveSystemConfig(data));
    if (err) {
        hideLoading();
        return;
    }
    if (res && res.code == 2000) {
        showToast('success', t('page.common.success'), t('page.systemsetting.success'), true);
    }
    hideLoading();
};

const download_model_code = ref('');
const menu = ref();
const items = ref([
    {
        label: t('page.systemsetting.downloadselect'),
        items: [
            {
                label: t('page.systemsetting.huggingface'),
                icon: 'pi pi-link',
                command: (value: any) => {
                    console.log(value);
                    downloadModelWeights('huggingface', download_model_code.value);
                }
            },
            {
                label: t('page.systemsetting.modelscope'),
                icon: 'pi pi-link',
                command: (value: any) => {
                    console.log(value);
                    downloadModelWeights('modelscope', download_model_code.value);
                }
            }
        ]
    }
]);

const downloadMenu = (model_code: string, event: any) => {
    download_model_code.value = model_code;
    menu.value.toggle(event);
};

const downloadModelWeights = async (down_from: string, model_code: string) => {
    debounce(() => {
        _downloadModelWeights(down_from, model_code);
    }, 500);
};

const _downloadModelWeights = async (down_from: string, model_code: string) => {
    let data = {
        down_from: down_from,
        model_code: model_code
    };
    showLoading();
    const [err, res] = await promise2(SystemService.downloadModelWeights(data));
    // hideLoading(); // 下载模型权重是异步操作，不会阻塞主线程，所以这里不隐藏loading，等sse通知下载完成后再隐藏
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        // 等待sse通知下载成功再弹成功提示
        // showToast('success', t('page.common.success'), t('page.systemsetting.downloadsuccess'), true)
    } else {
        // 这时候出错要弹出错误提示
        showToast('error', t('page.common.error'), t('page.systemsetting.downloadfailed'), true);
    }
};

let sseClientId = '';
const sseClient = ref<SSEClient>();
const sseInit = () => {
    let host = server_url.startsWith('http') ? server_url : window.location.origin;
    sseClientId = `client_${getUserId()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let sseUrl = `${host}/api/stream/modeldown/${sseClientId}`;
    sseClient.value = new SSEClient({
        clientId: sseClientId,
        url: sseUrl,
        reconnectAttempts: 5,
        reconnectInterval: 3000,
        onMessage: (message: any) => {
            if (message.type && message.type == 'modeldown') {
                // sse有通知消息了再说隐藏loading
                hideLoading();
                let data = JSON.parse(message.data);
                if (data.status) {
                    let weights_dir = data.weights_dir;
                    let model_code = data.model_code;
                    ocr_models.value.forEach((model: any) => {
                        if (model.code == model_code) {
                            model.weights_dir = weights_dir;
                        }
                    });
                    // 下载成功
                    showToast('success', t('page.common.success'), t('page.systemsetting.downloadsuccess'), true);
                } else {
                    // 下载失败
                    showToast('error', t('page.common.error'), t('page.systemsetting.downloadfailed'), true);
                }
            }
        },
        onError: (error: Event) => {
            console.error('SSE错误:', error);
        },
        onClose: () => {
            console.log('SSE连接关闭');
        },
        onOpen: () => {
            console.log('SSE连接打开');
        }
    });
    sseClient.value.connect();
};

const sseClose = () => {
    sseClient.value?.disconnect();
};

onMounted(async () => {
    showLoading();
    const [err, res] = await promise2(SystemService.getSystemInfo());
    hideLoading();
    if (err) {
        console.log(err);
    }
    if (res && res.code == 2000) {
        systemInfo.value = res.data;
        systemInfo.value.virtual_env = systemInfo.value.virtual_env.env_name + ' (' + systemInfo.value.virtual_env.sys_prefix + ')';
        gpu_info.value = systemInfo.value.gpu_info.available ? systemInfo.value.gpu_info.gpus : [];
        ocr_models.value = systemInfo.value.ocr_models;
    }
    sseInit();
});

onBeforeUnmount(() => {
    sseClose();
});
</script>
<template>
    <div>
        <div class="card h-full">
            <div class="flex justify-between mb-4">
                <div class="font-semibold text-xl"><i class="pi pi-cog" /> {{ t('route.title.systemsetting') }}</div>
                <div class="flex"></div>
            </div>

            <div class="w-full pl-2 pr-1">
                <div class="w-full">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="w-[calc(50%_-_1rem)] relative" v-for="model in ocr_models" :key="model.code">
                            <div class="absolute top-2 right-2 z-1" @click="downloadMenu(model.code, $event)"><i class="pi pi-cloud-download cursor-pointer" v-tooltip.top="t('page.systemsetting.download', [model.name])"></i></div>
                            <IftaLabel>
                                <InputText id="model_weights_dir" v-model="model.weights_dir" class="w-full model-dir" spellcheck="false" />
                                <label for="model_weights_dir">{{ model.name }} {{ t('page.systemsetting.modeldir') }}</label>
                            </IftaLabel>
                        </div>
                    </div>
                </div>
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                <div class="flex items-center justify-between gap-6 mt-4">
                    <div>
                        <div class="text-gray-400 text-sm">
                            <div>
                                {{ t('page.systemsetting.modeldowntip') }} <a href="https://modelscope.cn/models" target="_blank">{{ t('page.systemsetting.modeldownsite1') }}</a> {{ t('page.systemsetting.or') }}
                                <a href="https://www.huggingface.co/" target="_blank">{{ t('page.systemsetting.modeldownsite2') }}</a> {{ t('page.systemsetting.or') }}
                                <a href="https://hf-mirror.com/" target="_blank">{{ t('page.systemsetting.modeldownsite3') }}</a>
                            </div>
                            <div>{{ t('page.systemsetting.modeldirtooltip') }}</div>
                        </div>
                    </div>
                    <div>
                        <Button icon="pi pi-save" severity="primary" rounded aria-label="Bookmark" v-tooltip.top="t('page.common.save')" @click="saveSystemConfig" />
                    </div>
                </div>
            </div>
        </div>
        <div class="card h-full">
            <div class="flex justify-between mb-4">
                <div class="font-semibold text-xl"><i class="pi pi-hashtag" /> {{ t('page.systemsetting.systemenv') }}</div>
            </div>
            <div class="grid grid-cols-12 gap-8">
                <div class="col-span-12 xl:col-span-6">
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.os') }}：</div>
                        <div class="w-1/2">{{ systemInfo.os_name }} {{ systemInfo.os_version }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.pythonversion') }}：</div>
                        <div class="w-1/2">{{ systemInfo.python_version }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.transformersversion') }}：</div>
                        <div class="w-1/2">{{ systemInfo.transformers_version == '' ? t('page.systemsetting.uninstall') : systemInfo.transformers_version }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.vllmversion') }}：</div>
                        <div class="w-1/2">{{ systemInfo.vllm_version == '' ? t('page.systemsetting.uninstall') : systemInfo.vllm_version }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4"></div>
                        <div class="w-1/2"></div>
                    </div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.virtualenv') }}：</div>
                        <div class="w-1/2">{{ systemInfo.virtual_env }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.torchversion') }}：</div>
                        <div class="w-1/2">{{ systemInfo.torch_version == '' ? t('page.systemsetting.uninstall') : systemInfo.torch_version }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.cudatoolkitversion') }}：</div>
                        <div class="w-1/2">{{ systemInfo.cuda_version == '' ? t('page.systemsetting.uninstall') : systemInfo.cuda_version }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.msswiftversion') }}：</div>
                        <div class="w-1/2">{{ systemInfo.swift_version == '' ? t('page.systemsetting.uninstall') : systemInfo.swift_version }}</div>
                    </div>
                    <div class="p-1 flex">
                        <div class="w-1/4">{{ t('page.systemsetting.flashattnversion') }}：</div>
                        <div class="w-1/2 flex items-center">
                            {{ systemInfo.flash_attn_version == '' ? t('page.systemsetting.uninstall') : systemInfo.flash_attn_version }}

                            <div v-if="systemInfo.flash_attn_version !== '' && systemInfo.flash_attn_available === false" class="text-red-500 mx-2 mt-1 text-sm">
                                <i class="pi pi-exclamation-circle mr-1" />{{ t('page.systemsetting.unavailable') }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-2 ml-1">
                <div class="w-full mb-2">{{ t('page.systemsetting.gpuinfo') }}：</div>
                <DataTable :value="gpu_info" showGridlines class="overflow-hidden" tableStyle="">
                    <Column field="id" :header="t('page.common.index')" style="min-width: 50px">
                        <template #body="slotProps">
                            <div class="w-full">{{ slotProps.data.id }}</div>
                        </template>
                    </Column>
                    <Column field="name" :header="t('page.systemsetting.gpuname')" style="min-width: 200px">
                        <template #body="slotProps">
                            <div class="w-full">{{ slotProps.data.name }}</div>
                        </template>
                    </Column>
                    <Column field="memory_total" :header="t('page.systemsetting.gpumemorytotal')" style="min-width: 100px">
                        <template #body="slotProps">
                            <div class="w-full">{{ slotProps.data.memory_total.toFixed(2) }} GB</div>
                        </template>
                    </Column>
                    <Column field="memory_used" :header="t('page.systemsetting.gpumemoryused')" style="min-width: 100px">
                        <template #body="slotProps">
                            <div class="w-full">{{ (slotProps.data.memory_total.toFixed(2) - slotProps.data.memory_free.toFixed(2)).toFixed(2) }} GB</div>
                        </template>
                    </Column>
                    <Column field="memory_free" :header="t('page.systemsetting.gpumemoryfree')" style="min-width: 100px">
                        <template #body="slotProps">
                            <div class="w-full">{{ slotProps.data.memory_free.toFixed(2) }} GB ({{ ((slotProps.data.memory_free.toFixed(2) / slotProps.data.memory_total.toFixed(2)) * 100).toFixed(0) }}%)</div>
                        </template>
                    </Column>
                    <Column field="temperature" :header="t('page.systemsetting.gputemperature')" style="min-width: 100px"></Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
<style scoped>
:deep(.model-dir) {
    padding-top: 2rem !important;
    color: var(--primary-color);
    line-height: 1rem;
}

a:hover {
    color: var(--p-primary-color);
}
</style>
