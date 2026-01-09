<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { $dom } from '../../Util';
const dialogRef: any = inject('dialogRef');

let symbol1 =
    '、,。,·,ˉ,ˇ,¨,〃,々,—,～,‖,…,‘,’,“,”,〔,〕,〈,〉,《,》,「,」,『,』,〖,〗,【,】,±,×,÷,∶,∧,∨,∑,∏,∪,∩,∈,∷,√,⊥,∥,∠,⌒,⊙,∫,∮,≡,≌,≈,∽,∝,≠,≮,≯,≤,≥,∞,∵,∴,♂,♀,°,′,″,℃,＄,¤,￠,￡,‰,§,№,☆,★,○,●,◎,◇,◆,□,■,△,▲,※,→,←,↑,↓,〓,〡,〢,〣,〤,〥,〦,〧,〨,〩,㊣,㎎,㎏,㎜,㎝,㎞,㎡,㏄,㏎,㏑,㏒,㏕,︰,￢,￤,℡,ˊ,ˋ,˙,–,―,‥,‵,℅,℉,↖,↗,↘,↙,∕,∟,∣,≒,≦,≧,⊿,═,║,╒,╓,╔,╕,╖,╗,╘,╙,╚,╛,╜,╝,╞,╟,╠,╡,╢,╣,╤,╥,╦,╧,╨,╩,╪,╫,╬,╭,╮,╯,╰,╱,╲,╳,▁,▂,▃,▄,▅,▆,▇,�,,█,▉,▊,▋,▌,▍,▎,▏,▓,▔,▕,▼,▽,◢,◣,◤,◥,☉,⊕,〒,〝,〞,®,©,¶';
let symbol2 = 'ⅰ,ⅱ,ⅲ,ⅳ,ⅴ,ⅵ,ⅶ,ⅷ,ⅸ,ⅹ,Ⅰ,Ⅱ,Ⅲ,Ⅳ,Ⅴ,Ⅵ,Ⅶ,Ⅷ,Ⅸ,Ⅹ,Ⅺ,Ⅻ';
let symbol3 = '⒈,⒉,⒊,⒋,⒌,⒍,⒎,⒏,⒐,⒑,⒒,⒓,⒔,⒕,⒖,⒗,⒘,⒙,⒚,⒛,⑴,⑵,⑶,⑷,⑸,⑹,⑺,⑻,⑼,⑽,⑾,⑿,⒀,⒁,⒂,⒃,⒄,⒅,⒆,⒇,①,②,③,④,⑤,⑥,⑦,⑧,⑨,⑩,㈠,㈡,㈢,㈣,㈤,㈥,㈦,㈧,㈨,㈩';
let symbol4 =
    'ぁ,あ,ぃ,い,ぅ,う,ぇ,え,ぉ,お,か,が,き,ぎ,く,ぐ,け,げ,こ,ご,さ,ざ,し,じ,す,ず,せ,ぜ,そ,ぞ,た,だ,ち,ぢ,っ,つ,づ,て,で,と,ど,な,に,ぬ,ね,の,は,ば,ぱ,ひ,び,ぴ,ふ,ぶ,ぷ,へ,べ,ぺ,ほ,ぼ,ぽ,ま,み,む,め,も,ゃ,や,ゅ,ゆ,ょ,よ,ら,り,る,れ,ろ,ゎ,わ,ゐ,ゑ,を,ん,ァ,ア,ィ,イ,ゥ,ウ,ェ,エ,ォ,オ,カ,ガ,キ,ギ,ク,グ,ケ,ゲ,コ,ゴ,サ,ザ,シ,ジ,ス,ズ,セ,ゼ,ソ,ゾ,タ,ダ,チ,ヂ,ッ,ツ,ヅ,テ,デ,ト,ド,ナ,ニ,ヌ,ネ,ノ,ハ,バ,パ,ヒ,ビ,ピ,フ,ブ,プ,ヘ,ベ,ペ,ホ,ボ,ポ,マ,ミ,ム,メ,モ,ャ,ヤ,ュ,ユ,ョ,ヨ,ラ,リ,ル,レ,ロ,ヮ,ワ,ヰ,ヱ,ヲ,ン,ヴ,ヵ,ヶ';
