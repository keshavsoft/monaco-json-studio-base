import { byId } from '../dom.js';

export function updateCursor(editor, pane) {
    const position = editor.getPosition();
    if (!position) return;

    const globalCursor = byId('cursorPos');
    if (globalCursor) {
        globalCursor.textContent = `${pane.label} | Ln ${position.lineNumber}, Col ${position.column}`;
    }
    if (pane.footerType === 'cursor') {
        const paneCursor = byId(`paneCursor${pane.paneNumber}`);
        if (paneCursor) {
            paneCursor.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
        }
    }
}
