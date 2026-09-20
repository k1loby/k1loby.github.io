import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/empty-state.js";
export default function NotFoundPage() {
    return (_jsxs("div", { className: "page reveal", children: [_jsx(EmptyState, { title: "404", description: "i forgot to add the stuff sorry" }), _jsx("div", { className: "center", children: _jsx(Link, { className: "text-link", to: "/", children: "go home" }) })] }));
}
