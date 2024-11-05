importScripts("./global-shim.js", "./babel.js");

const version = "v1";
const timestamp = new Date();
const addResourcesToCache = async resources => {
    const cache = await caches.open(version);
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    const cache = await caches.open(version);
    await cache.put(request, response);
};

const cacheFirst = async ({ request }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request.clone());
        if (isJavaScript(responseFromNetwork)) {
            const { status, headers } = responseFromNetwork;
            const text = await responseFromNetwork.text();
            const transpiled = runTranspilation(text);
            putInCache(request, new Response(transpiled, { status, headers }));
            return new Response(transpiled, { status, headers });
        }
        return responseFromNetwork;
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
    event.waitUntil(addResourcesToCache(["./"]));
});

self.addEventListener("fetch", event => {
    event.respondWith(router(event.request));
});
function isJavaScript(responseFromNetwork) {
    const type = responseFromNetwork.headers.get("content-type");
    return (
        type.includes("text/javascript") ||
        type.includes("application/javascript")
    );
}
function runTranspilation(code) {
    const transpiled = globalThis.transpile(code);
    return transpiled;
}

const serviceWorkerRouteMatcher = /^\/(sw$|sw\/)/;

function serviceWorkerRoute(path, request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    if (params.has("version")) {
        return Response.json({
            version
        });
    }
    return Response.json({
        message: "Service worker is working."
    });
}
function router(request) {
    const url = new URL(request.url);

    if (serviceWorkerRouteMatcher.test(url.pathname)) {
        return serviceWorkerRoute(
            url.pathname.replace(serviceWorkerRouteMatcher, ""),
            request
        );
    }

    return cacheFirst({
        request
    });
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
    event.waitUntil(deleteOldCaches());
    event.waitUntil(clients.claim());
});
