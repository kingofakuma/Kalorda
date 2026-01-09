<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import 'mathlive';
import type { MathfieldElement } from 'mathlive';
const config = { mathVirtualKeyboardPolicy: 'sandboxed' };
const dialogRef: any = inject('dialogRef');

let formulaId = ''; // 公式id，新增时为空，修改时不为空
const formula = ref(); // 公式内容

const handleChange = (e: Event) => {
    const mathfield = e.target as MathfieldElement;
    formula.value = mathfield.value;
};

const closeDialog = () => {
    dialogRef.value.close();
};
const submitDialog = () => {
    let result_data = { formulaId: formulaId, formula: formula.value };
    dialogRef.value.close(result_data);
};

onMounted(() => {
    // 接收传递的参数
    formulaId = dialogRef.value.data.formulaId;
    formula.value = dialogRef.value.data.formula;
});
</script>
<template>
    <div class="w-full">
        <div class="p-4 pt-2 pb-2 rounded-lg bg-gray-100 dark:bg-surface-800">
            <div class="flex">
                <div class="w-[35%] m-2 mb-3 text-gray-400 dark:text-gray-500 text-sm"></div>
                <div class="w-[30%] text-center m-2 mb-3 text-surface-500 dark:text-surface-300">{{ t('quill.mathfieldedit') }}</div>
                <div class="w-[35%]"></div>
            </div>
            <div class="h-[200px] border border-1 border-gray-300 rounded-lg">
                <math-field class="w-full h-full overflow-x-hidden overflow-y-auto text-xl rounded-lg bg-surface-100 dark:bg-surface-900 text-gray-900 dark:text-gray-400" @input="handleChange" :options="config" :value="formula"></math-field>
            </div>
            <div class="h-[200px] mt-1 mb-1" style="border-radius: 0 0 6px 6px">
                <div class="flex">
                    <div class="w-[35%] m-2 mb-3 text-gray-400 dark:text-gray-500 text-sm">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-arrow-down" style="font-size: 0.75rem"></i> <span>{{ t('quill.latexpastetip') }}</span>
                        </div>
                    </div>
                    <div class="w-[30%] text-center m-2 mb-3 text-surface-500 dark:text-surface-300">{{ t('quill.latexinput') }}</div>
                    <div class="w-[35%]"></div>
                </div>
                <div>
                    <textarea
                        v-model="formula"
                        rows="8"
                        class="w-full overflow-x-hidden overflow-y-auto border border-1 border-gray-300 rounded-lg bg-surface-100 dark:bg-surface-900 text-gray-900 dark:text-gray-400 p-2"
                        style="resize: none"
                        spellcheck="false"
                    />
                </div>
            </div>
        </div>

        <div class="flex gap-4 justify-center m-2 mt-5">
            <Button label="取消" severity="secondary" @click="closeDialog"></Button>
            <Button label="确定" @click="submitDialog"></Button>
        </div>
    </div>
</template>
<style scoped>
:global(.p-dialog-header) {
    padding-top: 1rem !important;
    padding-bottom: 0.5rem !important;
}

:global(.ML__keyboard) {
    z-index: 10000 !important;
}
</style>
