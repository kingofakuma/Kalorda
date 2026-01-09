<script lang="ts">
import { RouteMeta } from '@/router/MetaType';
export const routeMeta: RouteMeta = {
    title: 'modeltest',
    icon: 'pi pi-map'
};
</script>
<script setup lang="ts">
import { ModeltestService } from '@/services/ModeltestService';
import { showLoading, hideLoading, showToast } from '@/utils/GlobalUtil';
import { gotoRoute, promise2, $dom, fileSizeStr, fileNameLimit } from '@/utils/Common';
import { localStorageUtil } from '@/utils/LocalStorageUtil';
// import { useConfirm } from "primevue/useconfirm";
import { useI18n } from 'vue-i18n';
// const base = import.meta.env.VITE_APP_BASE;
// const server_url = import.meta.env.VITE_API_SERVER_URL;
// const confirm = useConfirm();
const { t } = useI18n();

const modelTypes = [
    { name: 'All Model', code: 'all' },
    { name: 'Base Model', code: 'base' },
    { name: 'LoRA Adapter (Finetune)', code: 'lora' },
    { name: 'Full sft Model (Finetune)', code: 'full' }
];
const selectedModelType = ref();

const allFiles = ref<any[]>();
const allModels = ref<any[]>();
const selectedModels = ref<any[]>([]);
const selectedFiles = ref<any[]>([]);
const selectedImageCount = computed(() => {
    let count = 0;
    for (let file of selectedFiles.value) {
        count += file.images.length;
    }
    return count;
});

interface UploadFile {
    file: any;
    status: string;
    progress: number;
}

let duplicateIEEvent = false;
const fileInput = ref();
const fileInputKey = ref(Date.now());
const accept = ref('.png,.jpg,.jpeg,.webp,.pdf'); //.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.zip,.rar,.7z
const maxFileSize = 1024 * 1024 * 1024 * 10; // 单个文件的大小限制，单位MB
const fileNumLimit = 1000; // 一次最多添加的文件数量
// const chunkLength = 500; //选择文件时多少个文件作为一个处理批次
const uploadingFiles = ref<UploadFile[]>([]);

const keyword = ref('');
const searchTestData = () => {
    if (!keyword.value) {
        keyword.value = '';
    }
    getTestFileList();
};
const clearKeyword = () => {
    keyword.value = '';
    getTestFileList();
};
const isIE11 = () => {
    return !!window['MSInputMethodContext'] && !!document['documentMode'];
};

const isFileUploading = ref(false);
let uploadCancelTokens: any[] = [];
// 暂停取消上传
const uploadCancel = (tIndex?: number) => {
    if (isFileUploading.value) {
        if (tIndex) {
            let uploadCancelToken = uploadCancelTokens.filter((item) => item.tIndex == tIndex)[0];
            if (uploadCancelToken) {
                uploadCancelToken.cancel();
                uploadingFiles.value[tIndex].status = 'pause';
            }
        } else {
            for (let uploadCancelToken of uploadCancelTokens) {
                uploadCancelToken.cancel();
                let t_index = uploadCancelToken?.tIndex;
                if (t_index !== undefined) {
                    uploadingFiles.value[t_index].status = 'pause';
                }
            }
        }
        isFileUploading.value = false;
    }
};

console.log('uploadCancel=', uploadCancel);

