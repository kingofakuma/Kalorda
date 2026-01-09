<script lang="ts">
import { RouteMeta } from '@/router/MetaType';
export const routeMeta: RouteMeta = {
    title: 'upload',
    icon: 'pi pi-database',
    displayMenu: 'hidden'
};
</script>
<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { DatasetService } from '@/services/DatasetService';
import { $dom, promise2, routeBack, queryParamValue } from '@/utils/Common'; //  gotoRoute,
import { showLoading, hideLoading, setCache } from '@/utils/GlobalUtil'; //, showToast
import { usePrimeVue } from 'primevue/config';
import pdfFileImg from '@/assets/image/file_type_pdf.gif';
import wordFileImg from '@/assets/image/file_type_word.gif';
import compressFileImg from '@/assets/image/file_type_compress.gif';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const $primevue = usePrimeVue();
// const env = import.meta.env;
const base = import.meta.env.VITE_APP_BASE;
const { virtualSetActiveMenu } = useLayout();
const parentRoute = base + '/train/dataset';

let datasetId = Number(queryParamValue(window.location.href, 'dataset_id'));
const dataset = ref<any>();

const getDataset = async () => {
    if (datasetId) {
        showLoading();
        const [err, res] = await promise2(DatasetService.getDataset(datasetId));
        hideLoading();
        if (err) {
            return;
        }
        if (res && res.code === 2000) {
            dataset.value = res.data.dataset;
        }
    }
};

const items = [
    {
        label: t('page.upload.addfile_from_folder'),
        icon: 'pi pi-folder-open',
        command: (e: any) => {
            chooseFolder(e);
        }
    },
    {
        separator: true
    },
    {
        label: t('page.upload.addfile_from_clipboard'),
        icon: 'pi pi-clipboard',
        command: () => {
            getClipboardImg();
        }
    }
];

let duplicateIEEvent = false;
const fileInput = ref();
const fileInputKey = ref(Date.now());
const accept = ref('.png,.jpg,.jpeg,.webp,.pdf'); //.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.zip,.rar,.7z
const maxFileSize = 1024 * 1024 * 1024 * 10; // 单个文件的大小限制，单位MB
const fileNumLimit = 1000 * 50; // 一次最多添加的文件数量
const chunkLength = 500; //选择文件时多少个文件作为一个处理批次

// const totalSize = ref(0);
// const totalSizePercent = ref(0);

const totalFiles: Array<ExtendFile> = []; //总的文件，不需要响应式，只是数据存储，不在UI显示
const vShowFiles = reactive<Array<any>>([]); //仅需要显示在UI上的虚拟滚动的文件，使用双向响应式

const totalFileCount = ref(0); // 添加的总文件数量
const vShowFileNumPerLine = ref(6); //一行显示几个
const vShowLineNum = ref(5); //Main区一共显示几行
const vShowLineHeight = ref(302.6 + 18); // 一行显示高度
const startIndex = ref(0); // 当前显示的起始索引
const endIndex = ref(vShowFileNumPerLine.value * vShowLineNum.value); // 当前显示的结束索引

const updateVShowFiles = () => {
    const start = Math.max(0, startIndex.value);
    const end = Math.min(totalFiles.length, endIndex.value);
    vShowFiles.length = 0;
    vShowFiles.push(...totalFiles.slice(start, end));
};

const formatSize = (bytes: number) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale?.fileSizeTypes;

    if (sizes === undefined) {
        return '';
    }

    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};

const isImage = (file: File) => {
    if (!file.type) {
        return false;
    }
    return file.type.indexOf('image') >= 0;
};

const isIE11 = () => {
    return !!window['MSInputMethodContext'] && !!document['documentMode'];
};
const clearInputElement = () => {
    fileInput.value = '';
    fileInputKey.value = Date.now();
    console.log('fileInput.value=', fileInput.value);
};
const clearIEInput = () => {
    duplicateIEEvent = true; //IE11 fix to prevent onFileChange trigger again
    fileInput.value = '';
    fileInputKey.value = Date.now();
    console.log('fileInput.value=', fileInput.value);
};

const isFileSelected = (file: File) => {
    if (totalFiles && totalFiles.length) {
        for (let extentFile of totalFiles) {
            if (extentFile.key === file.name + file.type + file.size) return true;
        }
    }

    return false;
};

