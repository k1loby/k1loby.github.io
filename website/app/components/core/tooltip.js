import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../../lib/cn.js";
export function Tooltip({ children, }) {
    return (_jsx("span", { className: "m3e-tooltip-root", children: children }));
}
export function TooltipContent({ placement = "bottom", offset = 8, hideArrow = false, children, className, style, ...props }) {
    const tooltipStyle = {
        ...style,
        "--m3e-tooltip-offset": `${offset}px`,
    };
    return (_jsxs("span", { role: "tooltip", "data-placement": placement, className: cn("m3e-tooltip", className), style: tooltipStyle, ...props, children: [children, !hideArrow ? (_jsx("span", { className: "m3e-tooltip-arrow", "aria-hidden": "true" })) : null] }));
}
