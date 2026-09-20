import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { EmptyState } from "../components/empty-state.js";
import { getPost, resolvePublicAsset } from "../lib/blog.js";
function preprocessTasks(body) {
    return body.replace(/^(\s*[-*+]\s+)\[~\]\s+(.*)$/gm, "$1[ ] ⏳MIDWAY⏳ $2");
}
function InlineProgress({ value }) {
    const safe = Math.max(0, Math.min(100, value));
    return (_jsxs("div", { className: "md-progress-block", children: [_jsxs("div", { className: "md-progress-label", children: [_jsx("span", { children: "progress" }), _jsxs("strong", { children: [safe, "%"] })] }), _jsx("div", { className: "md-progress-track", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": safe, children: _jsx("div", { className: "md-progress-fill", style: { width: `${safe}%` } }) })] }));
}
const markdownComponents = {
    li({ children, className, ...props }) {
        const childArray = React.Children.toArray(children);
        function cleanNode(node) {
            if (typeof node === "string") {
                return node.replace("⏳MIDWAY⏳ ", "");
            }
            if (React.isValidElement(node)) {
                const nested = React.Children.toArray(node.props.children);
                const hasMarker = nested.some((child) => typeof child === "string" &&
                    child.includes("⏳MIDWAY⏳"));
                if (hasMarker) {
                    return React.cloneElement(node, undefined, nested.map(cleanNode));
                }
            }
            return node;
        }
        function hasMarker(node) {
            if (typeof node === "string") {
                return node.includes("⏳MIDWAY⏳");
            }
            if (React.isValidElement(node)) {
                return React.Children.toArray(node.props.children).some(hasMarker);
            }
            return false;
        }
        const midway = childArray.some(hasMarker);
        const cleaned = childArray.map(cleanNode);
        return (_jsx("li", { className: [
                className,
                midway ? "task-midway" : "",
            ]
                .filter(Boolean)
                .join(" "), ...props, children: cleaned }));
    },
};
function MarkdownWithProgress({ body }) {
    const processed = preprocessTasks(body);
    const parts = processed.split(/(\[\[progress:\d{1,3}\]\])/g);
    return (_jsx(_Fragment, { children: parts.map((part, index) => {
            const match = part.match(/^\[\[progress:(\d{1,3})\]\]$/);
            if (match) {
                return (_jsx(InlineProgress, { value: Number(match[1]) }, `progress-${index}`));
            }
            if (!part.trim())
                return null;
            return (_jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], components: markdownComponents, children: part }, `markdown-${index}`));
        }) }));
}
export default function BlogPostPage() {
    const { slug } = useParams();
    const post = getPost(slug);
    if (!post) {
        return (_jsx("div", { className: "page reveal", children: _jsx(EmptyState, { title: "post not found", description: "i forgot to add the stuff sorry" }) }));
    }
    return (_jsxs("article", { className: "page article reveal", children: [_jsxs(Link, { className: "back-link", to: "/blog", children: [_jsx(ArrowLeft, {}), " blog"] }), post.thumbnail ? (_jsx("img", { className: "article-thumbnail", src: resolvePublicAsset(post.thumbnail), alt: "" })) : null, _jsxs("header", { className: "article-head", children: [_jsx("p", { className: "eyebrow", children: post.date }), _jsx("h1", { children: post.title }), _jsx("p", { children: post.description }), post.tags.length ? (_jsx("div", { className: "tags", children: post.tags.map((tag) => (_jsx("span", { children: tag }, tag))) })) : null] }), _jsx("div", { className: "markdown", children: _jsx(MarkdownWithProgress, { body: post.body }) })] }));
}