const validate = (file: File) => {
    if (totalFiles.length >= fileNumLimit) {
        //数量超了就不加了
        return false;
    }

    if (!isFileTypeValid(file)) {
        // this.messages.push(this.invalidFileTypeMessage.replace('{0}', file.name).replace('{1}', this.accept));
        return false;
    }

    if (file.size > maxFileSize) {
        // this.messages.push(this.invalidFileSizeMessage.replace('{0}', file.name).replace('{1}', this.formatSize(this.maxFileSize)));
        return false;
    }

    return true;
};

const isFileTypeValid = (file: File) => {
    let acceptableTypes = accept.value.split(',').map((type) => type.trim());

    for (let type of acceptableTypes) {
        let acceptable = isWildcard(type) ? getTypeClass(file.type) === getTypeClass(type) : file.type == type || getFileExtension(file).toLowerCase() === type.toLowerCase();

        if (acceptable) {
            return true;
        }
    }

    return false;
};
const getTypeClass = (fileType: string) => {
    return fileType.substring(0, fileType.indexOf('/'));
};
const isWildcard = (fileType: string) => {
    return fileType.indexOf('*') !== -1;
};
const getFileExtension = (file: File) => {
    return '.' + file.name.split('.').pop();
};

// 1、选取本地文件的方式添加到上传列表中
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
    await fileListProcess(files, chunkLength);
    if (event.type !== 'drop' && isIE11()) {
        clearIEInput();
    } else {
        clearInputElement();
    }
};

const fileListProcess = async (files: FileList, chunkLength: number) => {
    showLoading();
    let array: Array<File> = [...files];
    let tempFiles: Array<ExtendFile> = [];
    let t1 = Date.now();
    while (array.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        let sFiles = array.splice(0, chunkLength);
        for (let file of sFiles) {
            //将tryAddFile方法变一下：中间临时变量存储最后一次性赋值给totalFiles
            if (!isFileSelected(file)) {
                if (validate(file)) {
                    tempFiles.push(getExtendFile(file));
                }
            }
        }
    }
    let t2 = Date.now();
    console.log('处理耗时', t2 - t1);
    if (tempFiles.length > 0) {
        // totalFiles = [...totalFiles, ...tempFiles];
        totalFiles.push(...tempFiles);
        totalFileCount.value += tempFiles.length;
        updateVShowFiles();
        // 计算总高度
        changeTotalHeight();
    }
    hideLoading();
    console.log('处理完成', totalFiles.length);
};

const tryAddFile = (file: File) => {
    if (!isFileSelected(file)) {
        if (validate(file)) {
            totalFiles.push(getExtendFile(file));
            totalFileCount.value += 1;
            updateVShowFiles();
            // 计算总高度
            changeTotalHeight();
        }
    }
};

// 文件上传状态
enum FileStatus {
    Pending = 'Pending', //未开始
    Uploading = 'Uploading', //正在上传
    Pause = 'Pause', //暂停,主动暂停
    Error = 'Error', //出错,被动暂停
    Complete = 'Complete' //完成
}

type ExtendFile = {
    file: File;
    key: string;
    status: FileStatus;
    checkpoint: any;
    percent: number;
    objectURL: any;
};

//扩展file属性
const getExtendFile = (file: File): ExtendFile => {
    let eFile: ExtendFile = { file: file, key: file.name + file.type + file.size, status: FileStatus.Pending, percent: 0, checkpoint: null, objectURL: isImage(file) ? window.URL.createObjectURL(file) : null };
    return eFile;
};
// 释放objectURL
const revokeFileObjectURL = (tIndex?: number) => {
    if (tIndex !== undefined && tIndex >= 0 && tIndex < totalFiles.length) {
        // 单个释放
        if (totalFiles[tIndex].objectURL) {
            window.URL.revokeObjectURL(totalFiles[tIndex].objectURL);
        }
    } else {
        // 全部释放
        for (let file of totalFiles) {
            if (file.objectURL) {
                window.URL.revokeObjectURL(file.objectURL);
            }
        }
    }
};

