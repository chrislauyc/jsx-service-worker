const serviceWorkerName = "service-worker.js";
const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        console.log("Registering ServiceWorker");
        try {
            const registration = await navigator.serviceWorker.register(
                serviceWorkerName,
                {
                    scope: "/"
                }
            );
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Registration failed`, error);
        }
    }
};
async function awaitTime(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
async function attachErrorHandler() {
    let isRegistered = false;
    const maxRetries = 5;
    function tryAttach() {
        return navigator.serviceWorker.getRegistration().then(reg => {
            if (!reg.active) return false;
            reg.active.onerror = e => console.error(e);
            return true;
        });
    }
    for (let i = 0; i < maxRetries; i++) {
        const isSuccess = await awaitTime(500).then(tryAttach);
        if (isSuccess) {
            isRegistered = true;
            break;
        }
    }
    console.log("attachErrorHandler: " + (isRegistered ? "success" : "failed"));
    return isRegistered;
}
function displayServiceWorkerStatuses() {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        const root = document.getElementById("root");
        root.textContent = "";
        registrations.forEach(r => {
            const p = document.createElement("p");
            p.textContent = r.installing
                ? "installing"
                : r.active
                ? "active"
                : r.waiting
                ? "waiting"
                : "unknown";
            root.appendChild(p);
        });
    });
}
function fetchTest() {
    fetch("/sw?version")
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            return res.text();
        })
        .then(j => console.log(j))
        .catch(e => console.error(e));
}
function fetchTest2() {
    fetch("/hello1.js")
        .then(res => {
            const type = res.headers.get("content-type");
            console.log(
                type.includes("text/javascript") ||
                    type.includes("application/javascript")
            );
            return res.text();
        })
        .then(j => console.log(j))
        .catch(e => console.error(e));
}
function unregisterAll() {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            registration
                .unregister()
                .then(boolean => {
                    console.log("successfully unregistered");
                })
                .catch(error => {
                    console.error(`Registration failed with ${error}`);
                });
        });
    });
}
window.addEventListener("beforeunload", () => {
    unregisterAll();
});
registerServiceWorker()
    .then(() => {
        setInterval(() => {
            displayServiceWorkerStatuses();
        }, 1000);
        setTimeout(() => {
            unregisterAll();
        }, 10000);
        attachErrorHandler().then(isSuccess => {
            console.log("isSuccess", isSuccess);
            if (isSuccess) {
                //fetchTest();
                fetchTest2();
            } else {
                console.log("isSuccess is false");
            }
        });
    })
    .catch(e => console.error(e));
