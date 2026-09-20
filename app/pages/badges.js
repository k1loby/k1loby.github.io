import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/empty-state.js";
import { badges } from "../lib/badges.js";
function BadgeLink({ name, url, image, }) {
    const [touchTooltip, setTouchTooltip] = useState(false);
    const timer = useRef(null);
    useEffect(() => {
        return () => {
            if (timer.current !== null) {
                window.clearTimeout(timer.current);
            }
        };
    }, []);
    function showTouchTooltip() {
        setTouchTooltip(true);
        if (timer.current !== null) {
            window.clearTimeout(timer.current);
        }
        timer.current = window.setTimeout(() => {
            setTouchTooltip(false);
            timer.current = null;
        }, 1800);
    }
    function onClick(event) {
        const touchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        if (touchLike && !touchTooltip) {
            event.preventDefault();
            showTouchTooltip();
        }
    }
    return (_jsxs("a", { className: [
            "badge-card",
            touchTooltip ? "is-tooltip-open" : "",
        ]
            .filter(Boolean)
            .join(" "), href: url, target: "_blank", rel: "noreferrer", "aria-label": `${name}: ${url}`, onClick: onClick, onBlur: () => setTouchTooltip(false), children: [_jsx("img", { src: image, alt: `${name} badge`, loading: "lazy" }), _jsx("span", { className: "badge-redirect-tooltip", role: "tooltip", children: url })] }));
}
export default function BadgesPage() {
    return (_jsxs("div", { className: "page reveal", children: [_jsxs("header", { className: "page-head", children: [_jsx("p", { className: "eyebrow", children: "badges / stickers" }), _jsx("h1", { children: "links" })] }), badges.length ? (_jsx("div", { className: "badge-grid", children: badges.map((badge) => (_jsx(BadgeLink, { name: badge.name, url: badge.url, image: badge.image }, badge.name))) })) : (_jsx(EmptyState, { title: "nothing here", description: "i forgot to add the stuff sorry" }))] }));
}