const removeFile = (vIndex: number) => {
    if (vShowFiles.length == 0) {
        return;
    }
    if (vIndex < 0 || vIndex >= vShowFiles.length) {
        return;
    }

    clearInputElement();
    let file = vShowFiles.splice(vIndex, 1)[0]; // 删掉一个
    let tIndex = vIndex + startIndex.value;

    //如果当前正在上传，中止上传
    if (file.status === FileStatus.Uploading) {
        uploadCancel(tIndex);
    }

    if (tIndex >= 0) {
        revokeFileObjectURL(tIndex); // 如果有objectURL先释放
        totalFiles.splice(tIndex, 1)[0];
        totalFileCount.value -= 1;
        // 更新虚拟列表的起止索引
        if (vIndex == 0) {
            //如果删除的是vShowFiles的第一个元素，才需要改一下startIndex；否则不用改startIndex
            startIndex.value = tIndex;
        }
        endIndex.value = startIndex.value + vShowFileNumPerLine.value * vShowLineNum.value;
        updateVShowFiles();
        changeTotalHeight();
    }
};

const removeAllFiles = () => {
    uploadCancel(); //中止上传，不论正在上传哪个文件

    clearInputElement();
    totalFileCount.value = 0;
    totalFiles.length = 0;
    vShowFiles.length = 0;

    if ($dom('#fileListFill')) {
        $dom('#fileListFill').style.height = '0px';
    }
    changeTotalHeight();
    startIndex.value = 0;
    endIndex.value = vShowFileNumPerLine.value * vShowLineNum.value;
    revokeFileObjectURL(); // 释放objectURL
};

const changeTotalHeight = () => {
    if (totalFiles.length > 0 && $dom('#fileDisplayBox')) {
        let vShowTotalLine = Math.ceil(totalFiles.length / vShowFileNumPerLine.value);
        $dom('#fileDisplayBox').style.height = vShowTotalLine * vShowLineHeight.value + 'px';
    } else {
        $dom('#fileDisplayBox').style.height = '';
    }

    console.log(`vShowFiles.length=${vShowFiles.length}`);
};

const fileTypeImage = (file: File) => {
    let fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pdf')) {
        return pdfFileImg;
    }
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        return wordFileImg;
    }
    if (fileName.endsWith('.zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) {
        return compressFileImg;
    }
};

const onDragEnter = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    console.log('onDragEnter', event);
};
const onDragOver = (event: any) => {
    let fileDisplayBox: any = $dom('#fileDisplayBox');
    fileDisplayBox.style.border = '2px dashed var(--primary-color)';
    fileDisplayBox.style.borderRadius = '6px';
    fileDisplayBox.setAttribute('data-p-highlight', true);
    event.stopPropagation();
    event.preventDefault();
};
const onDragLeave = () => {
    let fileDisplayBox: any = $dom('#fileDisplayBox');
    fileDisplayBox.style.border = '';
    fileDisplayBox.setAttribute('data-p-highlight', false);
};
const onDrop = (event: any) => {
    console.log('onDrop', event);
    let fileDisplayBox: any = $dom('#fileDisplayBox');
    fileDisplayBox.style.border = '';
    fileDisplayBox.setAttribute('data-p-highlight', false);
    event.stopPropagation();
    event.preventDefault();

    const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
    if (files.length > 0) {
        onFileChange(event);
    }
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

const chooseFolder = (event: any) => {
    console.log('chooseFolder', event);
    let fileInputElement: any = $dom('#fileInput');
    fileInputElement.webkitdirectory = true;
    fileInputElement.mozdirectory = true;
    fileInputElement.odirectory = true;
    fileInputElement.directory = true;
    fileInputElement.allowdirs = true;
    fileInputElement.click();
};

// 2、从剪贴板复制图片
const getClipboardImg = async () => {
    if (!navigator.clipboard) {
        alert(t('page.data.clipboard_not_support'));
        return;
    }
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
            if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg' || type === 'image/webp') {
                const blob = await clipboardItem.getType(type);
                const ext = type.split('/')[1];
                const fileName = `crop_${Date.now()}.${ext}`;
                // const reader = new FileReader();
                // reader.addEventListener('load', function () {
                // });
                // reader.readAsDataURL(blob);
                let file = new File([blob], fileName, {
                    type: type,
                    lastModified: Date.now()
                });
                tryAddFile(file);
                // 清空剪贴板
                await navigator.clipboard.writeText('');
                return;
            }
        }
        alert(t('page.upload.clipboard_no_data'));
        // message.warning('剪贴板中没有图片');
    }
};

