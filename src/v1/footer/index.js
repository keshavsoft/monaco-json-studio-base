export const FOOTER_TYPES = ['cursor', 'note', 'none'];

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

export function normalizeFooter(rawFooter = 'none', paneNumber) {
    const footer = typeof rawFooter === 'string' ? { type: rawFooter } : (rawFooter ?? { type: 'none' });
    const type = footer.type ?? 'none';
    if (!FOOTER_TYPES.includes(type)) {
        throw new TypeError(`footer.type must be one of: ${FOOTER_TYPES.join(', ')}`);
    }

    return {
        type,
        cursorId: `paneCursor${paneNumber}`,
        text: type === 'note' ? (footer.text || 'Monaco JSON Studio') : ''
    };
}

export function renderPaneFooter(pane) {
    const { footer } = pane;
    if (footer.type === 'none') return '';
    if (footer.type === 'cursor') {
        return `<footer id="${footer.cursorId}" class="pane-region pane-footer pane-footer--cursor" data-region="footer" data-type="cursor">Ln 1, Col 1</footer>`;
    }
    return `<footer class="pane-region pane-footer pane-footer--note" data-region="footer" data-type="note">${escapeHtml(footer.text)}</footer>`;
}
