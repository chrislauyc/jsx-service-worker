import { autoUpdate, getVersion } from "./sw-manager.js";

// autoUpdate()
//     .then(() => import("./test.js"))
//     .then(({ Test }) => {})
//     .catch(e => console.error(e));

fetch("./test2.jsx")
    .then(r => {
        console.log(r);
        console.log([...r.headers.entries()]);
        return r.text();
    })
    .then(t => console.log(t))
    .then(() => import("./test2.jsx"))
    .catch(e => console.error(e));
getVersion()
    .then(v => console.log(v))
    .catch(e => console.error(e));
