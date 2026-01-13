// import Quill from 'quill';
import type { Root } from 'parchment';
import { EmbedBlot } from 'parchment';
import type { MathfieldElement } from 'mathlive';

// 公式
export class MathfieldBlot extends EmbedBlot {
    static blotName = 'mathfield';
    static tagName = 'math-field';
    static className = 'ql-math-field';

    static create(data: { formulaId: string; formula: string }) {
        const element = super.create() as MathfieldElement;
        element.setAttribute('mode', 'only-read');
        // element.setAttribute('contenteditable', 'false');
        // element.setAttribute('data-id', `${data.formulaId}`);
        element.setAttribute('id', `${data.formulaId}`);
        // element.innerHTML = data.formula;
        element.setValue(data.formula);
        element.classList.add('view');
        return element;
    }

    static value(domNode: MathfieldElement) {
        return {
            formulaId: domNode.id,
            formula: domNode.value || domNode.innerText
        };
    }

    constructor(
        scroll: Root,
        public domNode: MathfieldElement
    ) {
        super(scroll, domNode);
        domNode.setAttribute('contenteditable', 'false');
    }

    html() {
        const formula = this.domNode.value;
        const formulaId = this.domNode.id;
        return `<math-field class="ql-math-field" id="${formulaId}" mode="only-read" view">${formula}</math-field>`;
    }
}

export default MathfieldBlot;
