import { autoUpdate, getVersion } from "./sw-manager.js";
console.log("hello");
getVersion()
    .then(v => console.log(v))
    .catch(e => console.error(e));
autoUpdate().then(()=>
  import("./test.js?t")
).catch(e => console.error(e));
