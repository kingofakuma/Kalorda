<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { $dom } from '../../Util';
// const env = import.meta.env;
// const tikzJaxJsUrl = env.VITE_APP_BASE + '/tikz/tikzjax.js';
// const tikzJaxJsId = 'tikzjax';

// const loadTikZJax = () => {
//     if ($dom('#' + tikzJaxJsId)) {
//         return;
//     }
//     const script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.id = tikzJaxJsId;
//     script.src = tikzJaxJsUrl;
//     document.body.appendChild(script);
//     document.addEventListener('tikzjax-load-finished', postProcessSvg);
// };

// const unloadTikZJax = () => {
//     const script = $dom('#' + tikzJaxJsId);
//     if (script) {
//         script.remove();
//         document.removeEventListener('tikzjax-load-finished', postProcessSvg);
//     }
// };

// const postProcessSvg = (e: Event) => {
//     const containerElement = e.target as HTMLElement;
//     let svg = containerElement.outerHTML;
//     //判断是否是暗黑模式，不同项目需要修改暗黑样式名称app-dark
//     let isDrakMode = document.documentElement.classList.contains('app-dark');
//     if (isDrakMode) {
//         svg = colorSVGinDarkMode(svg);
//     }
//     containerElement.outerHTML = svg;
// };

// const colorSVGinDarkMode = (svg: string) => {
//     //判断是否是暗黑模式，不同项目需要修改暗黑样式名称app-dark--p-surface-950
//     // svg = svg.replaceAll(/("#000"|"black")/g, `"currentColor"`).replaceAll(/("#fff"|"white")/g, `"var(--primary-color)"`);
//     svg = svg.replaceAll(/("#000"|"black")/g, `"currentColor"`).replaceAll(/("#fff"|"white")/g, `"var(--p-surface-950)"`);
//     return svg;
// };

// 业务逻辑
const dialogRef: any = inject('dialogRef');
const data = dialogRef.value.data; // 接收传递的参数
const tikzId = data.id || ''; // 图形id 新增时为空，修改时不为空
const tikzLatex = ref(data.latex || ''); // 图形源码
const tikzCaption = ref(data.caption || ''); // 说明文字

const closeDialog = () => {
    dialogRef.value.close();
};
const submitDialog = () => {
    let latex = tikzLatexFilter(tikzLatex.value);
    let svg = $dom('#previewContainer').innerHTML;
    if (!latex || latex.length == 0 || !svg || svg.length == 0 || svg.indexOf('<svg') == -1) {
        dialogRef.value.close();
    } else {
        let result_data = { id: tikzId, latex: tikzLatexFilter(tikzLatex.value), svg: svg, caption: tikzCaption.value };
        dialogRef.value.close(result_data);
    }
};

const packages = ref([
    { name: 'tikz', code: 'tikz' },
    { name: 'tikz-cd', code: 'tikz-cd' },
    { name: 'tikz-3dplot', code: 'tikz-3dplot' },
    { name: 'circuitikz', code: 'circuitikz' },
    { name: 'chemfig', code: 'chemfig' },
    { name: 'pgfplots', code: 'pgfplots' },
    { name: 'array', code: 'array' },
    { name: 'amsmath', code: 'amsmath' },
    { name: 'amsfonts', code: 'amsfonts' },
    { name: 'amssymb', code: 'amssymb' }
]);
const selectedPackages = ref([packages.value[0].code]);

const selectPackage = (packageName: string) => {
    let index = selectedPackages.value.indexOf(packageName);
    if (index == -1) {
        selectedPackages.value.push(packageName);
    } else {
        selectedPackages.value.splice(index, 1);
    }
};

const reset = () => {
    selectedPackages.value = [packages.value[0].code];
    tikzLatex.value = '';
    $dom('#previewContainer').innerHTML = '';
};

const clean = () => {
    tikzLatex.value = '';
    $dom('#previewContainer').innerHTML = '';
};

const paste = () => {
    if (!navigator.clipboard) {
        return alert('浏览器不支持复制');
    }
    navigator.clipboard.readText().then((text) => {
        tikzLatex.value = text;
        onChange();
    });
};

