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
    if (!userClients || userClients.size === 0) {
        console.warn(`No clients connected for user ${userId}, skipping notification`);
        return;
    }

    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of userClients) {
        if (res.writableEnded || res.destroyed) {
            // stale connection — remove it
            userClients.delete(res);
            continue;
        }
        try {
            res.write(payload, (err) => {
                if (err) {
                    console.warn(`Failed to write to SSE client for user ${userId}: ${err.message}`);
                    userClients.delete(res);
                } else {
                    console.log(`Emitting notification to user ${userId}: ${payload.trim()}`);
                }
            });
        } catch (err) {
            console.warn(`Exception writing to SSE client for user ${userId}: ${err.message}`);
            userClients.delete(res);
        }
    }
    if (userClients.size === 0) clients.delete(key);
}
