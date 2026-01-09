// import Quill from 'quill';
import type { Root } from 'parchment';
import { EmbedBlot } from 'parchment';

// 插图
export type IllustrationData = {
    id: string;
    src: string;
    position: string[]; // = [left, top, width裁剪区宽度, height裁剪区高度, imageWidth图片总宽度, imageHeight图片总高度]
    caption?: string;
};

export class IllustrationBlot extends EmbedBlot {
    static blotName: string = 'illustrate';
    static tagName: string = 'DIV';
    static className: string = 'ql-illustrate';

    static create(data: IllustrationData) {
        const node = super.create() as HTMLElement;
        const label = document.createElement('label'); // 占位元素，规避EmbedBlot的第一个childNode元素是div这样的块级元素
        const div = document.createElement('div'); //子div 显示image src
        const span = document.createElement('span'); //子div 显示caption
        div.style.backgroundImage = `url(${data.src})`;
        let left = data.position[0];
        let top = data.position[1];
        let width = data.position[2];
        let height = data.position[3];
        let imageWidth = data.position[4];
        let imageHeight = data.position[5];
        div.style.backgroundPosition = `${-1 * Number(left)}px ${-1 * Number(top)}px`;
        div.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
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
        node.style.cursor = 'default';
        node.setAttribute('contenteditable', 'false');
        node.setAttribute('data-position', data.position.join(','));
        node.setAttribute('data-src', data.src);
        node.id = data.id;
        return node;
    }

    static value(domNode: HTMLElement): IllustrationData {
        return {
            id: domNode.id,
            src: domNode.getAttribute('data-src') || '',
            position: domNode.getAttribute('data-position')?.split(',') || [],
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
        const position = this.domNode.getAttribute('data-position');
        // const src = this.domNode.getAttribute('data-src');
        return `\\begin{figure}\\includegraphics[position=${position}]{}\\end{figure}`;
    }
}

export default IllustrationBlot;
