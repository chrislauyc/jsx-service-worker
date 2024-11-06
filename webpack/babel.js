import {
  parse
} from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

import plugin from "@babel/plugin-transform-react-jsx";

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