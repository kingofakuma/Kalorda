import Quill from 'quill';
import { getInnerText, isNotEmpty } from '../Util';
import type InlineType from 'quill/blots/inline';
const Inline = Quill.import('blots/inline') as typeof InlineType;

// 文字加下划线 替代默认的下划线输出\\uline{}
export class NormalUnderlineBlot extends Inline {
    static blotName: string = 'normal-underline';
    static tagName: string = 'U';
    static className: string = 'ql-normal-underline';

    static create() {
        const node = super.create();
        node.style.textDecoration = 'underline';
        node.style.textUnderlineOffset = '0.3rem';
        return node;
    }

    html() {
        const text = getInnerText(this.domNode);
        if (!isNotEmpty(text)) return '';
        return `<u class="ql-normal-underline" style="text-decoration: underline; text-underline-offset: 0.3rem;">${text}</u>`;
    }
}

export default NormalUnderlineBlot;
