const serviceWorkerName = "service-worker.js";
const version = "v1";

export async function autoUpdate() {
    const swVersion = await getVersion();
    if (swVersion !== version) {
        await unregisterAll();
        return registerServiceWorker().then(reg => {
            reg.active.onerror = e => console.error(e);
        });
    }
}
export async function getVersion() {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0) {
        return "";
    }
    return fetch("/sw?version")
        .then(res => res.json())

        .then(j => {
            console.log(j);
            return j.version;
        });
}

async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
            serviceWorkerName,
            {
                scope: "/"
            }
        );
        return navigator.serviceWorker.ready;
    }
}

async function unregisterAll() {
    return navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            registration.unregister();
        });
    });
}
