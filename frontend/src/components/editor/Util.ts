// 获取dom节点的innerText 并对{和}符号进行转义
export function getInnerText(domNode: any) {
    if (!domNode && !domNode.innerText) {
        return '';
    }
    const innerText = domNode.innerText.replace(/[{}]/g, (match: any) => `\\${match}`);
    return innerText;
}

export function isNotEmpty(value: any) {
    return value !== null && value !== undefined && value !== '';
}

export const $dom = (selector: string) => {
    return document.querySelector(selector) as HTMLElement;
};
