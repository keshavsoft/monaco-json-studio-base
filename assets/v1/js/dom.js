export const byId = (id) => document.getElementById(id);

export function pretty(value) {
    if (typeof value === 'string') {
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
            return value;
        }
    }
    return JSON.stringify(value, null, 2);
}

export function setStatus(message, isError = false) {
    const pill = byId('statusPill');
    const text = byId('statusText');
    if (!pill || !text) return;
    text.textContent = message;
    pill.classList.remove('hidden', 'success', 'error');
    pill.classList.add(isError ? 'error' : 'success');
}
