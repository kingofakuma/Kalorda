import Quill from 'quill';
import type { BlockEmbed as BlockEmbedType } from 'quill/blots/block';
const BlockEmbed = Quill.import('blots/block/embed') as typeof BlockEmbedType;

// 分割线
export class DividerBlot extends BlockEmbed {
    static blotName: string = 'divider';
    static tagName: string = 'HR';
    static className: string = 'ql-divider';

    static create() {
        const node = super.create() as HTMLElement;
        node.setAttribute('contenteditable', 'false');
        node.style.borderTop = '2px solid #ccc';
        node.style.margin = '0.5rem 0';
        return node;
    }

    html() {
        return '<hr/>';
    }
}

export default DividerBlot;
