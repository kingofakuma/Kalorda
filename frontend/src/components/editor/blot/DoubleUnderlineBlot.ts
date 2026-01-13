import Quill from 'quill';
import { getInnerText, isNotEmpty } from '../Util';
import type InlineType from 'quill/blots/inline';
const Inline = Quill.import('blots/inline') as typeof InlineType;

// 文字加双下划线
export class DoubleUnderlineBlot extends Inline {
    static blotName: string = 'double-underline';
    static tagName: string = 'U';
    static className: string = 'ql-double-underline';

    static create() {
        const node = super.create();
        node.style.textDecoration = 'underline';
        node.style.textDecorationStyle = 'double';
        node.style.textUnderlineOffset = '0.3rem';
        return node;
    }

    html() {
        const text = getInnerText(this.domNode);
        if (!isNotEmpty(text)) return '';
        return `<u class="ql-double-underline" style="text-decoration: underline; text-decoration-style: double; text-underline-offset: 0.3rem;">${text}</u>`;
    }
}

export default DoubleUnderlineBlot;
