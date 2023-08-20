export async function isServerRunning(PORT: number) {
    try {
        await fetch(`http://localhost:${PORT}`);
        return true;
    } catch (e) {
        return false;
    }
}
