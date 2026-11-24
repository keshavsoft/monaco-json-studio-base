import { pretty } from '../dom.js';

const DEFAULT_OPTIONS = {
    theme: 'vs-dark',
    automaticLayout: true,
    tabSize: 2,
    fontSize: 13,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    cursorBlinking: 'smooth',
    renderLineHighlight: 'all',
    padding: { top: 10 }
};

export function loadMonaco() {
    if (window.monaco) return Promise.resolve(window.monaco);
    if (typeof window.require !== 'function') {
        return Promise.reject(new Error('Monaco loader is unavailable.'));
    }
    window.require.config({
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }
    });
    return new Promise((resolve, reject) => {
        window.require(['vs/editor/editor.main'], () => resolve(window.monaco), reject);
    });
}

export async function loadInitialValue(fileName) {
    try {
        const response = await fetch(`./data/${encodeURIComponent(fileName)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return pretty(await response.text());
    } catch {
        return pretty({ message: `Default content for ${fileName}` });
    }
}

export function mountMonacoEditor(monaco, container, { language = 'json', value = '{}' }) {
    return monaco.editor.create(container, {
        ...DEFAULT_OPTIONS,
        language,
        value
    });
}
