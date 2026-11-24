import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeHeader, renderHeaderControls, renderPaneHeader } from './header/index.js';
import { normalizeBody, renderPaneBody } from './body/index.js';
import { normalizeFooter, renderPaneFooter } from './footer/index.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(moduleDir, '..', '..', 'assets', 'v1');

export function resolveUniqueDir(baseOutputDir) {
    const resolvedBase = path.resolve(process.cwd(), baseOutputDir);
    if (!fs.existsSync(resolvedBase)) return resolvedBase;

    let counter = 1;
    while (fs.existsSync(`${resolvedBase}-${counter}`)) {
        counter += 1;
    }
    return `${resolvedBase}-${counter}`;
}

function copyTree(sourceDir, targetDir) {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        const srcPath = path.join(sourceDir, entry.name);
        const dstPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            copyTree(srcPath, dstPath);
        } else {
            fs.copyFileSync(srcPath, dstPath);
        }
    }
}

function normalizePanes(rawPanes) {
    if (!Array.isArray(rawPanes) || rawPanes.length < 1 || rawPanes.length > 3) {
        throw new TypeError('panes must be an array with 1 to 3 items.');
    }

    return rawPanes.map((rawPane, index) => {
        const paneNumber = index + 1;
        const key = rawPane.key ?? `pane${paneNumber}`;
        const label = rawPane.label ?? `Pane ${paneNumber}`;
        const header = normalizeHeader(rawPane.header, key, paneNumber);
        const body = normalizeBody(rawPane.body, key, paneNumber, header);
        const footer = normalizeFooter(rawPane.footer, paneNumber);

        const dataFiles = header.type === 'select'
            ? header.options.map((opt) => ({ fileName: opt.fileName, contentText: opt.contentText }))
            : [{ fileName: body.fileName, contentText: body.contentText }];

        return { paneNumber, key, label, header, body, footer, dataFiles };
    });
}

function buildHtml({ title, badge, panes }) {
    const paneCount = panes.length;
    const countLabel = `${paneCount} ${paneCount === 1 ? 'Pane' : 'Panes'} Active`;

    const studioBarPanes = panes.filter((pane) => pane.header.placement === 'studio' && pane.header.type !== 'none');
    const studioControlsHtml = studioBarPanes.map((pane) => `
        <span class="header-divider" aria-hidden="true"></span>
        <div class="header-left" data-pane-key="${pane.key}">
            ${renderHeaderControls(pane)}
        </div>`).join('');

    const panesHtml = panes.map((pane) => `
    <section class="studio-pane" id="pane${pane.paneNumber}" data-pane-key="${pane.key}">
        ${renderPaneHeader(pane)}
        ${renderPaneBody(pane)}
        ${renderPaneFooter(pane)}
    </section>`).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/editor/editor.main.min.css">
    <link rel="stylesheet" href="./css/base.css">
    <link rel="stylesheet" href="./css/studio.css">
    <link rel="stylesheet" href="./css/pane-layout.css">
    <link rel="stylesheet" href="./css/pane-regions.css">
</head>
<body>
    <div class="studio-app">
        <header class="studio-header">
            <div class="header-left">
                <a href="#" class="brand-link" title="${title}">
                    <i class="bi bi-cpu-fill brand-icon" aria-hidden="true"></i>
                    <span>${title}</span>
                    <span class="version-pill">${badge}</span>
                </a>${studioControlsHtml}
            </div>
            <div class="header-right">
                <span id="statusPill" class="status-pill success">
                    <i class="bi bi-check2" aria-hidden="true"></i>
                    <span id="statusText">Ready ✓</span>
                </span>
                <span class="header-divider" aria-hidden="true"></span>
                <span class="pane-file-pill">
                    <i class="bi bi-layout-split" aria-hidden="true"></i>
                    <span>${countLabel}</span>
                </span>
            </div>
        </header>
        <main class="studio-workspace" data-panes="${paneCount}">
            ${panesHtml}
        </main>
        <footer class="studio-footer">
            <div class="footer-left">
                <span class="footer-brand">
                    <i class="bi bi-braces-asterisk" aria-hidden="true"></i>
                    <span>${title}</span>
                </span>
                <span aria-hidden="true">|</span>
                <span id="layoutMeta">${countLabel}</span>
            </div>
            <div class="footer-right">
                <span id="cursorPos">Focus an editor to see the cursor position</span>
            </div>
        </footer>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/loader.min.js"></script>
    <script type="module" src="./js/index.js"></script>
</body>
</html>
`;
}

export function generateStudio(rawConfig) {
    const title = rawConfig.title ?? 'Monaco Studio';
    const badge = rawConfig.badge ?? 'base';
    const panes = normalizePanes(rawConfig.panes);
    const targetDir = rawConfig.uniqueDir === false
        ? path.resolve(process.cwd(), rawConfig.outputDir ?? './monaco-studio')
        : resolveUniqueDir(rawConfig.outputDir ?? './monaco-studio');

    const cssDir = path.join(targetDir, 'css');
    const dataDir = path.join(targetDir, 'data');
    const jsDir = path.join(targetDir, 'js');
    [cssDir, dataDir, jsDir].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

    fs.writeFileSync(path.join(targetDir, 'index.html'), buildHtml({ title, badge, panes }), 'utf8');
    copyTree(path.join(assetsDir, 'css'), cssDir);
    copyTree(path.join(assetsDir, 'js'), jsDir);

    panes.forEach((pane) => {
        pane.dataFiles.forEach((dataFile) => {
            fs.writeFileSync(path.join(dataDir, dataFile.fileName), `${dataFile.contentText}\n`, 'utf8');
        });
    });

    const paneConfigs = panes.map((pane) => ({
        paneNumber: pane.paneNumber,
        key: pane.key,
        label: pane.label,
        fileName: pane.body.fileName,
        headerType: pane.header.type,
        selectOptions: pane.header.options ?? [],
        bodyType: pane.body.type,
        language: pane.body.language,
        footerType: pane.footer.type
    }));

    const stateModule = [
        `export const paneConfigs = ${JSON.stringify(paneConfigs, null, 2)};`,
        'export const state = { editors: [], contents: [] };',
        ''
    ].join('\n');
    fs.writeFileSync(path.join(jsDir, 'state.js'), stateModule, 'utf8');

    return targetDir;
}