const demo = (idx: number) => {
    let data = [
        `\\begin{tikzpicture}
    \\draw (2,1.5)coordinate (A)node[above] {$A$} %定义点A并标注A
    --node[above left,sloped] {$c$}%给线标注c
    (0,0)coordinate (B)node[left] {$B$}
    --node[below]{$a$}
    (2.5,0)coordinate (C)node[right]{$C$}
    --node[right]{$b$}
    cycle;
    \\end{tikzpicture}`,
        `\\usetikzlibrary{decorations.pathmorphing}
    \\begin{tikzpicture}[line width=0.2mm,scale=1.0545]\\small
    \\tikzset{>=stealth}
    \\tikzset{snake it/.style={->,semithick,
    decoration={snake,amplitude=.3mm,segment length=2.5mm,post length=0.9mm},decorate}}
    \\def\\h{3}
    \\def\\d{0.2}
    \\def\\ww{1.4}
    \\def\\w{1+\\ww}
    \\def\\p{1.5}
    \\def\\r{0.7}
    \\coordinate[label=below:$A_1$] (A1) at (\\ww,\\p);
    \\coordinate[label=above:$B_1$] (B1) at (\\ww,\\p+\\h);
    \\coordinate[label=below:$A_2$] (A2) at (\\w,\\p);
    \\coordinate[label=above:$B_2$] (B2) at (\\w,\\p+\\h);
    \\coordinate[label=left:$C$] (C1) at (0,0);
    \\coordinate[label=left:$D$] (D) at (0,\\h);
    \\draw[fill=blue!14](A2)--(B2)-- ++(\\d,0)-- ++(0,-\\h)--cycle;
    \\draw[gray,thin](C1)-- +(\\w+\\d,0);
    \\draw[dashed,gray,fill=blue!5](A1)-- (B1)-- ++(\\d,0)-- ++(0,-\\h)-- cycle;
    \\draw[dashed,line width=0.14mm](A1)--(C1)--(D)--(B1);
    \\draw[snake it](C1)--(A2) node[pos=0.6,below] {$c\\Delta t$};
    \\draw[->,semithick](\\ww,\\p+0.44*\\h)-- +(\\w-\\ww,0) node[pos=0.6,above] {$v\\Delta t$};
    \\draw[snake it](D)--(B2);
    \\draw[thin](\\r,0) arc (0:atan2(\\p,\\w):\\r) node[midway,right,yshift=0.06cm] {$\\theta$};
    \\draw[opacity=0](-0.40,-0.14)-- ++(0,5.06);
    \\end{tikzpicture}`,
        `\\begin{tikzpicture}[domain=0:4]
    \\draw[very thin,color=gray] (-0.1,-1.1) grid (3.9,3.9);
    \\draw[->] (-0.2,0) -- (4.2,0) node[right] {$x$};
    \\draw[->] (0,-1.2) -- (0,4.2) node[above] {$f(x)$};
    \\draw[color=red]    plot (\\x,\\x)             node[right] {$f(x) =x$};
    % \\x r 表示弧度
    \\draw[color=blue]   plot (\\x,{sin(\\x r)})    node[right] {$f(x) = \\sin x$};
    \\draw[color=orange] plot (\\x,{0.05*exp(\\x)}) node[right] {$f(x) = \\frac{1}{20} \\mathrm e^x$};
    \\end{tikzpicture}`,
        `\\begin{tikzpicture}
    [every node/.style={fill=blue!30,draw=blue!70,rounded corners},
     edge from parent/.style={blue,thick,draw}]
    \\node {root}
    child {node {a1}}
    child {node {a2}
    child {node {b1}}
    child {node {b2}}}
    child {node {a3}};
    \\end{tikzpicture}`
    ];

    tikzLatex.value = data[idx];
    onChange();
};

watch(
    () => selectedPackages.value,
    (newValue, oldValue) => {
        if (newValue === oldValue) return;
        onChange();
    }
);

const tikzLatexFilter = (latex: string) => {
    if (!latex || latex.length == 0) {
        return '';
    }
    latex = latex.replace(/\\usepackage{[\\s\\S]*?}/gi, '');
    latex = latex.replace(/\\begin{document}/gi, '').replace(/\\end{document}/gi, '');
    return latex;
};