// 文件上传
const startUploadFiles = async () => {
    let uploadSuccess = 0;
    let uploadError = 0;
    uploadCancelTokens = [];
    isFileUploading.value = true;
    for (let tIndex = 0; tIndex < uploadingFiles.value.length; tIndex++) {
        console.log(`上传文件${tIndex}`, uploadingFiles.value[tIndex].file.name);
        let file = uploadingFiles.value[tIndex];
        if (file.status == 'complete') {
            uploadSuccess++;
            continue;
        }
        if (isFileUploading.value != true) {
            break;
        }
        file.progress = 0;
        file.status = 'uploading';

        // 上传文件
        let [err, res] = await promise2(
            ModeltestService.uploadTestFile(
                file.file,
                (c: any) => {
                    let uploadCancelToken = { cancel: c, tIndex: tIndex };
                    uploadCancelTokens.push(uploadCancelToken);
                },
                (loaded: number, total: number) => {
                    file.progress = Math.round((loaded / total) * 100);
                }
            )
        );

        // 移除该文件的上传暂停标记
        uploadCancelTokens = uploadCancelTokens.filter((item) => item.tIndex != tIndex);

        if (err) {
            uploadError++;
            file.status = 'error';
            console.log(`上传失败${tIndex}`, uploadingFiles.value[tIndex].file.name, err);
        }
        if (res) {
            uploadSuccess++;
            file.status = 'complete';
            file.progress = 100;
        }
    }

    // 所有文件上传完成
    if (uploadSuccess + uploadError === uploadingFiles.value.length) {
        isFileUploading.value = false;
        uploadingFiles.value = [];
        if (uploadError == 0) {
            showToast('success', t('page.common.success'), t('page.modeltest.uploadsuccess'), true);
        }
        // 清空搜索关键词
        keyword.value = '';
        getTestFileList();
    }
    // 上传完成
};

const onFileChange = async (event: any) => {
    if (event.type !== 'drop' && isIE11() && duplicateIEEvent) {
        duplicateIEEvent = false;
        return;
    }
    let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
    if (files.length > fileNumLimit) {
        //数量超了不加了
        alert(t('page.upload.addfile_limit', [fileNumLimit]));
        files = null;
        return;
    }
    // 处理文件
    let validFiles: any[] = [];
    for (let file of files) {
        if (file.size > maxFileSize) {
            alert(t('page.upload.file_size_limit', [maxFileSize / 1024 / 1024]));
            continue;
        }
        validFiles.push({
            file: file,
            progress: 0
        });
    }
    if (validFiles.length === 0) {
        return;
    }
    // 添加待上传文件
    uploadingFiles.value.push(...validFiles);
    startUploadFiles();
};

const chooseFiles = (event: any) => {
    console.log('chooseFolder', event);
    let fileInputElement: any = $dom('#fileInput');
    fileInputElement.webkitdirectory = false;
    fileInputElement.mozdirectory = false;
    fileInputElement.odirectory = false;
    fileInputElement.directory = false;
    fileInputElement.allowdirs = false;
    fileInputElement.click();
};

const deleteTestFiles = async () => {
    let del_file_ids = selectedFiles.value.map((item: any) => item.id);
    showLoading();
    let [err, res] = await promise2(ModeltestService.deleteTestFiles(del_file_ids));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        showToast('success', t('page.common.success'), t('page.modeltest.delsuccess'), true);
        if (allFiles.value) {
            allFiles.value = allFiles.value.filter((item: any) => !del_file_ids.includes(item.id));
        }
        selectedFiles.value = [];
        editingRows.value = [];
    }
};

