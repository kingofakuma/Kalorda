<script setup lang="ts">
import Editor from './Quillbase.vue';
import { useDialog } from 'primevue/usedialog';
import { $dom } from './Util';

import Quill from 'quill';

import katex from 'katex';
import 'katex/dist/katex.min.css';

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
// import 'quill/dist/quill.bubble.css';
import DividerBlot from './blot/DividerBlot';
import DoubleUnderlineBlot from './blot/DoubleUnderlineBlot';
import WavyUnderlineBlot from './blot/WavyUnderlineBlot';
import DashedUnderlineBlot from './blot/DashedUnderlineBlot';
import DotUnderlineBlot from './blot/DotUnderlineBlot';
import NormalUnderlineBlot from './blot/NormalUnderlineBlot';
import HatchingLineBlot from './blot/HatchingLineBlot';
import MathFieldBlot from './blot/MathFieldBlot';
import TikZJaxBlot from './blot/TikZJaxBlot';
import IllustrationBlot from './blot/IllustrationBlot';
import QuillTableBetter from 'quill-table-better';
import 'quill/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

Quill.register('formats/divider', DividerBlot, true);
Quill.register('formats/doubleunderline', DoubleUnderlineBlot, true);
Quill.register('formats/wavyunderline', WavyUnderlineBlot, true);
Quill.register('formats/dashedunderline', DashedUnderlineBlot, true);
Quill.register('formats/dotunderline', DotUnderlineBlot, true);
Quill.register('formats/normalunderline', NormalUnderlineBlot, true);
Quill.register('formats/hatchingline', HatchingLineBlot, true);
Quill.register('formats/mathfield', MathFieldBlot, true);
Quill.register('formats/tikzjax', TikZJaxBlot, true);
Quill.register('formats/illustration', IllustrationBlot, true);
Quill.register('modules/table-better', QuillTableBetter, true); // 注册表格插件

window.katex = katex;

const editorInstance = ref(); // 编辑器实例
const Delta = Quill.import('delta');

const handlers = {
    divider: function () {
        const quill = editorInstance.value.quill;
        const range = quill.getSelection(true);
        quill.insertText(range.index, '\n', Quill.sources.USER);
        quill.insertEmbed(range.index + 1, 'divider', true, Quill.sources.USER);
        quill.setSelection(range.index + 2, Quill.sources.SILENT);
    }
};

// 接收父组件传递的参数
const props = defineProps({
    // 编辑器输出的markdown-html
    editorOutput: {
        type: String,
        require: true,
        default: ''
    },
    // 编辑器编辑区显示用的纯html源码
    editorValue: {
        type: String,
        require: true,
        default: ''
    },
    toolbarHeight: {
        type: Number,
        require: true,
        default: 40
    },
    editorHeight: {
        type: Number,
        require: true,
        default: 500
    },
    // 从父组件传递过来的截图（截图）信息
    illusValue: {
        type: Object,
        require: false,
        default: { src: '', position: '' }
    }
});

// const editorOutput = ref(props.editorOutput); //markdown-html
const editorValue = ref(props.editorValue); //编辑器编辑区显示用的纯html源码
const illusValue = ref(props.illusValue); //上级页面传过来的截图信息，包含图片地址和截图位置信息src position
const emit = defineEmits(['update:editorOutput', 'editorOutputChanged']);

//撤销
const undo = () => {
    editorInstance.value.quill.history.undo();
};

//反撤销
const redo = () => {
    editorInstance.value.quill.history.redo();
};

//全选
const selectAll = () => {
    editorInstance.value.quill.setSelection(0, editorInstance.value.quill.getText().length);
};

//剪切
const cut = () => {
    const quill = editorInstance.value.quill;
    const range = quill.getSelection();
    if (range) {
        const length = range.length || range.end - range.start;
        const text = quill.getText(range.index, length);
        // 删除选区中的文本
        quill.deleteText(range.index, length, 'api');
        // 可选：将文本存储到剪贴板（例如使用Clipboard API）
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log('Text copied to clipboard', text);
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    }
};

import symbolSelector from './plugin/symbol/main.vue';
import emojiSelector from './plugin/emoji/main.vue';
import mathliveEditor from './plugin/formula/mathlive/main.vue';
import tikZJaxEditor from './plugin/tikzjax/main.vue';
const dialog = useDialog(); // 公式、插图、表格插入操作弹窗

