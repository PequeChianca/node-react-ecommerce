// Maps userId (string) -> Set of SSE response objects
const clients = new Map();

export function addClient(userId, res) {
    const key = String(userId);
    if (!clients.has(key)) clients.set(key, new Set());
    clients.get(key).add(res);
}

export function removeClient(userId, res) {
    const key = String(userId);
    if (clients.has(key)) {
        clients.get(key).delete(res);
        if (clients.get(key).size === 0) clients.delete(key);
    }
}

export function emitToUser(userId, data) {
    const key = String(userId);
    const userClients = clients.get(key);
    if (!userClients) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of userClients) {
        try {
            res.write(payload);
        } catch (_) {
            // client disconnected, cleanup handled via req 'close' event
        }
    }
}