const editingRows = ref([]);
const onRowEditSave = async (row: any) => {
    console.log('onRowEditSave', row);
    let new_file_name = row.newData.original_filename;
    let old_file_name = row.data.original_filename;
    if (new_file_name == old_file_name) {
        editingRows.value = editingRows.value.filter((item: any) => item.id !== row.id);
        return;
    }
    let row_index = row.index;
    if (!allFiles.value || allFiles.value.length === 0) {
        return;
    }
    let file_id = allFiles.value[row_index].id;
    let data = {
        file_id: file_id,
        file_name: new_file_name,
        remark: ''
    };
    showLoading();
    let [err, res] = await promise2(ModeltestService.updateTestFile(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        showToast('success', t('page.common.success'), t('page.modeltest.updatesuccess'), true);
        let new_original_filename = res.data.original_filename;
        allFiles.value[row_index].original_filename = new_original_filename;
        editingRows.value = editingRows.value.filter((item: any) => item.id !== row.id);
    }
};

const getTestModelList = async () => {
    let data = {
        page: 1,
        page_size: 1000,
        training_type: selectedModelType.value ? selectedModelType.value.code : ''
    };
    showLoading();
    let [err, res] = await promise2(ModeltestService.getCompletedModels(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        allModels.value = res.data.list || [];
        return;
    }
};
const getTestFileList = async () => {
    let data = {
        page: 1,
        page_size: 1000,
        keyword: keyword.value
    };
    showLoading();
    let [err, res] = await promise2(ModeltestService.allTestFiles(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        allFiles.value = res.data.list || [];
        let server_time = res.time || 0;
        console.log('server_time', server_time);
        // allFiles.value.forEach((item: any, index: number) => {
        //     let update_at = item.update_at;
        //     let update_at_ms = Date.parse(update_at);
        //     let diffSeconds = Math.abs(((server_time) - (update_at_ms / 1000)));
        //     item.is_new = diffSeconds < 60 * 60;
        // });
    }
};

//字母大写
const letter = (string: string) => {
    switch (string) {
        case 'base':
            return 'Base';
        case 'lora':
            return 'LoRA';
        case 'full':
            return 'Full';
        default:
            return 'Custom';
    }
};

const gotoModelFile = (item: any, e: any) => {
    e.stopPropagation();
    // tab=3是第4个tab 文件预览 的索引
    gotoRoute('/train/trainingrun', { task_id: item.task_id, run_id: item.id }); //, tab: 0
};

const gotoOcrResult = async () => {
    if (selectedFiles.value.length === 0 || selectedModels.value.length === 0) {
        showToast('warn', t('page.common.warn'), t('page.modeltest.cantstart'), true);
        return;
    }

    let file_id_list = selectedFiles.value.map((item: any) => item.id);
    let model_list = selectedModels.value.map((item: any) => ({
        model_code: item.model_code,
        model_name: item.model_name,
        training_type: item.training_type
    }));

    let data = {
        file_id_list,
        model_list
    };

    showLoading();
    let [err, res] = await promise2(ModeltestService.createTest(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        localStorageUtil.set('modeltest', 'file_id_list', file_id_list);
        localStorageUtil.set('modeltest', 'model_list', model_list);
        gotoRoute('/train/ocrresult');
    }
};

const stopModelOCRTest = async (callback?: Function) => {
    let [err, res] = await promise2(ModeltestService.stopTest());
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        callback?.();
    }
};

onMounted(() => {
    document.body.style.overflow = ''; // 不要设为auto
    getTestModelList();
    getTestFileList();
    stopModelOCRTest(); // 如果有任务结束掉
});
</script>
<template>
    <div class="w-full">
        <div class="card" style="margin-bottom: 1rem">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="font-semibold text-xl"><i class="pi pi-map" /> {{ t('route.title.modeltest') }}</div>
                </div>
                <div class="flex items-center gap-10">
                    <div class="flex items-center gap-2 text-surface-500">
                        {{ t('page.modeltest.selectedmodel') }}
                        <span class="text-primary bold p-1" v-if="selectedModels.length > 0">{{ selectedModels.length }}</span
                        ><span v-else class="p-1">0</span> <span class="p-1">x</span>{{ t('page.modeltest.selecteddata') }}<span class="text-primary bold p-1" v-if="selectedImageCount > 0">{{ selectedImageCount }}</span
                        ><span v-else class="p-1">0</span>=<span class="p-1">{{ t('page.modeltest.total') }}</span
                        ><span class="text-primary bold p-1" v-if="selectedImageCount * selectedModels.length > 0">{{ selectedImageCount * selectedModels.length }}</span
                        ><span v-else class="p-1">0</span>{{ t('page.modeltest.testcount') }}

                        <!-- <span class="text-primary bold p-1" v-if="selectedFiles.length > 0">+{{
                            selectedFiles.length }}</span> <span v-else>0</span> -->
                    </div>
                    <div>
                        <Button type="button" :severity="selectedFiles.length > 0 && selectedModels.length > 0 ? 'primary' : 'secondary'" :label="t('page.modeltest.starttest')" icon="pi pi-angle-double-right" @click="gotoOcrResult"></Button>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex h-[calc(100vh)] justify-between gap-[1rem]">
            <!-- 模型选择 -->
            <div class="flex-1 h-[100%]">
                <div class="card h-[100%]">
                    <div class="flex justify-between items-center relative">
                        <div>
                            <div class="font-semibold flex items-center gap-2 text-surface-500"><i class="pi pi-check-square"></i> {{ t('page.modeltest.model') }}</div>
                        </div>
                        <div class="absolute right-[0rem] top-[-0.5rem] flex items-center gap-2">
                            <Select v-model="selectedModelType" :options="modelTypes" optionLabel="name" :placeholder="t('page.modeltest.selectmodeltype')" class="w-full md:w-60" size="small" @change="getTestModelList" />
                        </div>
                    </div>
                    <div class="w-full h-[100%]">
                        <div class="w-full h-[calc(100%-2rem)] mt-[1rem] rounded-md flex items-center p-2 justify-center border border-surface-300 dark:border-surface-700 overflow-hidden">
                            <div class="w-full h-[calc(100%)] overflow-x-hidden overflow-y-auto">
                                <div class="w-full flex items-center justify-center mt-2" v-if="allModels && allModels.length === 0">
                                    {{ t('page.modeltest.nomodel') }}
                                </div>
                                <div v-else-if="allModels && allModels.length > 0" class="select-none">
                                    <DataTable v-model:selection="selectedModels" :value="allModels" selectionMode="multiple" dataKey="model_code" :scrollable="false">
                                        <Column selectionMode="multiple" headerStyle="width: 3rem;"></Column>
                                        <Column field="model_name" header="Model Name">
                                            <template #body="slotProps">
                                                <div class="flex items-center h-[2.5rem]" style="word-break: break-word; overflow: hidden">
                                                    <div v-if="slotProps.data.training_type == 'base'" class="text-[var(--p-tag-info-color)] font-bold text-sm">
                                                        {{ slotProps.data.model_name }}
                                                    </div>
                                                    <div v-else class="">
                                                        {{ slotProps.data.model_name }}
                                                    </div>
                                                </div>
                                            </template>
                                        </Column>
                                        <Column header="Type" class="w-[5rem]">
                                            <template #body="slotProps">
                                                <Tag v-if="slotProps.data.training_type == 'base'" severity="info" :value="letter(slotProps.data.training_type)" class="w-[4rem]"> </Tag>
                                                <Tag v-else severity="contrast" :value="letter(slotProps.data.training_type)" class="w-[4rem]"> </Tag>
                                            </template>
                                        </Column>
                                        <Column field="end_time" header="" class="w-[9rem]">
                                            <template #body="slotProps">
                                                <div v-if="slotProps.data.training_type != 'base'">{{ slotProps.data.end_time.split('T')[0] }}</div>
                                                <div v-else></div>
                                            </template>
                                        </Column>
                                        <Column header="" class="w-[1rem]">
                                            <template #body="slotProps">
                                                <div v-if="slotProps.data.training_type != 'base'" v-tooltip.left="`${slotProps.data.task_name} - ${slotProps.data.run_name}`">
                                                    <Button type="button" size="small" severity="secondary" icon="pi pi-directions" @click="gotoModelFile(slotProps.data, $event)"></Button>
                                                </div>
                                            </template>
                                        </Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 数据选择 -->
            <div class="flex-1 h-[100%]">
                <div class="card h-[100%]">
                    <div class="flex justify-between items-center relative">
                        <div>
                            <div class="font-semibold flex items-center gap-2 text-surface-500"><i class="pi pi-check-square"></i> {{ t('page.modeltest.data') }}</div>
                        </div>
                        <div class="absolute right-[0rem] top-[-0.5rem] flex items-center gap-2">
                            <div>
                                <Button type="button" size="small" severity="secondary" :label="t('page.common.delete')" icon="pi pi-minus-circle" @click="deleteTestFiles" v-if="selectedFiles.length > 0"></Button>
                            </div>
                            <div>
                                <input id="fileInput" ref="fileInput" :key="fileInputKey" type="file" @change="onFileChange" multiple :accept="accept" style="visibility: hidden; width: 0; height: 0" />
                                <Button type="button" size="small" severity="secondary" :label="t('page.common.add')" icon="pi pi-plus-circle" @click="chooseFiles"></Button>
                            </div>
                            <div>
                                <InputGroup>
                                    <InputText :placeholder="t('page.modeltest.keywordsearch')" v-model="keyword" @keydown.enter="searchTestData" size="small" />
                                    <InputGroupAddon v-if="keyword && keyword.length > 0">
                                        <Button icon="pi pi-times" severity="secondary" variant="text" @click="clearKeyword" size="small" />
                                    </InputGroupAddon>
                                    <InputGroupAddon>
                                        <Button icon="pi pi-search" severity="secondary" variant="text" @click="searchTestData" size="small" />
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                    <div class="w-full h-[100%]">
                        <div class="w-full h-[calc(100%-2rem)] mt-[1rem] rounded-md flex items-center p-2 justify-center border border-surface-300 dark:border-surface-700 overflow-hidden">
                            <div class="w-full h-[calc(100%)] overflow-x-hidden overflow-y-auto">
                                <div v-if="uploadingFiles.length > 0">
                                    <!-- 上传文件 -->
                                    <div v-for="uploadFile in uploadingFiles" :key="uploadFile.file.name" class="p-1">
                                        <div class="w-full relative">
                                            <div class="w-full">
                                                <ProgressBar :value="uploadFile.progress" class="w-full" style="height: 2.2rem"> &nbsp; </ProgressBar>
                                            </div>
                                            <div class="w-full flex justify-between absolute bottom-[0.4rem] text-sm">
                                                <div class="px-2 flex items-center gap-2 pt-2">
                                                    <i class="pi pi-spin pi-spinner" v-if="uploadFile.status === 'uploading'"></i>
                                                    <i class="pi pi-check" v-if="uploadFile.status === 'complete'"></i>
                                                    <i class="pi pi-times" v-if="uploadFile.status === 'error'"></i>
                                                    <div class="overflow-hidden text-ellipsis whitespace-nowrap">{{ fileNameLimit(uploadFile.file.name, 20) }}</div>
                                                </div>
                                                <div class="px-2 pt-3">{{ fileSizeStr(uploadFile.file.size) }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="w-full flex items-center justify-center mt-2" v-if="allFiles && allFiles.length === 0">
                                        {{ t('page.modeltest.nodata') }}
                                    </div>
                                    <div v-else-if="allFiles && allFiles.length > 0" class="select-none">
                                        <DataTable v-model:selection="selectedFiles" :value="allFiles" selectionMode="multiple" dataKey="id" editMode="row" :scrollable="false" v-model:editingRows="editingRows" @row-edit-save="onRowEditSave">
                                            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                            <Column field="original_filename" header="File Name">
                                                <template #body="slotProps">
                                                    <div class="flex items-center h-[2.5rem]">
                                                        <div v-if="slotProps.data.original_filename.length > 20" style="word-break: break-word" v-tooltip.left="slotProps.data.original_filename">
                                                            {{ fileNameLimit(slotProps.data.original_filename, 20) }}
                                                        </div>
                                                        <div v-else style="word-break: break-word">
                                                            {{ fileNameLimit(slotProps.data.original_filename, 20) }}
                                                        </div>
                                                    </div>
                                                </template>
                                                <template #editor="{ data, field }">
                                                    <InputText v-model="data[field]" spellcheck="false" fluid class="w-full" />
                                                </template>
                                            </Column>
                                            <Column field="file_size" header="Size" class="w-[8rem]">
                                                <template #body="slotProps">
                                                    <div>{{ fileSizeStr(slotProps.data.file_size) }}</div>
                                                    <div v-if="slotProps.data.images.length > 1">{{ slotProps.data.images.length }} pages</div>
                                                </template>
                                            </Column>
                                            <!-- <Column field="create_at" header="Date" class="w-[9rem]">
                                                <template #body="slotProps">
                                                    {{ slotProps.data.create_at.split('T')[0] }}
                                                </template>
                                            </Column> -->
                                            <Column :rowEditor="true" bodyStyle="text-align:center"> </Column>
                                        </DataTable>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
