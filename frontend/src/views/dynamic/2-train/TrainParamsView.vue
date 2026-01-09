<script setup lang="ts">
import { showToast } from '@/utils/GlobalUtil';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const train_types = [
    { name: t('page.trainparams.lora'), value: 'lora' },
    { name: t('page.trainparams.full'), value: 'full' },
    { name: t('page.trainparams.custom'), value: 'custom' }
];
const all_target_modules = [
    { name: 'q_proj', value: 'q_proj' },
    { name: 'v_proj', value: 'v_proj' },
    { name: 'k_proj', value: 'k_proj' },
    { name: 'o_proj', value: 'o_proj' },
    { name: 'gate_proj', value: 'gate_proj' },
    { name: 'up_proj', value: 'up_proj' },
    { name: 'down_proj', value: 'down_proj' }
];
const lora_ranks = [
    { name: '8', value: '8' },
    { name: '16', value: '16' },
    { name: '32', value: '32' },
    { name: '64', value: '64' }
];
const lora_alphas = [
    { name: '8', value: '8' },
    { name: '16', value: '16' },
    { name: '32', value: '32' },
    { name: '64', value: '64' }
];

const props = defineProps({
    training_run: {
        type: Object,
        default: () => ({})
    },
    new_model_name: {
        type: String,
        default: ''
    }
});

const model_name = ref(`${props.new_model_name}`);
const train_type = ref(train_types[0].name);
const is_lora_type = ref(true);
const is_custom_type = ref(false);
const custom_params = ref('');
const epoch = ref('5');
const learning_rate = ref('2e-5');
const batch_size = ref('1');
const lr_warmup_iters_ratio = ref('0.001');
const max_grad_norm = ref('1.0');
const split_dataset_ratio = ref('0');
const gradient_accumulation_steps = ref('2');
const weight_decay = ref('0.01');

const max_seq_len = ref('8192');
const target_modules = ref([...all_target_modules]);
const lora_rank = ref(lora_ranks[0]);
const lora_alpha = ref(lora_alphas[1]);

// 是否是LoRA微调
const onTrainTypeChange = (train_type: any) => {
    is_custom_type.value = train_type.value === train_types[2].name; // 自主设置参数
    is_lora_type.value = train_type.value === train_types[0].name; // LoRA微调
};

const getTrainParams = () => {
    let training_type = is_lora_type.value ? train_types[0].value : is_custom_type.value ? train_types[2].value : train_types[1].value;

    if (training_type == train_types[2].value) {
        if (!custom_params.value) {
            showToast('error', t('page.common.error'), t('page.trainparams.nocustomparams'), true);
            return null;
        }
    }
    let data = {
        model_name: model_name.value,
        training_type: training_type,
        custom_params: custom_params.value,
        num_epochs: epoch.value,
        learning_rate: learning_rate.value,
        batch_size: batch_size.value,
        lora_rank: lora_rank.value.value,
        lora_alpha: lora_alpha.value.value,
        target_modules: target_modules.value.map((item) => item.value),
        lr_warmup_iters_ratio: lr_warmup_iters_ratio.value,
        max_grad_norm: max_grad_norm.value,
        split_dataset_ratio: split_dataset_ratio.value,
        gradient_accumulation_steps: gradient_accumulation_steps.value,
        weight_decay: weight_decay.value,
        max_seq_len: max_seq_len.value
    };
    return data;
};

defineExpose({
    getTrainParams
});

// 小数转科学记数法，保留0位小数
const convertFloat2exp = (value: number) => {
    return value.toExponential(0);
};

const setTrainParams = () => {
    if (props.training_run && Object.keys(props.training_run).length > 0) {
        model_name.value = props.training_run.model_name || '';
        train_type.value = props.training_run.training_type === 'lora' ? train_types[0].name : props.training_run.training_type === 'custom' ? train_types[2].name : train_types[1].name;
        is_lora_type.value = props.training_run.training_type === 'lora';
        is_custom_type.value = props.training_run.training_type === 'custom';
        custom_params.value = props.training_run.custom_params || '';
        epoch.value = props.training_run.num_epochs;
        learning_rate.value = convertFloat2exp(props.training_run.learning_rate);
        batch_size.value = props.training_run.batch_size;
        lora_rank.value = lora_ranks.find((item) => item.value == props.training_run.lora_rank) || lora_ranks[0];
        lora_alpha.value = lora_alphas.find((item) => item.value == props.training_run.lora_alpha) || lora_alphas[1];
        if (props.training_run.target_modules && props.training_run.target_modules.length > 0) {
            target_modules.value = all_target_modules.filter((item) => props.training_run.target_modules.includes(item.value));
        }
        gradient_accumulation_steps.value = props.training_run.gradient_accumulation_steps;
        max_seq_len.value = props.training_run.max_seq_len;
        max_grad_norm.value = props.training_run.max_grad_norm;
        weight_decay.value = props.training_run.weight_decay;
        split_dataset_ratio.value = props.training_run.split_dataset_ratio;
        lr_warmup_iters_ratio.value = props.training_run.lr_warmup_iters_ratio;
    }
};

watch(
    () => props.training_run,
    (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
            setTrainParams();
        }
    }
);

onMounted(() => {
    setTrainParams();
});
</script>

