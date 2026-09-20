import { createElement } from "react";
export function LoadingIndicator() {
    return createElement("m3e-loading-indicator", {
        variant: "contained",
        "aria-label": "loading",
    });
}
