<script setup lang="ts">
import { FinetuneService } from '@/services/FinetuneService';
import { promise2, fileSizeStr } from '@/utils/Common';
import { showLoading, hideLoading } from '@/utils/GlobalUtil';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
    training_run: {
        type: Object,
        default: () => ({})
    },
    completed: {
        type: Boolean,
        default: false
    }
});
const model_files = ref([]);
const training_run = computed(() => props.training_run);
const completed = ref(props.completed);
const fileViewVisible = ref(false); // json文件查看弹窗显示与关闭
const fileName = ref(''); // 查看的json文件名
const fileContent = ref(''); // 查看的json文件内容

let loadingMark: string[] = [];

const getCheckpointFiles = async () => {
    if (!training_run.value) {
        return;
    }
    model_files.value = [];
    let task_id = training_run.value.task_id;
    let run_id = training_run.value.id;

    let mark = `${task_id}-${run_id}`;
    if (loadingMark.indexOf(mark) >= 0) {
        return;
    }
    loadingMark.push(mark);
    let [err, res] = await promise2(FinetuneService.getTrainingRunCheckpoint(task_id, run_id));
    loadingMark.splice(loadingMark.indexOf(mark), 1);

    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        let task_id = res.data.task_id || 0;
        let run_id = res.data.run_id || 0;
        if (task_id == training_run.value.task_id && run_id == training_run.value.id) {
            model_files.value = res.data.files_info || [];
        }
    }
};

const getCheckpointFileContent = async (file_name: string) => {
    fileName.value = file_name;
    fileContent.value = '';
    let task_id = training_run.value.task_id;
    let run_id = training_run.value.id;
    let data = {
        task_id: task_id,
        run_id: run_id,
        file_name: file_name
    };
    showLoading();
    let [err, res] = await promise2(FinetuneService.getCheckpointFileContent(data));
    hideLoading();
    if (err) {
        return;
    }
    if (res && res.code == 2000) {
        let file_content = res.data.file_content || '';
        // json颜色美化
        let reg = new RegExp('"([a-z\\d_]+?)"', 'ig');
        file_content = file_content.replace(reg, (match: any) => {
            let highlight_log = `<span style="color: #ff9900;font-weight: bold;">${match}</span>`;
            return highlight_log;
        });
        file_content = file_content.replace(/true/gi, '<font style="color: #10B981;">true</font>');
        file_content = file_content.replace(/false/gi, '<font style="color: #999999;">false</font>');
        file_content = file_content.replace(/null/gi, '<font style="color:#ff6633;">null</font>');
        fileContent.value = file_content;
    }
};

const viewFileContent = (file_name: string) => {
    getCheckpointFileContent(file_name);
    fileViewVisible.value = true;
};

watch(
    () => props.training_run,
    () => {
        if (completed.value === true) {
            getCheckpointFiles();
        }
    }
);
watch(
    () => props.completed,
    (newVal) => {
        completed.value = newVal;
        if (newVal === true) {
            getCheckpointFiles();
        }
    }
);

onMounted(() => {
    if (completed.value === true) {
        getCheckpointFiles();
    }
});
</script>

<template>
    <div class="w-full py-2" style="height: 100%; overflow: auto">
        <div v-if="completed && model_files">
            <DataTable :value="model_files">
                <Column :header="t('page.trainsummary.filename')" style="width: 45%">
                    <template #body="slotProps">
                        <div v-if="slotProps.data.type == 'json'">
                            <span class="cursor-pointer flex items-center gap-1" @click="viewFileContent(slotProps.data.name)"
                                >{{ slotProps.data.name }} <i class="pi pi-eye text-green-500 dark:text-green-800 pt-1" v-tooltip.top="`${t('page.trainsummary.viewfilecontent')}`"></i
                            ></span>
                        </div>
                        <div v-else>
                            <span>{{ slotProps.data.name }}</span>
                        </div>
                    </template>
                </Column>
                <Column :header="t('page.trainsummary.modifydate')" style="width: 35%">
                    <template #body="slotProps">
                        <div>
                            {{ slotProps.data.date?.split('.')[0].replace('T', ' ') || '-' }}
                        </div>
                    </template>
                </Column>
                <Column :header="t('page.trainsummary.filesize')">
                    <template #body="slotProps">
                        <div>
                            {{ fileSizeStr(slotProps.data.size) || '-' }}
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div v-else>
            <div class="flex items-center justify-center text-gray-500 gap-1 pt-2">
                <div class="pt-1"><i class="pi pi-exclamation-circle"></i></div>
                <div>
                    <span>{{ t('page.trainsummary.nomodelfile') }}</span>
                </div>
            </div>
        </div>
        <Dialog v-model:visible="fileViewVisible" modal dismissableMask :style="{ width: '55rem' }">
            <template #header>
                <div class="flex items-center justify-between ml-2">
                    <div class="text-lg font-bold"><i class="pi pi-file"></i> {{ fileName }}</div>
                </div>
            </template>
            <div class="mx-3 py-4 h-[60vh] overflow-x-hidden overflow-y-auto line-height-1.5">
                <pre class="whitespace-pre-wrap" v-html="fileContent"></pre>
            </div>
        </Dialog>
    </div>
</template>

<style scoped></style>
