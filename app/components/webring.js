import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

const ring = "https://cxyz.web.app";
const site = "k1loby.github.io";

function RingButton({ href, icon, label, primary = false }) {
    return _jsx("a", {
        className: `webring-action${primary ? " primary" : ""}`,
        href,
        title: label,
        "aria-label": label,
        children: _jsx("span", {
            className: "material-symbols-rounded",
            "aria-hidden": "true",
            children: icon
        })
    });
}

export function Webring() {
    return _jsxs("section", {
        className: "section reveal",
        children: [
            _jsx("div", {
                className: "section-head",
                children: _jsxs("div", {
                    children: [
                        _jsx("p", { className: "eyebrow", children: "webring" }),
                        _jsx("h2", { children: "Castle Webring" })
                    ]
                })
            }),
            _jsxs("div", {
                className: "webring-card",
                children: [
                    _jsx("a", {
                        className: "webring-label",
                        href: ring,
                        children: "Castle Webring"
                    }),
                    _jsxs("div", {
                        className: "webring-actions",
                        children: [
                            _jsx(RingButton, {
                                href: `${ring}/previous/?site=${site}`,
                                icon: "arrow_back",
                                label: "Previous site"
                            }),
                            _jsx(RingButton, {
                                href: `${ring}/random/`,
                                icon: "casino",
                                label: "Random site",
                                primary: true
                            }),
                            _jsx(RingButton, {
                                href: `${ring}/next/?site=${site}`,
                                icon: "arrow_forward",
                                label: "Next site"
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
