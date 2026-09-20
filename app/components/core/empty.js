import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../../lib/cn.js";
export function Empty({ className, ...props }) {
    return (_jsx("div", { "data-slot": "empty", className: cn("m3e-empty", className), ...props }));
}
export function EmptyHeader({ className, ...props }) {
    return (_jsx("div", { "data-slot": "empty-header", className: cn("m3e-empty-header", className), ...props }));
}
export function EmptyTitle({ className, ...props }) {
    return (_jsx("div", { "data-slot": "empty-title", className: cn("m3e-empty-title", className), ...props }));
}
export function EmptyDescription({ className, ...props }) {
    return (_jsx("div", { "data-slot": "empty-description", className: cn("m3e-empty-description", className), ...props }));
}
export function EmptyContent({ className, ...props }) {
    return (_jsx("div", { "data-slot": "empty-content", className: cn("m3e-empty-content", className), ...props }));
}
export function EmptyMedia({ className, ...props }) {
    return (_jsx("div", { "data-slot": "empty-media", className: cn("m3e-empty-media", className), ...props }));
}
