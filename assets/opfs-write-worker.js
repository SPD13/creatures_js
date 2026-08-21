/**
 * opfs-write-worker.js — OPFS I/O worker.
 *
 * Runs the static build's file I/O off the game's main thread, replicating
 * the node-backend architecture where serving happens in another process:
 *
 *  - { op:'read', id, segments }          → { id, ok, bytes (transferred), size, mtimeMs }
 *    Asset GETs and large backend reads. Uses the async handle API
 *    (getFile/arrayBuffer) — no locks, safe alongside sync-handle writes.
 *  - { op:'write'|undefined, id, segments, bytes, append } → { id, ok, size }
 *    Bulk writes (world saves) and the Safari <18.4 createWritable fallback,
 *    via FileSystemSyncAccessHandle (worker-only API).
 *  - { op:'invalidate', key }             → no reply
 *    Drops cached directory handles for `key` and everything beneath it
 *    ('' clears all). Sent by OpfsVfs on rm/rename/refresh.
 *
 * Segments arrive already resolved to their stored casing by the main
 * thread's dirent cache; writes create missing parents.
 *
 * Directory handles are cached (path key → handle) exactly like the main
 * thread's OpfsVfs cache: warm reads cost getFileHandle + getFile only.
 * A failed walk from a cached ancestor retries once from the root.
 */

let rootPromise = null;
const dirCache = new Map(); // joined actual-cased path -> FileSystemDirectoryHandle

function getRoot() {
    if (!rootPromise) rootPromise = navigator.storage.getDirectory();
    return rootPromise;
}

function invalidate(key) {
    if (!key) { dirCache.clear(); return; }
    dirCache.delete(key);
    const prefix = key + '/';
    for (const k of dirCache.keys()) {
        if (k.startsWith(prefix)) dirCache.delete(k);
    }
}

async function walkDir(segments, create, useCache) {
    let dir = await getRoot();
    let startIdx = 0;
    if (useCache && segments.length > 0) {
        for (let i = segments.length; i > 0; i--) {
            const hit = dirCache.get(segments.slice(0, i).join('/'));
            if (hit) { dir = hit; startIdx = i; break; }
        }
    }
    for (let i = startIdx; i < segments.length; i++) {
        dir = await dir.getDirectoryHandle(segments[i], { create });
        dirCache.set(segments.slice(0, i + 1).join('/'), dir);
    }
    return dir;
}

/** Walk with a one-shot uncached retry (a cached ancestor may be stale). */
async function resolveDir(segments, create) {
    try {
        return await walkDir(segments, create, true);
    } catch (_) {
        for (let i = segments.length; i > 0; i--) {
            dirCache.delete(segments.slice(0, i).join('/'));
        }
        return walkDir(segments, create, false);
    }
}

async function handleRead(id, segments) {
    const parentSegs = segments.slice(0, -1);
    const name = segments[segments.length - 1];
    let file;
    try {
        const dir = await resolveDir(parentSegs, false);
        const handle = await dir.getFileHandle(name);
        file = await handle.getFile();
    } catch (err) {
        self.postMessage({ id, ok: false, notFound: true, error: String(err && err.message || err) });
        return;
    }
    const buffer = await file.arrayBuffer();
    self.postMessage(
        { id, ok: true, bytes: buffer, size: file.size, mtimeMs: file.lastModified },
        [buffer]
    );
}

async function handleWrite(id, segments, bytes, append) {
    const dir = await resolveDir(segments.slice(0, -1), true);
    const fileHandle = await dir.getFileHandle(segments[segments.length - 1], { create: true });
    const access = await fileHandle.createSyncAccessHandle();
    try {
        const offset = append ? access.getSize() : 0;
        if (!append) access.truncate(0);
        access.write(bytes, { at: offset });
        access.flush();
        const size = access.getSize();
        self.postMessage({ id, ok: true, size });
    } finally {
        access.close();
    }
}

self.onmessage = async (e) => {
    const { op, id, segments, bytes, append, key } = e.data;
    try {
        if (op === 'invalidate') {
            invalidate(key || '');
            return;
        }
        if (op === 'read') {
            await handleRead(id, segments);
            return;
        }
        // 'write' or legacy message without op
        await handleWrite(id, segments, bytes, append);
    } catch (err) {
        if (id != null) {
            self.postMessage({ id, ok: false, error: String(err && err.message || err) });
        }
    }
};
