import Quill from 'quill';
import { getInnerText, isNotEmpty } from '../Util';
import type InlineType from 'quill/blots/inline';
const Inline = Quill.import('blots/inline') as typeof InlineType;

// 文字加波浪线
export class WavyUnderlineBlot extends Inline {
    static blotName: string = 'wavy-underline';
    static tagName: string = 'U';
    static className: string = 'ql-wavy-underline';

    static create() {
        const node = super.create();
        node.style.textDecoration = 'underline';
        node.style.textDecorationStyle = 'wavy';
        node.style.textUnderlineOffset = '0.2rem';
        return node;
    }

    html() {
        const text = getInnerText(this.domNode);
        if (!isNotEmpty(text)) return '';
        return `<u class="ql-wavy-underline" style="text-decoration: underline; text-decoration-style: wavy; text-underline-offset: 0.2rem;">${text}</u>`;
    }
}

export default WavyUnderlineBlot;
