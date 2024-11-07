import { Fragment, h as createElement, render } from 'preact';
export * from 'preact/hooks';
/**
 * @param {HTMLElement} root
 */
export function createRoot(root) {
    return {
        render:
            /**
             *
             * @param {createElement.JSX.Element} component
             */
            function (component) {
                render(component, root);
            },
        unmount: () => render(null, root)
    };
}
const React = { createElement, Fragment };
export default React;
