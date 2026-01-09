<script setup lang="ts">
// import { ref } from 'vue';
import useRouter from '@/router';
import { languages, getLanguage, setLanguage } from '@/assets/lang/language';
const options = ref(languages);
const selected = ref(getLanguage());
const onChange = (option: any) => {
    if (option.value) {
        setLanguage(option.value);
        useRouter.go(0);
        // window.location.reload();
    }
};
//转成base64编码的图片url
const placeholderUrl = new URL('../assets/lang/resource/flag_placeholder.png', import.meta.url).href;
</script>

<template>
    <div
        class="config-panel hidden absolute top-[3.25rem] right-0 w-40 p-1 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]"
    >
        <div class="dontSelect">
            <Listbox v-model="selected" :options="options" optionLabel="name" @change="onChange" style="border: 0">
                <template #option="slotProps">
                    <div class="flex items-center">
                        <img :alt="slotProps.option.name" :src="placeholderUrl" :class="`lang lang-${slotProps.option.code}`" style="width: 18px" />
                        <!-- <i :class="`${slotProps.option.icon}`" style="width: 14px; margin-right: 5px"></i> -->
                        <div style="white-space: nowrap">
                            {{ slotProps.option.name }}<span v-if="slotProps.selected"><i class="pi pi-check" style="margin-left: 1rem; font-size: 0.75rem; font-weight: bold"></i></span>
                        </div>
                    </div>
                </template>
            </Listbox>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dontSelect {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.lang {
    background: url('../assets/lang/resource/flags_responsive.png') no-repeat;
    background-size: 100%;
    vertical-align: middle;
    margin-right: 0.5rem;
}

.lang-zh_CN {
    background-position: 0 19.008264%;
}

.lang-en_US {
    background-position: 0 93.38843%;
}
</style>