// 滚动条滚动时触发事件
const onScrollEvent = (e: any) => {
    e;
    let beginHeight = 90;

    if (window.scrollY > beginHeight) {
        let menu = $dom('#fixedMenu');
        menu.style.position = 'fixed';
        menu.style.top = '56px'; // 页面布局layout-header的高度
        menu.style.right = '57px';
        menu.style.zIndex = '100';
    } else {
        $dom('#fixedMenu').style.position = '';
    }

    // const fileDisplayBox: any = $dom('#fileDisplayBox');
    const fill = $dom('#fileListFill'); //空白高度填充层
    const main = $dom('#fileListMain');
    let computeStartIndex = 0; // 计算开始的index

    if (!fill || !main) {
        return;
    }

    if (window.scrollY > beginHeight) {
        let scrollLineNum = Math.ceil((window.scrollY - beginHeight) / vShowLineHeight.value);
        fill.style.height = (scrollLineNum - 1) * vShowLineHeight.value + 'px';
        computeStartIndex = (scrollLineNum - 1) * vShowFileNumPerLine.value;
    } else {
        fill.style.height = '0px';
        computeStartIndex = 0;
    }

    if (startIndex.value != computeStartIndex) {
        //只有应该变的时候才改变数据源
        startIndex.value = computeStartIndex;
        endIndex.value = startIndex.value + vShowFileNumPerLine.value * vShowLineNum.value;
        requestAnimationFrame(updateVShowFiles);
    }
};

const onWheelEvent = (e: any) => {
    e = e || window.event;
    let flag = e.wheelDelta || e.detail;

    // 是否处于图片预览状态
    let imagePreviewToolbar = $dom('.p-image-toolbar');
    if (!imagePreviewToolbar) {
        return;
    }
    // 调用对应处理函数
    if (flag < 0) {
        // 向下滚动
        console.log('滚轮向下滚动');
        $dom('.p-image-zoom-out-button').click();
    } else {
        // 向上滚动
        console.log('滚轮向上滚动');
        $dom('.p-image-zoom-in-button').click();
    }
};

// 上传前对图片文件的预处理，限制图片尺寸
const tryConvertImage = (file: ExtendFile, limitWidth: number, limitHeight: number): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!file || !file.objectURL) {
            resolve(file);
        }
        const image = document.createElement('img');
        image.onload = function () {
            let originalWidth = image.width;
            let originalHeight = image.height;
            let width = originalWidth;
            let height = originalHeight;
            if (originalWidth > limitWidth || originalHeight > limitHeight) {
                let scale = Math.min(limitWidth / originalWidth, limitHeight / originalHeight);
                width = originalWidth * scale;
                height = originalHeight * scale;
            } else {
                resolve(file);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            // ctx?.imageSmoothingEnabled = true;
            // ctx?.imageSmoothingQuality = 'high';
            ctx?.drawImage(image, 0, 0, width, height);
            let orginalFile = file.file;
            // canvas.style.transform= `scale(${scale});transform-origin: 0 0`;
            canvas.toBlob((blob: any) => {
                if (blob) {
                    let newFile = new File([blob], orginalFile.name, {
                        type: orginalFile.type,
                        lastModified: orginalFile.lastModified
                    });
                    resolve(newFile);
                } else {
                    reject(new Error('Failed to convert image to blob'));
                }
            });
        };
        image.src = file.objectURL;
    });
};
console.log(typeof tryConvertImage);