let symbol5 = 'Α,Β,Γ,Δ,Ε,Ζ,Η,Θ,Ι,Κ,Λ,Μ,Ν,Ξ,Ο,Π,Ρ,Σ,Τ,Υ,Φ,Χ,Ψ,Ω,α,β,γ,δ,ε,ζ,η,θ,ι,κ,λ,μ,ν,ξ,ο,π,ρ,σ,τ,υ,φ,χ,ψ,ω';
let symbol6 = 'А,Б,В,Г,Д,Е,Ё,Ж,З,И,Й,К,Л,М,Н,О,П,Р,С,Т,У,Ф,Х,Ц,Ч,Ш,Щ,Ъ,Ы,Ь,Э,Ю,Я,а,б,в,г,д,е,ё,ж,з,и,й,к,л,м,н,о,п,р,с,т,у,ф,х,ц,ч,ш,щ,ъ,ы,ь,э,ю,я';
let symbol7 = 'ā,á,ǎ,à,ē,é,ě,è,ī,í,ǐ,ì,ō,ó,ǒ,ò,ū,ú,ǔ,ù,ǖ,ǘ,ǚ,ǜ,ü';
let symbol8 = 'i:,i,e,æ,ʌ,ə:,ə,u:,u,ɔ:,ɔ,a:,ei,ai,ɔi,əu,au,iə,εə,uə,p,t,k,b,d,g,f,s,ʃ,θ,h,v,z,ʒ,ð,tʃ,tr,ts,dʒ,dr,dz,m,n,ŋ,l,r,w,j';
let symbol9 = 'ㄅ,ㄆ,ㄇ,ㄈ,ㄉ,ㄊ,ㄋ,ㄌ,ㄍ,ㄎ,ㄏ,ㄐ,ㄑ,ㄒ,ㄓ,ㄔ,ㄕ,ㄖ,ㄗ,ㄘ,ㄙ,ㄚ,ㄛ,ㄜ,ㄝ,ㄞ,ㄟ,ㄠ,ㄡ,ㄢ,ㄣ,ㄤ,ㄥ,ㄦ,ㄧ,ㄨ';

let symbolList = [
    { title: t('quill.specialchar'), content: symbol1.split(','), value: '1' },
    { title: t('quill.romanchar'), content: symbol2.split(','), value: '2' },
    { title: t('quill.mathchar'), content: symbol3.split(','), value: '3' },
    { title: t('quill.japanesechar'), content: symbol4.split(','), value: '4' },
    { title: t('quill.greekchar'), content: symbol5.split(','), value: '5' },
    { title: t('quill.russianchar'), content: symbol6.split(','), value: '6' },
    { title: t('quill.pinyinchar'), content: symbol7.split(','), value: '7' },
    { title: t('quill.englishchar'), content: symbol8.split(','), value: '8' },
    { title: t('quill.otherchar'), content: symbol9.split(','), value: '9' }
];

const tabs = ref(symbolList);

const closeDialog = () => {
    dialogRef.value.close();
};
const submitDialog = () => {
    let result_data = selectedSymbol.value.join('');
    dialogRef.value.close(result_data);
};

const selectedSymbol = ref<string[]>([]);
const selectSymbol = (symbol: string, id: string) => {
    let index = selectedSymbol.value.indexOf(symbol);
    let ele = $dom('#' + id);
    if (index == -1) {
        selectedSymbol.value.push(symbol);
        ele?.classList.add('selected');
    } else {
        selectedSymbol.value.splice(index, 1);
        ele?.classList.remove('selected');
    }
};

const selectSymbol2 = (symbol: string) => {
    selectedSymbol.value = [];
    selectedSymbol.value.push(symbol);
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
                                    @click="selectSymbol(item, `symbol-${tab.value}-${index2}`)"
                                    @dblclick="selectSymbol2(item)"
                                    :id="`symbol-${tab.value}-${index2}`"
                                    class="symbol text-3xl rounded-lg border border-1 border-gray-500 text-center h-[50px] flex items-center justify-center"
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

.symbol {
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
