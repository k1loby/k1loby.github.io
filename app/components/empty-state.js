import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Inbox } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, } from "./core/empty.js";
export function EmptyState({ title, description, }) {
    return (_jsxs(Empty, { className: "empty-box", children: [_jsxs(EmptyHeader, { children: [_jsx(EmptyMedia, { children: _jsx(Inbox, {}) }), _jsx(EmptyTitle, { children: title }), _jsx(EmptyDescription, { children: description })] }), _jsx(EmptyContent, {})] }));
}
