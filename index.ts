import {
  parse
} from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
// import template from "@babel/template";
import plugin from "@babel/plugin-transform-react-jsx";
// import presetReact from "@babel/preset-react";
// import {
//   transform
// } from "@babel/core"


// console.log(plugin( {
//   "throwIfNamespace": false, // defaults to true
//   "runtime": "classic",
//   "pure": false
// }));

// transform(code, {
//   presets: ["@babel/preset-react"],
//   babelrc: false,
//   configFile: false
// });

export function transpile(code) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"]
  });
  const state = new Map();
  Object.assign(state, {
    file: {
      ast,
      opts: {}
    },
    addHelper: () => {
      return t.memberExpression(t.identifier("Object"), t.identifier("assign"));
    },
    opts: {
      throwIfNamespace: false,
      runtime: "classic",
      pure: false,
      useBuiltIns: true
    }
  });
  traverse(ast, plugin(state.opts).visitor, null, state);
  return generate(ast).code;
}

globalThis.transpile = transpile;

// const state = new Map();
// state.file = {
//   ast: {},
// };
// state.addHelper = ()=> {
//   return t.memberExpression(t.identifier("Object"), t.identifier("assign"));
// }