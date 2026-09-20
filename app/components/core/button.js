import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../../lib/cn.js";
export function Button({ variant = "secondary", size = "md", isIconOnly = false, className, onPress, onClick, type = "button", ...props }) {
    const handleClick = (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
            onPress?.();
        }
    };
    return (_jsx("button", { type: type, "data-button": "", "data-icon-only": isIconOnly ? "" : undefined, className: cn("m3e-button", `m3e-button-${variant}`, `m3e-button-${size}`, isIconOnly && "m3e-button-icon", className), onClick: handleClick, ...props }));
}
