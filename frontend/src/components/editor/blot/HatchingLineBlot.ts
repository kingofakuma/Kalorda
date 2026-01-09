import Quill from 'quill';
import { getInnerText, isNotEmpty } from '../Util';
import type InlineType from 'quill/blots/inline';
const Inline = Quill.import('blots/inline') as typeof InlineType;

// 文字加斜删除线
export class HatchingLineBlot extends Inline {
    static blotName: string = 'hatching-line';
    static tagName: string = 'U';
    static className: string = 'ql-hatching-line';

    static create() {
        const node = super.create();
        node.style.textDecoration = 'none';
        node.style.background = 'repeating-linear-gradient(-60deg, currentcolor, currentcolor, transparent 2px, transparent 12px)';
        return node;
    }

    html() {
        const text = getInnerText(this.domNode);
        return isNotEmpty(text) ? `\\xout{${text}}` : '';
    }
}

export default HatchingLineBlot;