const isDatasetUploading = ref(false);
let uploadCancelTokens: any[] = [];
// 暂停取消上传
const uploadCancel = (tIndex?: number) => {
    if (isDatasetUploading.value) {
        if (tIndex) {
            let uploadCancelToken = uploadCancelTokens.filter((item) => item.tIndex == tIndex)[0];
            if (uploadCancelToken) {
                uploadCancelToken.cancel();
                totalFiles[tIndex].status = FileStatus.Pause;
            }
        } else {
            for (let uploadCancelToken of uploadCancelTokens) {
                uploadCancelToken.cancel();
                let t_index = uploadCancelToken?.tIndex;
                if (t_index !== undefined) {
                    totalFiles[t_index].status = FileStatus.Pause;
                }
            }
        }
        isDatasetUploading.value = false;
    }
};
// 文件上传
const uploadFiles = async () => {
    let uploadSuccess = 0;
    let uploadError = 0;
    uploadCancelTokens = [];
    isDatasetUploading.value = true;
    for (let tIndex = 0; tIndex < totalFiles.length; tIndex++) {
        console.log(`上传文件${tIndex}`, totalFiles[tIndex].file.name);
        let file = totalFiles[tIndex];
        if (file.status == FileStatus.Complete) {
            uploadSuccess++;
            continue;
        }
        if (isDatasetUploading.value != true) {
            break;
        }
        file.percent = 0;
        file.status = FileStatus.Uploading;
        trySyncVShowFile(file, tIndex);
        // 上传文件
        let [err, res] = await promise2(
            DatasetService.uploadDatasetFile(
                datasetId,
                file.file,
                (c: any) => {
                    let uploadCancelToken = { cancel: c, tIndex: tIndex };
                    uploadCancelTokens.push(uploadCancelToken);
                },
                (loaded: number, total: number) => {
                    file.percent = Math.round((loaded / total) * 100);
                    trySyncVShowFile(file, tIndex);
                }
            )
        );

        // 移除该文件的上传暂停标记
        uploadCancelTokens = uploadCancelTokens.filter((item) => item.tIndex != tIndex);

        if (err) {
            uploadError++;
            file.status = FileStatus.Error;
            console.log(`上传失败${tIndex}`, totalFiles[tIndex].file.name, err);
        }
        if (res) {
            uploadSuccess++;
            file.status = FileStatus.Complete;
            file.percent = 100;
            trySyncVShowFile(file, tIndex);
        }
    }
    // 所有文件上传完成
    if (uploadSuccess + uploadError === totalFiles.length) {
        isDatasetUploading.value = false;
        // 上传后做个标记，方便查看dataview页面(开启了keepalive)时强制刷下页面
        let key = 'refresh-dataset-' + datasetId;
        setCache(key, new Date().getTime());

        console.log(`上传完成isDatasetUploading.value=${isDatasetUploading.value}，刷新dataview页面${key}`);
        // 上传完成后触发数据集预处理-如果有pdf文件则转图片
        await DatasetService.preprocess(datasetId);
    }

    // 上传完成
};

// （如果当前上传的文件处在正预览的虚拟列表中）同步更新vShowFiles状态和进度条
const trySyncVShowFile = (file: ExtendFile, tIndex: number) => {
    if (tIndex >= startIndex.value && tIndex < endIndex.value) {
        let vIndex = tIndex - startIndex.value;
        if (vShowFiles[vIndex] && vShowFiles[vIndex].key === file.key) {
            vShowFiles[vIndex] = null; // 因为 vShowFiles[vIndex]和file引用地址相同，先切断一下再赋值否则UI界面不会响应式变化
            vShowFiles[vIndex] = file;
        }
    }
};

const getFileStatus = (status: FileStatus) => {
    let result = '';
    switch (status) {
        case FileStatus.Pending:
        default:
            result = t('page.upload.pending');
            break;
        case FileStatus.Uploading:
            result = t('page.upload.uploading');
            break;
        case FileStatus.Pause:
            result = t('page.upload.pausing');
            break;
        case FileStatus.Error:
            result = t('page.upload.erroring');
            break;
        case FileStatus.Complete:
            result = t('page.upload.complete');
            break;
    }
    return result;
};

const getSeverity = (status: FileStatus) => {
    let result = 'warn'; // secondary" | "info" | "success" | "warn" | "danger" | "contrast"
    switch (status) {
        case FileStatus.Pending:
        default:
            result = 'warn';
            break;
        case FileStatus.Uploading:
            result = 'info';
            break;
        case FileStatus.Pause:
            result = 'info';
            break;
        case FileStatus.Error:
            result = 'danger';
            break;
        case FileStatus.Complete:
            result = 'success';
            break;
    }
    return result;
};

onMounted(() => {
    virtualSetActiveMenu(parentRoute);
    window.addEventListener('scroll', onScrollEvent);
    window.addEventListener('wheel', onWheelEvent);
    getDataset();
});

onBeforeUnmount(() => {
    removeAllFiles();
});

