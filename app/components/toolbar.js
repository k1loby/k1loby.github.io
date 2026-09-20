import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BookOpenText, FolderKanban, Home, AtSign, Moon, Pencil, Sticker, Sun, } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "./core/button.js";
import { Tooltip, TooltipContent } from "./core/tooltip.js";
function Tool({ label, children, }) {
    return (_jsxs(Tooltip, { children: [children, _jsx(TooltipContent, { placement: "bottom", className: "toolbar-tooltip", children: label })] }));
}
const drawHref = "/draw/";
export function Toolbar({ dark, onTheme, }) {
    return (_jsx("nav", { className: "toolbar-shell", "aria-label": "main navigation", children: _jsxs("div", { className: "toolbar", children: [_jsx(Tool, { label: "home", children: _jsx(NavLink, { to: "/", className: ({ isActive }) => `toolbar-link ${isActive ? "is-active" : ""}`, "aria-label": "home", children: _jsx(Home, {}) }) }), _jsx(Tool, { label: "projects", children: _jsx(NavLink, { to: "/projects", className: ({ isActive }) => `toolbar-link ${isActive ? "is-active" : ""}`, "aria-label": "projects", children: _jsx(FolderKanban, {}) }) }), _jsx(Tool, { label: "blog", children: _jsx(NavLink, { to: "/blog", className: ({ isActive }) => `toolbar-link ${isActive ? "is-active" : ""}`, "aria-label": "blog", children: _jsx(BookOpenText, {}) }) }), _jsx(Tool, { label: "badges / stickers", children: _jsx(NavLink, { to: "/badges", className: ({ isActive }) => `toolbar-link ${isActive ? "is-active" : ""}`, "aria-label": "badges / stickers", children: _jsx(Sticker, {}) }) }), _jsx(Tool, { label: "socials", children: _jsx(NavLink, { to: "/socials", className: ({ isActive }) => `toolbar-link ${isActive ? "is-active" : ""}`, "aria-label": "socials", children: _jsx(AtSign, {}) }) }), _jsx(Tool, { label: "Whiteboard for sketching around", children: _jsx("a", { className: "toolbar-link", href: drawHref, "aria-label": "Whiteboard for sketching around", children: _jsx(Pencil, {}) }) }), _jsx(Tool, { label: dark ? "light mode" : "dark mode", children: _jsx(Button, { variant: "quiet", isIconOnly: true, "aria-label": dark ? "light mode" : "dark mode", onPress: onTheme, className: "toolbar-theme", children: dark ? _jsx(Sun, {}) : _jsx(Moon, {}) }) })] }) }));
}
