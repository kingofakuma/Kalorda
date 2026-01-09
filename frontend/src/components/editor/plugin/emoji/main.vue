<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { $dom } from '../../Util';
const dialogRef: any = inject('dialogRef');

let emoji1 = '😊,😄,😅,😆,😍,😢,😭,😔,😞,😣,😠,🤬,😡,👿,😲,😱,😯,😮,😏,🤔,🙄,😕';
let emoji2 = '🙍,🙎,🙋,🧏,🤦,🤷,🕵,🤴,🧕,🤵,👰,🤰,🤱,🤶,🦸,🦹,🧙,🧚,🧛,🧜,🧝,🧞,🧟,🧍,🧎,🕺,🕴,🧖,🧗,🤺,🏇,⛷,🏂,🏌,🚣,⛹,🏋,🚴,🚵,🤸,🤼,🤽,🤾,🤹,🧘,🛌,👭,👬,👪,🗣,👤,👥';
let emoji3 = '🐾,🦊,🐯,🦧,🐙,🦁,🙉,🐻,🐶,🐷,🐹,🧸,🦌,🎠,🐌,🦂,🎏,🐠,🐟,🐳,🐬,🎭,🐰,🐭,🐼,🐨,🐞,🐉,🦜,🦑,🐮,🐓,🦀,🦎,🦴,🐿';
let emoji4 = '🌵,🌳,🌴,🎋,🎍,🍀,☘,🌿,🌱,🍃,🌾,🎄,🌹,🥀,🍂,🍁,🌼,🏵,🌻,🌷,🌸,🌺,💐,💮,🏵,🍄,❁,❀,🏔';
let emoji5 = '💗,🖤,❤,🧡,💛,💚,💙,💜,💟,🤍,🤎,💔,❣,💞,💓,💖,💘,🎄,⭐,🌟,💫,✨,💌,🎀,🎉,💎,💍,❤‍🔥,👑,🧧,🎁,🎈,♥,🔖';
let emoji6 = '🌞,🌝,🔆,🔅,⭐,🌙,🌘,🌕,🌤,⛅,🌥,☁,🌧,🌩,⚡,⛄,☃,❄,☀,☔,🌂,🌈,💧,💦,🌡,❄,🌊,🌀,🌪,💨,☄,🌐,🌤,🌤,🌩,🌧,☄,🌪,🎗,🧊,🏖,🏄‍♂,🌬';
let emoji7 = '💯,💡,🔍,📅,📚,📖,📘,📗,📙,📒,📔,📓,💻,🖥,📲,📱,⌚,⏲,🧷,📏,🖋,🖌,🖍,✏,📨,📝,📜,📑,✉,🖌,🔗,🎓,📈,⏰,⚗,📟,📠,📣,🛍,🎊,🔓,⚠,⏸,🎯,✍︎';

let emojiList = [
    { title: t('quill.emoji1'), content: emoji1.split(','), value: '1' },
    { title: t('quill.emoji2'), content: emoji2.split(','), value: '2' },
    { title: t('quill.emoji3'), content: emoji3.split(','), value: '3' },
    { title: t('quill.emoji4'), content: emoji4.split(','), value: '4' },
    { title: t('quill.emoji5'), content: emoji5.split(','), value: '5' },
    { title: t('quill.emoji6'), content: emoji6.split(','), value: '6' },
    { title: t('quill.emoji7'), content: emoji7.split(','), value: '7' }
];

const tabs = ref(emojiList);

const closeDialog = () => {
    dialogRef.value.close();
};
const submitDialog = () => {
    let result_data = selectedemoji.value.join('');
    dialogRef.value.close(result_data);
};

const selectedemoji = ref<string[]>([]);
const selectemoji = (emoji: string, id: string) => {
    let index = selectedemoji.value.indexOf(emoji);
    let ele = $dom('#' + id);
    if (index == -1) {
        selectedemoji.value.push(emoji);
        ele?.classList.add('selected');
    } else {
        selectedemoji.value.splice(index, 1);
        ele?.classList.remove('selected');
    }
};

const selectemoji2 = (emoji: string) => {
    selectedemoji.value = [];
    selectedemoji.value.push(emoji);
    submitDialog();
};

onMounted(() => {});

onBeforeUnmount(() => {});
</script>

<template>
    <div class="mb-4 select-none">
        <Tabs value="1" scrollable>
            <TabList>
                <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
                    {{ tab.title }}
                </Tab>
            </TabList>
            <div class="h-[40vh] overflow-y-auto">
                <TabPanels>
                    <TabPanel v-for="tab in tabs" :key="tab.value" :value="tab.value">
                        <div class="grid grid-cols-40 gap-4">
                            <div v-for="(item, index2) of tab.content" :key="index2" class="col-span-32 sm:col-span-6 lg:col-span-4">
                                <div
                                    @click="selectemoji(item, `emoji-${tab.value}-${index2}`)"
                                    @dblclick="selectemoji2(item)"
                                    :id="`emoji-${tab.value}-${index2}`"
                                    class="emoji text-3xl rounded-lg border border-1 border-gray-500 text-center h-[50px] flex items-center justify-center"
                                >
                                    {{ item }}
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </div>
        </Tabs>
        <Divider style="margin: 0px" />
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

.emoji {
    cursor: pointer;
    &:hover {
        background-color: var(--editor-toolbar-background);
        color: var(--primary-color);
    }
}

.selected {
    background-color: var(--surface-ground);
    color: var(--primary-color);
}
</style>