onUnmounted(() => {
    window.removeEventListener('scroll', onScrollEvent);
    window.removeEventListener('wheel', onWheelEvent);
});
</script>
<template>
    <div>
        <div class="card h-full" v-if="dataset">
            <div class="flex justify-between items-center mb-4 w-full">
                <div class="flex items-center mb-1">
                    <div class="flex gap-2"><Button icon="pi pi-arrow-left" :size="'small'" rounded class="mr-2" @click="routeBack()" /></div>
                    <div class="font-semibold text-xl">
                        <i class="pi pi-database" /> {{ t('route.title.dataset') }} <i class="pi pi-chevron-right" /> {{ t('page.upload.title', [dataset.name.length > 10 ? dataset.name.substring(0, 10) + '...' : dataset.name]) }}
                    </div>
                </div>

                <div id="fixedMenu" class="flex items-center gap-4">
                    <input id="fileInput" ref="fileInput" :key="fileInputKey" type="file" @change="onFileChange" multiple :accept="accept" style="visibility: hidden; width: 0; height: 0" />
                    <div class="text-sm text-surface-500 dark:text-surface-400">{{ t('page.upload.curfiles', [totalFileCount]) }}</div>
                    <SplitButton :label="t('page.common.add')" icon="pi pi-plus" :model="items" class="flex-auto whitespace-nowrap" @click="chooseFiles" :disabled="isDatasetUploading" />
                    <Button
                        v-if="!isDatasetUploading"
                        :label="t('page.common.upload')"
                        icon="pi pi-cloud-upload"
                        :severity="totalFiles.length === 0 ? 'contrast' : 'info'"
                        :disabled="totalFiles.length === 0"
                        @click="uploadFiles"
                        class="flex-auto whitespace-nowrap"
                    />
                    <Button
                        v-if="isDatasetUploading"
                        :label="t('page.common.pause')"
                        icon="pi pi-spin pi-spinner"
                        :severity="totalFiles.length === 0 ? 'contrast' : 'info'"
                        :disabled="totalFiles.length === 0"
                        @click="uploadCancel()"
                        class="flex-auto whitespace-nowrap"
                    />
                    <Button
                        :label="t('page.common.remove')"
                        icon="pi pi-times"
                        :severity="totalFiles.length === 0 ? 'contrast' : 'danger'"
                        :disabled="totalFiles.length === 0 || isDatasetUploading"
                        @click="removeAllFiles"
                        class="flex-auto whitespace-nowrap"
                    />
                </div>
            </div>
            <!-- fileDisplayBox 有选文件时 -->
            <div id="fileDisplayBox" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" style="border: 2px" v-if="vShowFiles.length > 0">
                <div>
                    <div id="fileListFill" style="visibility: hidden; height: 0"></div>
                    <div id="fileListMain">
                        <div class="grid grid-cols-24 gap-4">
                            <div v-for="(file, index) of vShowFiles" :key="file.key" class="col-span-12 sm:col-span-6 lg:col-span-4">
                                <div class="p-8 border border-surface-200 dark:border-surface-700 rounded col-span-12 sm:col-span-6">
                                    <div class="text-center">
                                        <div class="h-40" v-if="isImage(file.file)">
                                            <Image preview role="presentation" :alt="file.file.name" :src="file.objectURL" width="100" height="50" class="max-h-40" />
                                        </div>
                                        <div class="h-40 flex justify-center" v-else>
                                            <Image :alt="file.file.name" :src="fileTypeImage(file.file)" width="100" height="50" class="max-h-40" role="presentation" />
                                        </div>
                                        <div class="h-28">
                                            <div class="mt-2 mb-1">
                                                <div class="font-semibold text-ellipsis whitespace-nowrap overflow-hidden cursor-default" v-tooltip.bottom="`${file.file.name}`">{{ file.file.name }}</div>
                                                <div class="text-sm whitespace-nowrap overflow-hidden">{{ formatSize(file.file.size) }}</div>
                                            </div>
                                            <div class="mb-2">
                                                <ProgressBar v-if="file.status === FileStatus.Uploading" :value="file.percent" class="w-full"></ProgressBar>
                                                <Badge v-else :value="getFileStatus(file.status)" :severity="getSeverity(file.status)" class="w-full whitespace-nowrap" />
                                            </div>
                                            <Button :icon="file.status === FileStatus.Complete ? `pi pi-check` : `pi pi-times`" @click="removeFile(index)" outlined rounded :severity="getSeverity(file.status)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- fileDisplayBox 没选文件时 -->
            <div id="fileDisplayBox" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" class="border border-2 border-dashed rounded border-surface-200 dark:border-surface-700" v-if="vShowFiles.length == 0">
                <div class="p-21">
                    <div class="flex items-center justify-center flex-col">
                        <i @click="chooseFiles" class="pi pi-plus !border-4 !rounded-full !p-8 !text-6xl !text-muted-color hover:bg-primary-500 dark:hover:bg-surface-500 cursor-pointer" />
                        <p class="pt-5 text-surface-700">{{ t('page.upload.addfile_on_drag') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
:deep(.p-fileupload-advanced) {
    border: 0;
}

:deep(.p-fileupload-header) {
    padding: 0;
}
</style>