<template>
    <div>
        <div class="flex items-center justify-between gap-10 w-full m-3 ml-0 mt-1">
            <div class="flex items-center gap-2 w-full">
                <div class="w-1/4">
                    <label for="model_name" class="block font-medium">{{ t('page.trainparams.modelname') }}：</label>
                </div>
                <div class="w-3/4">
                    <InputText type="text" id="model_name" name="model_name" v-model="model_name" class="mt-1 p-2 border border-gray-600 rounded-md w-full" maxLength="50" spellcheck="false" />
                </div>
            </div>
            <div class="flex items-center gap-2 w-full">
                <div class="w-1/4">
                    <label for="train_type" class="block font-medium">{{ t('page.trainparams.traintype') }}：</label>
                </div>
                <div class="w-3/4">
                    <SelectButton v-model="train_type" name="train_type" :options="train_types.map((item) => item.name)" class="w-full" fluid @change="onTrainTypeChange" />
                </div>
            </div>
        </div>

        <div class="w-full">
            <div class="w-full" v-if="is_custom_type">
                <div class="w-full pb-4">
                    <div class="w-full relative">
                        <div class="absolute bottom-9 right-8 text-surface-500 z-1" style="font-size: 13px">
                            {{ t('page.trainparams.customparams_note') }}
                        </div>
                        <div class="absolute bottom-3 right-8 text-surface-500 z-1 flex items-center justify-center gap-1" style="font-size: 13px">
                            <div class="pt-1">
                                <i class="pi pi-link"></i>
                            </div>
                            <div>
                                <div></div>
                                <a href="https://swift.readthedocs.io/en/latest/Instruction/Command-line-parameters.html" target="_blank">{{ t('page.trainparams.msswiftlink') }}</a>
                            </div>
                        </div>
                        <div>
                            <IftaLabel
                                ><label for="custom_params"><span style="font-size: 14px; font-weight: bold">swift sft --model [sys] --dataset [sys] --val_dataset [sys]</span></label>
                                <Textarea
                                    id="custom_params"
                                    name="custom_params"
                                    v-model="custom_params"
                                    class="border border-gray-600 rounded-md w-full text-surface-500"
                                    spellcheck="false"
                                    style="height: 300px; line-height: 20px; resize: none"
                                    placeholder="--train_type lora \
--num_train_epochs 3"
                                >
                                </Textarea>
                            </IftaLabel>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full" v-else>
                <div class="flex items-center justify-between gap-10 w-full m-3 ml-0">
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="epoch" class="block font-medium">num train epochs：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText type="text" id="epoch" name="epoch" v-model="epoch" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="target_modules" class="block font-medium">Target modules：</label>
                        </div>
                        <div class="w-3/4">
                            <MultiSelect
                                name="target_modules"
                                v-model="target_modules"
                                :options="all_target_modules"
                                optionLabel="name"
                                placeholder="Select Target Modules"
                                :maxSelectedLabels="2"
                                :show-toggle-all="false"
                                class="w-full"
                                fluid
                                :disabled="!is_lora_type"
                            />
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-10 w-full m-3 ml-0">
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="batch_size" class="block font-medium">Batch size：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText type="text" id="batch_size" name="batch_size" v-model="batch_size" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="lora_rank" class="block font-medium">Lora Rank：</label>
                        </div>
                        <div class="w-3/4">
                            <Select v-model="lora_rank" :options="lora_ranks" optionLabel="name" name="lora_rank" placeholder="Select Lora rank" fluid class="w-full" :disabled="!is_lora_type" />
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-10 w-full m-3 ml-0">
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="learning_rate" class="block font-medium">Learning rate：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText type="text" id="learning_rate" name="learning_rate" v-model="learning_rate" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="lora_alpha" class="block font-medium">Lora Alpha：</label>
                        </div>
                        <div class="w-3/4">
                            <Select v-model="lora_alpha" :options="lora_alphas" optionLabel="name" name="lora_alpha" placeholder="Select Lora alpha" fluid class="w-full" :disabled="!is_lora_type" />
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-10 w-full m-3 ml-0">
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="lr_warmup_iters_ratio" class="block font-medium">LR warmup iters ratio ：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText type="text" id="lr_warmup_iters_ratio" name="lr_warmup_iters_ratio" v-model="lr_warmup_iters_ratio" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="weight_decay" class="block font-medium">Weight decay：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText v-model="weight_decay" type="text" id="weight_decay" name="weight_decay" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-10 w-full m-3 ml-0">
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="max_seq_len" class="block font-medium">Max sequence length ：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText type="text" id="max_seq_len" name="max_seq_len" v-model="max_seq_len" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="split_dataset_ratio" class="block font-medium">Split dataset ratio：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText v-model="split_dataset_ratio" type="text" id="split_dataset_ratio" name="split_dataset_ratio" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-10 w-full m-3 ml-0">
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="gradient_accumulation_steps" class="block font-medium">Gradient accumulation steps：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText type="text" id="gradient_accumulation_steps" name="gradient_accumulation_steps" v-model="gradient_accumulation_steps" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2 w-full">
                        <div class="w-1/4">
                            <label for="max_grad_norm" class="block font-medium">Max grad norm：</label>
                        </div>
                        <div class="w-3/4">
                            <InputText type="text" id="max_grad_norm" name="max_grad_norm" v-model="max_grad_norm" class="mt-1 p-2 border border-gray-600 rounded-md w-full" spellcheck="false" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
