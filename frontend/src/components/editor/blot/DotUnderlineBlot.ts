import Quill from 'quill';
import { getInnerText, isNotEmpty } from '../Util';
import type InlineType from 'quill/blots/inline';
const Inline = Quill.import('blots/inline') as typeof InlineType;

// 文字下方加点
export class DotUnderlineBlot extends Inline {
    static blotName: string = 'dot-underline';
    static tagName: string = 'U';
    static className: string = 'ql-dot-underline';

    static create() {
        const node = super.create();
        node.style.paddingBottom = '0.2rem';
        node.style.textDecoration = 'none';
        node.style.backgroundPosition = 'bottom';
        node.style.backgroundSize = '10px 2px';
        node.style.backgroundRepeat = 'repeat-x';
        node.style.backgroundImage = 'radial-gradient(circle, currentcolor 1px, transparent 1px)';
        return node;
    }

    html() {
        const text = getInnerText(this.domNode);
        return isNotEmpty(text) ? `\\dotuline{${text}}` : '';
    }
}

export default DotUnderlineBlot;
