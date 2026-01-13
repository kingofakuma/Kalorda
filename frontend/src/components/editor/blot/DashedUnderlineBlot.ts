import Quill from 'quill';
import { getInnerText, isNotEmpty } from '../Util';
import type InlineType from 'quill/blots/inline';
const Inline = Quill.import('blots/inline') as typeof InlineType;

// 文字加下虚线
export class DashedUnderlineBlot extends Inline {
    static blotName: string = 'dashed-underline';
    static tagName: string = 'U';
    static className: string = 'ql-dashed-underline';

    static create() {
        const node = super.create();
        node.style.textDecoration = 'underline';
        node.style.textDecorationStyle = 'dashed';
        node.style.textUnderlineOffset = '0.3rem';
        return node;
    }

    html() {
        const text = getInnerText(this.domNode);
        if (!isNotEmpty(text)) return '';
        return `<u class="ql-dashed-underline" style="text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 0.3rem;">${text}</u>`;
    }
}

export default DashedUnderlineBlot;