// 特殊符号
const symbolSelect = (e: MouseEvent) => {
    e;
    dialog.open(symbolSelector, {
        data: {},
        props: {
            header: t('quill.toolbar.specialchar'),
            style: {
                width: '50vw'
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            modal: true
        },
        onClose: (options) => {
            const data = options?.data;
            if (data) {
                const quill = editorInstance.value.quill;
                const range = quill.getSelection(true);
                quill.insertText(range.index, data, Quill.sources.USER);
                quill.setSelection(range.index + data.length, Quill.sources.SILENT);
            }
        }
    });
};

// emoji
const emojiSelect = (e: MouseEvent) => {
    e;
    dialog.open(emojiSelector, {
        data: {},
        props: {
            header: t('quill.toolbar.emojichar'),
            style: {
                width: '50vw'
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            modal: true
        },
        onClose: (options) => {
            const data = options?.data;
            if (data) {
                const quill = editorInstance.value.quill;
                const range = quill.getSelection(true);
                quill.insertText(range.index, data, Quill.sources.USER);
                quill.setSelection(range.index + data.length, Quill.sources.SILENT);
            }
        }
    });
};

// 公式编辑
const formulaEdit = (formulaId: string, formula: string) => {
    if (!formula) {
        formulaId = '';
        formula = '';

        if (currentFormula && currentFormulaId) {
            formulaId = currentFormulaId;
            formula = currentFormula;
        }
    }

    // 保存当前选区，避免对话框打开后选区丢失
    const savedRange = editorInstance.value.quill.getSelection(true);

    dialog.open(mathliveEditor, {
        data: { formulaId: formulaId, formula: formula },
        props: {
            header: formulaId ? t('quill.editformula') : t('quill.addnewformula'),
            style: {
                width: '50vw'
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            modal: true
        },
        onClose: (options) => {
            resetCurrentFormula();
            const data = options?.data;
            if (data) {
                let formula = data.formula;
                let formulaId = data.formulaId;
                if (!formula) return;
                const quill = editorInstance.value.quill;
                // 使用保存的选区，避免对话框打开后选区丢失
                const range = savedRange || quill.getSelection(true);
                let deleteCount = 0;
                let contentData;

                try {
                    contentData = quill.getContents(range.index, 1).ops[0].insert;
                    if (typeof contentData !== 'string' && contentData.mathfield && formulaId === contentData.mathfield.formulaId) {
                        deleteCount += 1;
                    }
                } catch (error) {
                    // 容错处理：如果获取内容失败，默认为插入模式
                    contentData = '';
                }

                if (!formulaId) {
                    formulaId = `mathfield-${Date.now()}`;
                }
                const delta = new Delta()
                    .retain(range.index)
                    .delete(Math.max(deleteCount, range.length))
                    .insert({ mathfield: { formula: formula, formulaId: formulaId } });
                quill.updateContents(delta, Quill.sources.USER);
                quill.setSelection(range.index + 1, Quill.sources.SILENT);
                // 选中高亮效果
                let element = $dom('#' + formulaId);
                element.style.background = getHighlightColor();
                let t = setTimeout(() => {
                    element.style.background = 'transparent';
                    clearTimeout(t);
                }, 500);
            }
        }
    });
};

// tikzjax simple edit and preview
const tikZJaxEdit = (data?: any) => {
    if (!data) {
        data = { id: '', latex: '', svg: '', caption: '' };
        if (currentTikzJax && currentTikzJax.id) {
            data = currentTikzJax;
        }
    }

    // 保存当前选区，避免对话框打开后选区丢失
    const savedRange = editorInstance.value.quill.getSelection(true);

    dialog.open(tikZJaxEditor, {
        data: data,
        props: {
            header: data.id ? t('quill.edittikz') : t('quill.addnewtikz'),
            style: {
                width: '50vw'
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            modal: true
        },
        onClose: (options) => {
            const data = options?.data;
            if (data) {
                let id = data.id;
                let latex = data.latex;
                let svg = data.svg;
                let caption = data.caption || '';
                if (!latex || !svg) return;
                const quill = editorInstance.value.quill;
                // 使用保存的选区，避免对话框打开后选区丢失
                const range = savedRange || quill.getSelection(true);
                let deleteCount = 0;
                let contentData;

                try {
                    contentData = quill.getContents(range.index, 1).ops[0].insert;
                    if (typeof contentData !== 'string' && contentData.tikzjax && id === contentData.tikzjax.id) {
                        deleteCount += 1;
                    }
                } catch (error) {
                    // 容错处理：如果获取内容失败，默认为插入模式
                    contentData = '';
                }

                if (!id) {
                    id = `tikzjax-${Date.now()}`;
                }
                const delta = new Delta()
                    .retain(range.index)
                    .delete(Math.max(deleteCount, range.length))
                    .insert({ tikzjax: { id: id, latex: encodeURIComponent(latex), svg: encodeURIComponent(svg), caption: encodeURIComponent(caption) } }); //encodeURIComponent编码避免特殊字符产生的问题
                quill.updateContents(delta, Quill.sources.USER);
                quill.setSelection(range.index + 1, Quill.sources.SILENT);
                // 选中高亮效果
                let element = $dom('#' + id);
                element.style.background = getHighlightColor();
                let t = setTimeout(() => {
                    element.style.background = 'transparent';
                    clearTimeout(t);
                }, 500);
            }
        }
    });
};

// 添加插图（截图）
const illusAdd = () => {
    if (illusValue.value && illusValue.value.src && illusValue.value.position) {
        const id = `illus-${Date.now()}`;
        const quill = editorInstance.value.quill;
        // 保存当前选区，避免选区丢失
        const range = quill.getSelection(true);
        const delta = new Delta()
            .retain(range.index)
            .delete(range.length)
            .insert({ illustrate: { id: id, src: illusValue.value.src, position: illusValue.value.position, caption: '' } });
        quill.updateContents(delta, Quill.sources.USER);
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
        // 选中高亮效果
        // let element = $dom('#' + id);
        // element.style.background = getHighlightColor();
        // element.style.opacity = '0.5';
        addBlotNodeMask(id);
        let t = setTimeout(() => {
            // element.style.background = 'transparent';
            // element.style.opacity = '1';
            delBlotNodeMask(id);
            clearTimeout(t);
        }, 500);

        illusValue.value = { src: '', position: '' }; // 重置
    } else {
        alert(t('quill.noexistillus'));
    }
};
console.log(illusAdd);

let currentFormulaId = ''; // 当前选中的公式id
let currentFormula = '';
let currentTikzJax: any = { id: '', latex: '', svg: '', caption: '' }; // 当前选中的tikz图形id
let currentIllustration: any = { id: '', src: '', position: '', caption: '' }; // 当前选中的插图id

const resetCurrentFormula = () => {
    if (currentFormulaId) {
        // 当前选中的公式选中效果取消
        let id = currentFormulaId;
        if ($dom(`#${id}`)) {
            $dom(`#${id}`).style.background = 'transparent';
        }
    }

    currentFormulaId = '';
    currentFormula = '';
    $dom('button.ql-math-field-btn').classList.remove('ql-active');
};

const resetCurrentTikzJax = () => {
    if (currentTikzJax.id) {
        // 当前选中的tikz图形选中效果取消
        let id = currentTikzJax.id;
        if ($dom(`#${id}`)) {
            $dom(`#${id}`).style.background = 'transparent';
        }
    }

    currentTikzJax = { id: '', latex: '', svg: '', caption: '' };
    $dom('button.ql-tikzjax-btn').classList.remove('ql-active');
};

const resetCurrentIllustration = () => {
    if (currentIllustration.id) {
        // 当前选中的tikz图形选中效果取消
        let id = currentIllustration.id;
        if ($dom(`#${id}`)) {
            delBlotNodeMask(id);
        }
    }
    currentIllustration = { id: '', src: '', position: '', caption: '' };
    // $dom('button.ql-illustrate-btn').classList.remove('ql-active');
};

const editorClickEvent = (e: MouseEvent) => {
    // e.stopPropagation();

    // 获取事件路径，用于检查点击目标
    const path = e.composedPath() as HTMLElement[];

    // 检查点击事件是否来自表格菜单，若是则不重置当前选中状态
    let isTableMenuClick = false;
    // 检查是否点击了表格单元格
    let isTableCellClick = false;

    if (path && path.length > 0) {
        // 检查是否点击了表格菜单相关元素
        isTableMenuClick = path.some((node) => {
            return node.classList && (node.classList.contains('ql-table-better') || node.classList.contains('ql-table-menu'));
        });

        // 检查是否点击了表格单元格
        isTableCellClick = path.some((node) => {
            return node.tagName && (node.tagName.toUpperCase() === 'TD' || node.tagName.toUpperCase() === 'TH');
        });
    }

    // 如果不是点击表格菜单，或者是点击了表格单元格，则重置当前选中状态
    if (!isTableMenuClick || isTableCellClick) {
        resetCurrentFormula();
        resetCurrentTikzJax();
        resetCurrentIllustration();
    }

    if (!editorInstance.value.quill.isEnabled()) return;
    if (!path || path.length <= 0) return;

    const mathFieldNode = path.find((node) => node.tagName && node.tagName.toUpperCase() === MathFieldBlot.tagName.toUpperCase() && node.classList.contains(MathFieldBlot.className));
    const mathFieldBlot = Quill.find(mathFieldNode as HTMLElement) as MathFieldBlot | null;
    if (mathFieldBlot) {
        const { formulaId, formula } = MathFieldBlot.value(mathFieldBlot.domNode);
        if (formulaId && formula) {
            console.log('当前选了公式');
            currentFormulaId = formulaId;
            currentFormula = formula;

            // TODO: 设置quill的range
            const quill = editorInstance.value.quill;
            const index = quill.getIndex(mathFieldBlot); // 获取元素在 Quill 文档中的索引
            quill.setSelection(index, 1, Quill.sources.SILENT); // 设置选区

            // toolbar button
            $dom('button.ql-math-field-btn').classList.add('ql-active');
            // 改样式为选中效果
            $dom(`#${formulaId}`).style.background = getHighlightColor();
        }
    }

    const tikzJaxNode = path.find((node) => node.tagName && node.tagName.toUpperCase() === TikZJaxBlot.tagName.toUpperCase() && node.classList.contains(TikZJaxBlot.className));
    const tikzJaxBlot = Quill.find(tikzJaxNode as HTMLElement) as TikZJaxBlot | null;
    if (tikzJaxBlot) {
        const { id, latex, svg, caption } = TikZJaxBlot.value(tikzJaxBlot.domNode);
        if (id && latex) {
            currentTikzJax = { id: id, latex: latex, svg: svg, caption: caption };
            console.log('当前选了tikz图形', currentTikzJax);
            // TODO: 设置quill的range
            const quill = editorInstance.value.quill;
            const index = quill.getIndex(tikzJaxBlot); // 获取元素在 Quill 文档中的索引
            quill.setSelection(index, 1, Quill.sources.SILENT); // 设置选区

            // toolbar button
            $dom('button.ql-tikzjax-btn').classList.add('ql-active');
            // 改样式为选中效果
            $dom(`#${id}`).style.background = getHighlightColor();
        }
    }

    const illustrationNode = path.find((node) => node.tagName && node.tagName.toUpperCase() === IllustrationBlot.tagName.toUpperCase() && node.classList.contains(IllustrationBlot.className));
    const illustrationBlot = Quill.find(illustrationNode as HTMLElement) as IllustrationBlot | null;
    if (illustrationBlot) {
        const { id, src, position, caption } = IllustrationBlot.value(illustrationBlot.domNode);
        if (id && position) {
            console.log('当前选了截图插图');
            currentIllustration = { id: id, src: src, position: position, caption: caption };

            // TODO: 设置quill的range
            const quill = editorInstance.value.quill;
            const index = quill.getIndex(illustrationBlot); // 获取元素在 Quill 文档中的索引
            quill.setSelection(index, 1, Quill.sources.SILENT); // 设置选区

            // toolbar button
            // $dom('button.ql-tikzjax-btn').classList.add('ql-active');
            // 改样式为选中效果
            addBlotNodeMask(id);
        }
    }
};

const getHighlightColor = () => {
    return isDrakMode() ? '#3367D1' : 'yellow';
};

// 判断是否是暗黑模式，不同项目需要修改暗黑样式名称app-dark
const isDrakMode = () => {
    return document.documentElement.classList.contains('app-dark');
};

const addBlotNodeMask = (targetId: string) => {
    if ($dom(`#${targetId} .mask`)) {
        return;
    }
    let element = $dom(`#${targetId}`);
    element.style.position = 'relative';
    let mask = document.createElement('div');
    mask.style.position = 'absolute';
    mask.style.top = '0';
    mask.style.left = '0';
    mask.style.width = '100%';
    mask.style.height = '100%';
    mask.style.background = getHighlightColor();
    mask.style.opacity = '0.55';
    mask.style.zIndex = '10';
    mask.style.cursor = 'default';
    mask.className = 'mask';
    element.appendChild(mask);
};

const delBlotNodeMask = (targetId: string) => {
    let element = $dom(`#${targetId}`);
    let mask = $dom(`#${targetId} .mask`);
    if (mask) {
        element.removeChild(mask);
    }
};

const editorDblClickEvent = (e: MouseEvent) => {
    // e.stopPropagation();
    if (!editorInstance.value.quill.isEnabled()) return;
    const path = e.composedPath() as HTMLElement[];
    if (!path || path.length <= 0) return;

    const mathFieldNode = path.find((node) => node.tagName && node.tagName.toUpperCase() === MathFieldBlot.tagName.toUpperCase() && node.classList.contains(MathFieldBlot.className));
    const mathFieldBlot = Quill.find(mathFieldNode as HTMLElement) as MathFieldBlot | null;
    if (mathFieldBlot) {
        const { formulaId, formula } = MathFieldBlot.value(mathFieldBlot.domNode);
        if (formulaId && formula) {
            formulaEdit(formulaId, formula);
        }
    }

    const tikzJaxNode = path.find((node) => node.tagName && node.tagName.toUpperCase() === TikZJaxBlot.tagName.toUpperCase() && node.classList.contains(TikZJaxBlot.className));
    const tikzJaxBlot = Quill.find(tikzJaxNode as HTMLElement) as TikZJaxBlot | null;
    if (tikzJaxBlot) {
        const { id, latex, svg, caption } = TikZJaxBlot.value(tikzJaxBlot.domNode);
        if (id && latex) {
            tikZJaxEdit({ id: id, latex: latex, svg: svg, caption: caption });
        }
    }
};
const editorKeyDownEvent = (e: KeyboardEvent) => {
    if (!editorInstance.value.quill.isEnabled()) return;
    // const path = e.composedPath() as HTMLElement[];
    // if (!path || path.length <= 0) return;
    if (e.key) {
        const quill = editorInstance.value.quill;
        const range = quill.getSelection();

        // 当前需要有选中的公式或tikz图形
        let isFormulaSelected = currentFormulaId.length > 0 && currentFormula.length > 0;
        let isTikzJaxSelected = currentTikzJax.id.length > 0 && currentTikzJax.latex.length > 0;
        if (range && isFormulaSelected) {
            // const contentData = quill.getContents(range.index, 1).ops[0].insert;
            // let deleteCount = 0;
            // if (typeof contentData !== 'string' && contentData.mathfield) {
            //     deleteCount += 1;
            // }
            // const delta = new Delta().retain(range.index).delete(Math.max(deleteCount, range.length));
            // quill.updateContents(delta, Quill.sources.USER);
            // quill.setSelection(range.index + 1, Quill.sources.SILENT);
            resetCurrentFormula();
        }

        if (range && isTikzJaxSelected) {
            resetCurrentTikzJax();
        }
    }
};

// 编辑器内部滚动事件处理函数，阻止事件冒泡，避免菜单关闭
const editorScrollEvent = (e: Event) => {
    e.stopPropagation();
};

// 编辑器内部滚轮事件处理函数，阻止事件冒泡，避免菜单关闭
const editorWheelEvent = (e: Event) => {
    e.stopPropagation();
};

const editorBindEvent = () => {
    if (editorInstance.value && editorInstance.value.quill) {
        editorInstance.value.quill.root.addEventListener('click', editorClickEvent, true);
        editorInstance.value.quill.root.addEventListener('dblclick', editorDblClickEvent, true);
        editorInstance.value.quill.root.addEventListener('keydown', editorKeyDownEvent, true);

        // 监听编辑器内部滚动和滚轮事件，阻止事件冒泡，避免菜单关闭
        editorInstance.value.quill.root.addEventListener('scroll', editorScrollEvent, true);
        editorInstance.value.quill.root.addEventListener('wheel', editorWheelEvent, true);
    }
};
const editorUnbindEvent = () => {
    if (editorInstance.value && editorInstance.value.quill) {
        editorInstance.value.quill.root.removeEventListener('click', editorClickEvent, true);
        editorInstance.value.quill.root.removeEventListener('dblclick', editorDblClickEvent, true);
        editorInstance.value.quill.root.removeEventListener('keydown', editorKeyDownEvent, true);

        // 移除滚动和滚轮事件监听器
        editorInstance.value.quill.root.removeEventListener('scroll', editorScrollEvent, true);
        editorInstance.value.quill.root.removeEventListener('wheel', editorWheelEvent, true);
    }
};

// 父级页面传递给编辑器的数据变化监听
watch([() => props.editorOutput, () => props.editorValue], ([newValue1, newValue2], [oldValue1, oldValue2]) => {
    // console.log('editorOutput oldValue1', oldValue1, oldValue2);
    oldValue1;
    oldValue2;
    if (newValue1.length == 0 && newValue2.length == 0) {
        const quill = editorInstance.value.quill;
        quill.updateContents(new Delta().insert('')); // 清空编辑器内容
        // quill.setSelection(0, 0); // 光标定位到编辑器开头
        // quill.history.clear(); // 清空撤销重做历史记录
    } else {
        // editorValue.value = newValue2;
        setTimeout(() => {
            editorValue.value = newValue2;
        }, 0);
    }
});

// 父级页面传递的截图数据变化监听
watch(
    () => props.illusValue,
    (newValue, oldValue) => {
        if (newValue === oldValue) return;
        if (newValue.src && newValue.position) {
            illusValue.value = newValue;
        }
    }
);

const onEditorChange = (value: any) => {
    emit('update:editorOutput', value.htmlValue);
    emit('editorOutputChanged', value.htmlValue);
};

// 编辑器工具栏图标切换
const toolbarToggle = (number: number, show: boolean) => {
    const group: any = document.getElementById('group' + number);
    group.style.display = show ? '' : 'none';
    const group0: any = document.getElementById('group0');
    group0.style.display = show ? 'none' : '';
};

// 滚动条滚动时工具栏悬浮固定
const onScrollEvent = (e: any) => {
    e;
    let defaultMode = props.editorHeight == 500; // 高度500是父级页面中带图片列表的视图模式，高度700是父级页面中隐藏了图片列表的视图模式
    let startHeight = defaultMode ? 360 : 105; // 这个值依父级页面定的，根据实际需要调整
    // 只选择主工具栏，不影响table-better插件生成的菜单层
    let toolbar = $dom('.p-editor > .ql-toolbar');
    if (window.scrollY > startHeight) {
        toolbar.style.position = 'fixed';
        toolbar.style.top = '56px'; // 页面布局layout-header的高度
        toolbar.style.right = '57px';
        toolbar.style.zIndex = '100';
        toolbar.style.width = $dom('.p-editor').offsetWidth - 1 + 'px';
        toolbar.style.setProperty('border-radius', '0', 'important');
        $dom('.p-editor-content').style.marginTop = props.toolbarHeight + 'px';
    } else {
        toolbar.style.position = '';
        toolbar.style.width = '';
        if (defaultMode) {
            toolbar.style.setProperty('border-radius', '0', 'important');
        } else {
            toolbar.style.setProperty('border-radius', '0 6px 0 0', 'important');
        }
        $dom('.p-editor-content').style.marginTop = '0';
    }
};

// 监听编辑器滚动事件
let resizeObserver: any = null;
const editorWidth = ref('100%');
const editorFontSize = ref('14px');
onMounted(() => {
    //注册编辑器点击事件
    window.addEventListener('scroll', onScrollEvent);
    resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            // 只选择主工具栏，不影响table-better插件生成的菜单层
            let toolbar = $dom('.p-editor > .ql-toolbar');
            if (toolbar) {
                //  && toolbar.style.position === 'fixed'
                // 工具栏为fixed状态时更新toolbar的宽度=编辑器宽度
                toolbar.style.width = width + 'px';
                editorWidth.value = width + 'px';
                height;
            }
        }
    });
    resizeObserver.observe($dom('.p-editor'));

    // 编辑器初始化完成后再绑定事件
    setTimeout(() => {
        editorBindEvent();
    }, 500);
});

onUnmounted(() => {
    // 移除编辑器事件
    editorUnbindEvent();
    window.removeEventListener('scroll', onScrollEvent);
    if (resizeObserver && $dom('.p-editor')) {
        resizeObserver.unobserve($dom('.p-editor'));
        resizeObserver.disconnect();
    }
});
</script>

<template>
    <Editor
        ref="editorInstance"
        v-model="editorValue"
        :editorStyle="`font-family:'NSimSun','Noto Sans SC',sans-serif;height:${props.editorHeight}px;width:${editorWidth};font-size:${editorFontSize};`"
        :modules="{}"
        :handlers="handlers"
        @text-change="onEditorChange"
    >
        <template v-slot:toolbar>
            <span class="ql-formats" id="group0">
                <select class="ql-header" style="line-height: 2rem; margin-right: 5px">
                    <option value="1">{{ t('quill.toolbar.header.header1') }}</option>
                    <option value="2">{{ t('quill.toolbar.header.header2') }}</option>
                    <option value="3">{{ t('quill.toolbar.header.header3') }}</option>
                    <option selected>{{ t('quill.toolbar.header.normal') }}</option>
                </select>
                <button v-tooltip.bottom="t('quill.toolbar.paragraph')" class="iconfont icon-section-solid custombutton" @click="toolbarToggle(1, true)"></button>
                <button v-tooltip.bottom="t('quill.toolbar.text')" class="iconfont icon-a-solid custombutton" @click="toolbarToggle(2, true)"></button>
                <button v-tooltip.bottom="t('quill.toolbar.object')" class="iconfont icon-circle-nodes-solid custombutton" @click="toolbarToggle(3, true)"></button>
                <button v-tooltip.bottom="t('quill.toolbar.selectall')" class="iconfont icon-infinity-solid custombutton" style="margin-left: 10px; margin-right: 5px" @click="selectAll"></button>
                <button v-tooltip.bottom="t('quill.toolbar.cut')" class="iconfont icon-scissors-solid custombutton" @click="cut"></button>
                <button v-tooltip.bottom="t('quill.toolbar.undo')" class="iconfont icon-rotate-left-solid custombutton" @click="undo"></button>
                <button v-tooltip.bottom="t('quill.toolbar.redo')" class="iconfont icon-rotate-right-solid custombutton" @click="redo"></button>
                <div class="mt-1 inline-block h-[18px] overflow-hidden">
                    <button v-tooltip.bottom="t('quill.toolbar.cleanstyles')" class="ql-clean"></button>
                </div>
            </span>
            <span class="ql-formats" id="group1" style="display: none">
                <button v-tooltip.bottom="t('quill.toolbar.back')" class="iconfont icon-back custombutton" @click="toolbarToggle(1, false)"></button>
                <button v-tooltip.bottom="t('quill.toolbar.alignleft')" class="ql-align" value=""></button>
                <button v-tooltip.bottom="t('quill.toolbar.aligncenter')" class="ql-align" value="center"></button>
                <button v-tooltip.bottom="t('quill.toolbar.alignright')" class="ql-align" value="right"></button>
                <!-- <button v-tooltip.bottom="t('quill.toolbar.alignjustify')" class="ql-align" value="justify"></button> -->
                <button v-tooltip.bottom="t('quill.toolbar.indentincrease')" class="ql-indent" value="+1"></button>
                <button v-tooltip.bottom="t('quill.toolbar.indentdecrease')" class="ql-indent" value="-1"></button>
                <button v-tooltip.bottom="t('quill.toolbar.bulletlist')" class="ql-list" value="bullet"></button>
                <button v-tooltip.bottom="t('quill.toolbar.orderedlist')" class="ql-list" value="ordered"></button>
                <!-- <button v-tooltip.bottom="t('quill.toolbar.checklist')" class="ql-list" value="check"></button> -->
                <button v-tooltip.bottom="t('quill.toolbar.blockquote')" class="ql-blockquote"></button>
                <button v-tooltip.bottom="t('quill.toolbar.codeblock')" class="ql-code-block"></button>
                <div class="mt-1 inline-block h-[18px] overflow-hidden">
                    <button v-tooltip.bottom="t('quill.toolbar.cleanstyles')" class="ql-clean"></button>
                </div>
            </span>
            <span class="ql-formats" id="group2" style="display: none">
                <button v-tooltip.bottom="t('quill.toolbar.back')" class="iconfont icon-back custombutton" @click="toolbarToggle(2, false)"></button>
                <button v-tooltip.bottom="t('quill.toolbar.bold')" class="ql-bold"></button>
                <button v-tooltip.bottom="t('quill.toolbar.italic')" class="ql-italic"></button>
                <!-- <button v-tooltip.bottom="t('quill.toolbar.underline')" class="ql-underline"></button> -->
                <!-- ql-underline自带的不要了，改用ql-normal-underline -->
                <button v-tooltip.bottom="t('quill.toolbar.underline')" class="iconfont icon-underline-solid custombutton ql-normal-underline"></button>
                <button v-tooltip.bottom="t('quill.toolbar.doubleunderline')" class="iconfont icon-double-underline1 custombutton ql-double-underline"></button>
                <button v-tooltip.bottom="t('quill.toolbar.wavyunderline')" class="iconfont icon-wavy-underline custombutton ql-wavy-underline"></button>
                <button v-tooltip.bottom="t('quill.toolbar.dashedunderline')" class="iconfont icon-dashed-underline custombutton ql-dashed-underline"></button>
                <button v-tooltip.bottom="t('quill.toolbar.dotunderline')" class="iconfont icon-dot-underline custombutton ql-dot-underline"></button>
                <button v-tooltip.bottom="t('quill.toolbar.strikethrough')" class="ql-strike"></button>
                <button v-tooltip.bottom="t('quill.toolbar.hatchingline')" class="iconfont icon-mill-sign-solid custombutton ql-hatching-line"></button>
                <button v-tooltip.bottom="t('quill.toolbar.subscript')" class="ql-script" value="sub"></button>
                <button v-tooltip.bottom="t('quill.toolbar.superscript')" class="ql-script" value="super"></button>
                <button v-tooltip.bottom="t('quill.toolbar.pinyin')" class="iconfont icon-brands-opencart custombutton"></button>
                <div class="mt-1 inline-block h-[18px] overflow-hidden">
                    <button v-tooltip.bottom="t('quill.toolbar.cleanstyles')" class="ql-clean"></button>
                </div>
            </span>
            <span class="ql-formats" id="group3" style="display: none">
                <button v-tooltip.bottom="t('quill.toolbar.back')" class="iconfont icon-back custombutton" @click="toolbarToggle(3, false)"></button>
                <!-- <button v-tooltip.bottom="t('quill.toolbar.image')" class="ql-image"></button> -->
                <!-- <button v-tooltip.bottom="t('quill.toolbar.formula')" class="ql-formula"></button> -->
                <button v-tooltip.bottom="t('quill.toolbar.table.table')" class="ql-table-better iconfont icon-border-all-solid"></button>
                <!-- <button v-tooltip.bottom="t('quill.toolbar.table.table')" class="iconfont icon-border-all-solid custombutton ql-table-better"></button> -->
                <!-- 编辑器里显示插图的逻辑暂时取消 -->
                <!-- <button v-tooltip.bottom="t('quill.toolbar.illustration')" class="iconfont icon-object-group-regular custombutton" @click="illusAdd"></button> -->
                <button v-tooltip.bottom="t('quill.toolbar.formula')" class="iconfont icon-square-root-variable-solid custombutton ql-math-field-btn" @click="formulaEdit('', '')"></button>
                <button v-tooltip.bottom="t('quill.toolbar.tikz')" class="iconfont icon-star-of-david-solid custombutton ql-tikzjax-btn" @click="tikZJaxEdit()"></button>
                <button v-tooltip.bottom="t('quill.toolbar.musicscore')" class="iconfont icon-brands-itunes-note custombutton"></button>
                <button v-tooltip.bottom="t('quill.toolbar.chart')" class="iconfont icon-chart-simple-solid custombutton"></button>
                <button v-tooltip.bottom="t('quill.toolbar.specialchar')" class="iconfont icon-registered-regular custombutton" @click="symbolSelect"></button>
                <button v-tooltip.bottom="t('quill.toolbar.emojichar')" class="iconfont icon-face-smile-regular custombutton" @click="emojiSelect"></button>
                <button v-tooltip.bottom="t('quill.toolbar.splitline')" class="iconfont icon-minus-solid custombutton ql-divider"></button>
                <div class="mt-1 inline-block h-[18px] overflow-hidden">
                    <button v-tooltip.bottom="t('quill.toolbar.cleanstyles')" class="ql-clean"></button>
                </div>
            </span>
        </template>
    </Editor>
    <DynamicDialog />
</template>

<style scoped>
.custombutton {
}

.custombutton:hover {
    color: var(--p-surface-100);
    background-color: var(--editor-toolbar-background) !important;
    border-width: 0px !important;
}

:deep(.ql-editor) {
    scrollbar-width: thin;
}

:deep(.ql-math-field) {
    background: transparent;
    border: none;
    cursor: pointer;

    /* 保证公式双击事件能触发 */
    user-select: none;
    -webkit-user-select: none;
    /* Safari */
    -ms-user-select: none;
    /* IE 10 and IE 11 */

    /* 保证公式每次点击事件都能触发 */
    &::part(container) {
        pointer-events: none;
    }

    &::part(virtual-keyboard-toggle) {
        height: unset;
    }

    &.view::part(menu-toggle) {
        display: none;
    }
}

:deep(.ql-table-button-disabled) {
    background: none !important;
}

:deep(.ql-table-better svg) {
    display: none;
}
</style>