const onChange = async () => {
    // 过滤掉\usepackage{}和\begin{document}
    let latex = tikzLatexFilter(tikzLatex.value);
    if (!latex || latex.length == 0) {
        $dom('#previewContainer').innerHTML = '';
        return;
    }
    if (latex.indexOf('\\begin{tikzcd}') > -1) {
        selectedPackages.value.push('tikz-cd');
    }
    if (latex.indexOf('\\begin{circuitikz}') > -1) {
        selectedPackages.value.push('circuitikz');
    }
    if (latex.indexOf('\\chemfig') > -1) {
        selectedPackages.value.push('chemfig');
    }
    if (latex.indexOf('\\addplot3') > -1) {
        selectedPackages.value.push('pgfplots');
    }
    let tikzDocument = '';
    for (let i = 0; i < selectedPackages.value.length; i++) {
        tikzDocument += `\\usepackage{${selectedPackages.value[i]}}`;
    }
    tikzDocument += `\\begin{document}${latex}\\end{document}`;
    selectedPackages.value.push('tikz'); // 第一个界面上始终显示加入
    $dom('#previewContainer').innerHTML = `<script type='text/tikz'>${tikzDocument}<\/script>`; // data-show-console='true'
};

onMounted(() => {
    //loadTikZJax();
    if (data.svg && data.svg.length > 0) {
        $dom('#previewContainer').innerHTML = data.svg;
    }
});

onUnmounted(() => {
    reset();
    //unloadTikZJax();
});
</script>
<template>
    <div class="w-full">
        <div class="flex justify-between items-center mb-1">
            <div>{{ t('quill.tikzpackages') }}</div>
            <div><Button :label="t('quill.tikzreset')" severity="info" rounded size="small" @click="reset" /></div>
        </div>
        <div class="grid grid-cols-20 gap-2">
            <div v-for="item of packages" :key="item.code" class="col-span-32 sm:col-span-6 lg:col-span-4">
                <div class="rounded-sm border border-1 border-gray-500 h-[30px] flex items-center pl-2">
                    <Checkbox v-model="selectedPackages" name="package" :value="item.code" class="mr-1" />
                    <span @click="selectPackage(item.code)" class="cursor-pointer">{{ item.name }}</span>
                </div>
            </div>
        </div>

        <div class="flex justify-between items-center mt-3 mb-3">
            <div class="w-[49%] min-w-2xs flex justify-between gap-2">
                <div>{{ t('quill.tikzcode') }}</div>
                <div class="flex gap-2 select-none text-gray-500">
                    <div>
                        <a href="javascript:void(0)" @click="demo(0)">{{ t('quill.demotikz', [1]) }}</a>
                    </div>
                    <div>
                        <a href="javascript:void(0)" @click="demo(1)">{{ t('quill.demotikz', [2]) }}</a>
                    </div>
                    <div>
                        <a href="javascript:void(0)" @click="demo(2)">{{ t('quill.demotikz', [3]) }}</a>
                    </div>
                    <div>
                        <a href="javascript:void(0)" @click="demo(3)">{{ t('quill.demotikz', [4]) }}</a>
                    </div>
                </div>
            </div>
            <div>{{ t('quill.tikzpreview') }}</div>
        </div>

        <div class="flex justify-between gap-2 mb-2">
            <div class="w-[50%]">
                <div class="w-full border border-1 border border-gray-300 rounded-md pt-2 pb-2">
                    <div class="flex justify-between items-center">
                        <div class="ml-4 font-bold" style="color: var(--primary-color)">\begin{document}</div>
                        <div class="mr-4 flex gap-2 text-gray-500 select-none">
                            <div>
                                <a href="javascript:void(0)" @click="paste"><i class="pi pi-arrow-circle-down"></i> {{ t('quill.tikzpaste') }}</a>
                            </div>
                            <div>
                                <a href="javascript:void(0)" @click="clean"><i class="pi pi-trash"></i> {{ t('quill.tikzempty') }}</a>
                            </div>
                        </div>
                    </div>
                    <textarea v-model="tikzLatex" @change="onChange" class="m-2 mb-1 text-sm w-[96%] h-[220px] border-2 border-dashed border-gray-500 text-gray-600 dark:text-gray-400 rounded-lg resize-none p-2" />
                    <div class="ml-4 font-bold" style="color: var(--primary-color)">\end{document}</div>
                </div>
            </div>
            <div class="w-[50%]">
                <div class="w-full h-[283px] border border-1 rounded-md flex items-center justify-center border border-gray-300 overflow-auto">
                    <div id="previewContainer" class="rounded-md w-full h-full flex items-center justify-center"></div>
                </div>
            </div>
        </div>
        <Divider style="margin: 0px" />
        <div class="flex gap-4 justify-center m-2 mt-5">
            <Button label="取消" severity="secondary" @click="closeDialog"></Button>
            <Button label="确定" @click="submitDialog"></Button>
        </div>
    </div>
</template>

<style scoped></style>
