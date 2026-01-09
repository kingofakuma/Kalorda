// import Quill from 'quill';
import type { Root } from 'parchment';
import { EmbedBlot } from 'parchment';

export type SmilesData = {
    id: string;
    smiles: string;
    svg: string;
};

export class SmilesBlot extends EmbedBlot {
    static blotName: string = 'smiles';
    static tagName: string = 'DIV';
    static className: string = 'ql-smiles';

    static create(data: SmilesData) {
        const node = super.create() as HTMLElement;
        const div = document.createElement('div'); //子div 显示svg
        node.id = data.id;
        node.appendChild(div);
        return node;
    }

    static value(domNode: HTMLElement): SmilesData {
        return {
            id: domNode.id,
            smiles: domNode.getAttribute('data-smiles') || '',
            svg: domNode.querySelector('div')?.innerHTML || ''
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
        const smiles = this.domNode.getAttribute('data-smiles');
        return `${smiles}`;
    }
}

export default SmilesBlot;
