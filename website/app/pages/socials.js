import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Castle, ExternalLink, Github, Link as LinkIcon, } from "lucide-react";
import { EmptyState } from "../components/empty-state.js";
import { socials } from "../content/socials.js";
function SocialIcon({ kind, }) {
    if (kind === "github")
        return _jsx(Github, {});
    if (kind === "castle")
        return _jsx(Castle, {});
    return _jsx(LinkIcon, {});
}
export default function SocialsPage() {
    return (_jsxs("div", { className: "page reveal", children: [_jsxs("header", { className: "page-head", children: [_jsx("p", { className: "eyebrow", children: "contact" }), _jsx("h1", { children: "socials" })] }), socials.length ? (_jsx("div", { className: "social-list", children: socials.map((social) => (_jsxs("a", { className: "social-row", href: social.href, target: "_blank", rel: "noreferrer", children: [_jsx("span", { className: "social-icon", children: _jsx(SocialIcon, { kind: social.kind }) }), _jsxs("span", { className: "social-copy", children: [_jsx("strong", { children: social.name }), _jsx("span", { children: social.href })] }), _jsx(ExternalLink, { className: "social-external" })] }, social.href))) })) : (_jsx(EmptyState, { title: "nothing here", description: "i forgot to add the stuff sorry" }))] }));
}
