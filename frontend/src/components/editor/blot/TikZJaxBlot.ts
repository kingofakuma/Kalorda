// import Quill from 'quill';
import type { Root } from 'parchment';
import { EmbedBlot } from 'parchment';

// 定义自定义元素，模拟math-field
class TikzJaxElement extends HTMLElement {
    // 构造函数 - 只做最基本的初始化
    constructor() {
        super();

        // 创建shadow root - 构造函数中只能做这一件事
        this.attachShadow({ mode: 'open' });
    }

    // 生命周期方法：元素添加到DOM时调用
    connectedCallback() {
        // 在connectedCallback中设置样式和属性，而不是构造函数
        this.style.display = 'inline-block';
        this.style.textAlign = 'center';
        this.style.userSelect = 'none';
        this.style.cursor = 'pointer';

        // 不可编辑
        this.setAttribute('contenteditable', 'false');
    }

    // 生命周期方法：属性变化时调用
    attributeChangedCallback(_name: string, _oldValue: string, _newValue: string) {
        // 可以在这里处理属性变化
    }

    // 静态方法：定义观察的属性
    static get observedAttributes() {
        return ['contenteditable', 'id', 'data-latex', 'data-svg', 'data-caption'];
    }

    // 定义元素类型为内联
    static get formAssociated() {
        return false; // 设置为false，避免表单关联问题
    }
}

// 注册自定义元素
if (!customElements.get('tikz-jax')) {
    customElements.define('tikz-jax', TikzJaxElement);
}

// 图形 tikzjax blot
// https://github.com/artisticat1/obsidian-tikzjax
export class TikZJaxBlot extends EmbedBlot {
    static blotName: string = 'tikzjax';
    static tagName: string = 'tikz-jax'; // 使用自定义元素
    static className: string = 'ql-tikzjax';

    // 必须实现，标记为行内元素
    static formats() {
        return true;
    }

    static create(data: any) {
        const svg = decodeURIComponent(data.svg || '');
        const caption = decodeURIComponent(data.caption || '');
        const id = data.id;
        const latex = data.latex || '';

        // 手动创建自定义元素，不使用super.create()避免属性传递问题
        const node = document.createElement('tikz-jax') as HTMLElement;
        const svgDiv = document.createElement('div'); //子div 显示svg
        const captionSpan = document.createElement('span'); //子span 显示caption

        // 设置内容
        svgDiv.innerHTML = svg;
        captionSpan.innerText = caption;
        captionSpan.style.display = caption ? 'inline-block' : 'none';

        // 确保shadow root存在，如果不存在则创建
        let shadowRoot = node.shadowRoot;
        if (!shadowRoot) {
            // 如果shadow root不存在，手动创建
            shadowRoot = node.attachShadow({ mode: 'open' });
        }

        // 清空shadow root并添加元素
        shadowRoot.innerHTML = '';
        shadowRoot.appendChild(svgDiv);
        shadowRoot.appendChild(captionSpan);

        node.id = id;
        node.setAttribute('data-latex', latex);
        node.className = TikZJaxBlot.className;
        return node;
    }

    static value(domNode: TikzJaxElement) {
        const id = domNode.id;
        let latex = domNode.getAttribute('data-latex') || '';
        let svg = domNode.getAttribute('data-svg') || '';
        let caption = domNode.getAttribute('data-caption') || '';

        // 如果没有取到从shadow root获取svg和caption
        if (!svg || !caption) {
            // 双击编辑器tikz图形进行编辑时
            const shadowRoot = domNode.shadowRoot;
            if (shadowRoot) {
                const svgDiv = shadowRoot.querySelector('div');
                const captionSpan = shadowRoot.querySelector('span');

                latex = decodeURIComponent(latex);

                if (svgDiv) {
                    svg = decodeURIComponent(svgDiv.innerHTML);
                }

                if (captionSpan) {
                    caption = decodeURIComponent(captionSpan.innerText);
                }
            }
        }

        const tikzData = {
            id: id,
            latex: latex,
            svg: svg,
            caption: caption
        };
        return tikzData;
    }

    constructor(scroll: Root, public domNode: TikzJaxElement) {
        super(scroll, domNode);
        domNode.setAttribute('contenteditable', 'false');
    }

    html() {
        const id = this.domNode.id;
        const latex = this.domNode.getAttribute('data-latex') || '';
        let svg = '';
        let caption = '';
        // 从shadow root获取内容
        const shadowRoot = (this.domNode as any).shadowRoot;
        if (shadowRoot) {
            const svgDiv = shadowRoot.querySelector('div');
            const captionSpan = shadowRoot.querySelector('span');

            if (svgDiv) {
                svg = encodeURIComponent(svgDiv.innerHTML);
            }

            if (captionSpan) {
                caption = encodeURIComponent(captionSpan.innerText);
            }
        }
        let html = `<tikz-jax class="${TikZJaxBlot.className}" id="${id}" data-latex="${latex}" data-svg="${svg}" data-caption="${caption}"></tikz-jax>`;
        return html;
    }
}

export default TikZJaxBlot;