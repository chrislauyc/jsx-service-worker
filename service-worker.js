const version = "v1";
const timestamp = new Date();
let lastInstall = { toString: () => "none" };
let lastActivate = { toString: () => "none" };

const addResourcesToCache = async resources => {
    const cache = await caches.open(version);
    await cache.addAll(resources);
};

const putInCache = async (url, code) => {
    const cache = await caches.open(version);
    await cache.put(url, code);
};

const cacheFirst = async ({ request }) => {
    // First try to get the resource from the cache
    const code = await caches.match(request.url);
    if (code) {
        return getJsResponse(code);
    }
    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request.clone());
        const code = transpileJSX(await responseFromNetwork.clone().text());
        putInCache(
            request.url,
            `// Cached by Service Worker ${version}\n${code}`
        );
        return getJsResponse(code);
    } catch (error) {
        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response("Network error happened: " + error.message, {
            status: 408,
            headers: { "Content-Type": "text/plain" }
        });
    }
};

self.addEventListener("install", event => {
    lastInstall = new Date();
    importScripts("./global-shim.js", "./dist/babel.js");
    event.waitUntil(addResourcesToCache(["./"]));
});

self.addEventListener("fetch", event => {
    event.respondWith(router(event.request));
});
function transpileJSX(jsx) {
    const jsCode = `// Transpiled by service worker ${version}\n${globalThis.transpile(
        jsx
    )}`;
    return jsCode;
}

function getJsResponse(code) {
    new Response(code, {
        headers: {
            "Content-Type": "application/javascript"
        }
    });
}

const serviceWorkerRouteMatcher = /^\/(sw$|sw\/)/;

function serviceWorkerRoute(path, request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    if (params.has("version") || params.has("info")) {
        return Response.json({
            version,
            lastScriptRun: timestamp.toString(),
            lastInstall: lastInstall.toString(),
            lastActivate: lastActivate.toString()
        });
    }

    return Response.json({
        message: "Service worker is working."
    });
}
async function router(request) {
    const url = new URL(request.url);

    if (serviceWorkerRouteMatcher.test(url.pathname)) {
        return serviceWorkerRoute(
            url.pathname.replace(serviceWorkerRouteMatcher, ""),
            request
        );
    }

    const params = url.searchParams;
    if (url.pathname.endsWith(".jsx")) {
        const res = await fetch(request);
        // return new Response(await res.text(), {
        //     headers: {
        //         "Access-Control-Allow-Origin": "*",
        //         "Content-Type": "application/javascript"
        //     }
        // });
        return cacheFirst({
            request
        });
    }
    return fetch(request);
}
const deleteCache = async key => {
    await caches.delete(key);
};

const deleteOldCaches = async () => {
    const cacheKeepList = [version];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter(key => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", event => {
    lastActivate = new Date();
    event.waitUntil(deleteOldCaches());
    //event.waitUntil(clients.claim());
});
