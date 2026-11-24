import { bindEvents } from 'https://keshavsoft.github.io/dom-primitive-bindings/dist/v7/min.js';
import bindings from './header/bindings.json' with { type: 'json' };
import actions from './header/actions.js';
import { paneConfigs, state } from './state.js';
import { byId, setStatus } from './dom.js';
import { loadMonaco, loadInitialValue, mountMonacoEditor } from './body/monaco.js';
import { updateCursor } from './footer/cursor.js';

async function initPane(monaco, pane) {
    if (pane.bodyType !== 'monaco') return;
    const container = byId(`editor${pane.paneNumber}`);
    if (!container) return;

    const initialValue = await loadInitialValue(pane.fileName);
    const editor = mountMonacoEditor(monaco, container, {
        language: pane.language,
        value: initialValue
    });

    state.editors[pane.paneNumber - 1] = editor;
    state.contents[pane.paneNumber - 1] = initialValue;

    const update = () => updateCursor(editor, pane);
    editor.onDidFocusEditorText(update);
    editor.onDidChangeCursorPosition(update);
    editor.onDidChangeModelContent(() => {
        state.contents[pane.paneNumber - 1] = editor.getValue();
    });
}

async function start() {
    let monaco;
    try {
        monaco = await loadMonaco();
    } catch (error) {
        console.error('Failed to load Monaco:', error);
        setStatus('Monaco unavailable', true);
        return;
    }

    await Promise.all(paneConfigs.map((pane) => initPane(monaco, pane)));

    const app = document.querySelector('.studio-app');
    bindEvents(app, bindings, actions);

    setStatus('Ready ✓');
}

start();
