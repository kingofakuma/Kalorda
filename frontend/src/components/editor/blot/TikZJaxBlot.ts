// import Quill from 'quill';
import type { Root } from 'parchment';
import { EmbedBlot } from 'parchment';

export type TikZData = {
    id: string;
    latex: string;
    svg: string;
    caption?: string;
};

// 图形 tikzjax blot
// https://github.com/artisticat1/obsidian-tikzjax
export class TikZJaxBlot extends EmbedBlot {
    static blotName: string = 'tikzjax';
    static tagName: string = 'DIV';
    static className: string = 'ql-tikzjax';

    static create(data: TikZData) {
        const node = super.create() as HTMLElement;
        const label = document.createElement('label'); // 占位元素，规避EmbedBlot的第一个childNode元素是div这样的块级元素
        const div = document.createElement('div'); //子div 显示svg
        const span = document.createElement('span'); //子div 显示caption
        div.innerHTML = data.svg;
        span.innerText = data.caption || '';
        span.style.display = span.innerText.length > 0 ? 'inline-block' : 'none';
        span.style.wordBreak = 'break-all';
        node.appendChild(label);
        node.appendChild(div);
        node.appendChild(span);
        node.style.display = 'inline-block';
        node.style.textAlign = 'center';
        node.style.margin = '0';
        node.style.padding = '0';
        node.style.borderWidth = '1px';
        node.style.borderColor = 'transparent';
        node.style.userSelect = 'none';
        node.style.cursor = 'pointer';
        node.setAttribute('contenteditable', 'false');
        node.setAttribute('data-latex', decodeURIComponent(data.latex)); //latex前面uri编码，这里需要解码，避免特殊字符影响
        node.id = data.id;
        return node;
    }

    static value(domNode: HTMLElement): TikZData {
        return {
            id: domNode.id,
            latex: domNode.getAttribute('data-latex') || '',
            svg: domNode.querySelector('div')?.innerHTML || '',
            caption: domNode.querySelector('span')?.innerText || ''
        };
    }

    constructor(
        scroll: Root,
        public domNode: HTMLElement
    ) {
        super(scroll, domNode);
        domNode.setAttribute('contenteditable', 'false');
    }

    html() {
        const latex = this.domNode.getAttribute('data-latex');
        return `${latex}`;
    }
}

export default TikZJaxBlot;
