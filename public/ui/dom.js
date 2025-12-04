/**
 * DOM Utility functions for SheetMetal
 * Focused on element selection and event binding to reduce boilerplate.
 */

export function get(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Missing DOM element: #${id}`);
    return el;
}

export function on(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
        return () => element.removeEventListener(event, handler);
    }
    return () => {};
}

export function create(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

export function clear(element) {
    if (element) element.innerHTML = '';
}