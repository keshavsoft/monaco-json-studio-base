export const HEADER_TYPES = ['file-picker', 'title', 'select', 'none'];

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

export function normalizeHeader(rawHeader = 'title', paneKey, paneNumber) {
    const header = typeof rawHeader === 'string' ? { type: rawHeader } : (rawHeader ?? { type: 'title' });
    const type = header.type ?? 'title';
    if (!HEADER_TYPES.includes(type)) {
        throw new TypeError(`header.type must be one of: ${HEADER_TYPES.join(', ')}`);
    }

    const base = {
        type,
        placement: header.placement === 'studio' ? 'studio' : 'pane',
        fileBtnId: `openFileBtn${paneNumber}`,
        fileInputId: `fileInput${paneNumber}`,
        fileNameId: `fileName${paneNumber}`,
        selectId: `paneSelect${paneNumber}`
    };

    if (type !== 'select') return base;

    const options = (header.options && header.options.length > 0 ? header.options : [
        { label: 'Sample A', value: 'sampleA', content: { sample: 'A' } },
        { label: 'Sample B', value: 'sampleB', content: { sample: 'B' } }
    ]).map((opt) => ({
        label: opt.label,
        value: opt.value,
        fileName: opt.fileName ?? `${paneKey}-${opt.value}.json`,
        contentText: JSON.stringify(opt.content ?? {}, null, 2),
        selected: false
    }));

    const selectedValue = header.selected ?? options[0].value;
    options.forEach((opt) => {
        opt.selected = opt.value === selectedValue;
    });

    return {
        ...base,
        options,
        selectedOption: options.find((opt) => opt.selected) ?? options[0]
    };
}

export function renderHeaderControls(pane) {
    const { header, label, body } = pane;
    if (header.type === 'file-picker') {
        return `
        <button id="${header.fileBtnId}" type="button" class="btn-pane-file" title="Choose a file for ${escapeHtml(label)}">
            <i class="bi bi-folder2-open" aria-hidden="true"></i>
            <span>Select File</span>
        </button>
        <input type="file" id="${header.fileInputId}" class="pane-file-input" accept=".json,.js,.txt,application/json">
        <span class="pane-file-pill">
            <i class="bi bi-filetype-json" aria-hidden="true"></i>
            <span id="${header.fileNameId}" class="pane-file-name">${escapeHtml(body.fileName)}</span>
        </span>`;
    }

    if (header.type === 'select') {
        const optionsHtml = (header.options ?? []).map((opt) =>
            `<option value="${escapeHtml(opt.value)}"${opt.selected ? ' selected' : ''}>${escapeHtml(opt.label)}</option>`
        ).join('');
        return `
        <select id="${header.selectId}" class="pane-select" aria-label="${escapeHtml(label)}">${optionsHtml}</select>
        <span class="pane-file-pill">
            <i class="bi bi-filetype-json" aria-hidden="true"></i>
            <span id="${header.fileNameId}" class="pane-file-name">${escapeHtml(body.fileName)}</span>
        </span>`;
    }

    return '';
}

export function renderPaneHeader(pane) {
    const { header, label, body } = pane;
    if (header.type === 'none' || header.placement === 'studio') return '';

    if (header.type === 'title') {
        return `<header class="pane-region pane-header pane-header--title" data-region="header" data-type="title">
    <span class="pane-label">${escapeHtml(label)}</span>
</header>`;
    }

    return `<header class="pane-region pane-header pane-header--${header.type}" data-region="header" data-type="${header.type}">
    <div class="pane-header__left">
        <span class="pane-label">${escapeHtml(label)}</span>
        ${renderHeaderControls(pane).split('<span class="pane-file-pill">')[0]}
    </div>
    <div class="pane-header__right">
        <span class="pane-file-pill">
            <i class="bi bi-filetype-json" aria-hidden="true"></i>
            <span id="${header.fileNameId}" class="pane-file-name">${escapeHtml(body.fileName)}</span>
        </span>
    </div>
</header>`;
}
