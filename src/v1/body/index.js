export const BODY_TYPES = ['monaco'];

export function normalizeBody(rawBody = 'monaco', paneKey, paneNumber, header) {
    const body = typeof rawBody === 'string' ? { type: rawBody } : (rawBody ?? { type: 'monaco' });
    const type = body.type ?? 'monaco';
    if (!BODY_TYPES.includes(type)) {
        throw new TypeError(`body.type must be one of: ${BODY_TYPES.join(', ')}`);
    }

    const selectedOption = header.selectedOption;
    const fileName = body.fileName ?? selectedOption?.fileName ?? `${paneKey}.json`;
    const content = body.content ?? (selectedOption ? JSON.parse(selectedOption.contentText) : {});

    return {
        type,
        language: body.language ?? 'json',
        editorId: `editor${paneNumber}`,
        fileName,
        contentText: JSON.stringify(content, null, 2)
    };
}

export function renderPaneBody(pane) {
    return `<div id="${pane.body.editorId}" class="pane-region pane-body pane-body--${pane.body.type}" data-region="body" data-type="${pane.body.type}" data-language="${pane.body.language}"></div>`;
}
