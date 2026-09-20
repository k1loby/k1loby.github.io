import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowUpRight, Search, } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/empty-state.js";
import { blogPosts, resolvePublicAsset } from "../lib/blog.js";
export default function BlogPage() {
    const [query, setQuery] = useState("");
    const posts = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle)
            return blogPosts;
        return blogPosts.filter((post) => [
            post.title,
            post.description,
            ...post.tags,
        ]
            .join(" ")
            .toLowerCase()
            .includes(needle));
    }, [query]);
    return (_jsxs("div", { className: "page reveal", children: [_jsxs("header", { className: "page-head", children: [_jsx("p", { className: "eyebrow", children: "blog" }), _jsx("h1", { children: "notes" }), _jsx("p", { children: "markdown files pretending to be a real blog." })] }), _jsxs("label", { className: "search-field", children: [_jsx(Search, {}), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "search posts", "aria-label": "search posts" })] }), posts.length ? (_jsx("div", { className: "blog-card-grid", children: posts.map((post) => (_jsxs(Link, { className: "blog-image-card", to: `/blog/${post.slug}`, children: [post.thumbnail ? (_jsx("img", { className: "blog-card-background", src: resolvePublicAsset(post.thumbnail), alt: "", loading: "lazy" })) : null, _jsx("div", { className: "blog-card-shade", "aria-hidden": "true" }), _jsxs("div", { className: "blog-card-content", children: [_jsxs("div", { className: "blog-card-top", children: [_jsx("time", { children: post.date }), _jsx(ArrowUpRight, { className: "blog-card-arrow", "aria-hidden": "true" })] }), _jsxs("div", { className: "blog-card-bottom", children: [_jsx("strong", { children: post.title }), _jsx("p", { children: post.description }), typeof post.progress === "number" ? (_jsx("div", { className: "blog-card-progress", children: _jsx("div", { style: {
                                                    width: `${post.progress}%`,
                                                } }) })) : null, post.tags.length ? (_jsx("div", { className: "blog-card-tags", children: post.tags.map((tag) => (_jsx("span", { children: tag }, tag))) })) : null] })] })] }, post.slug))) })) : (_jsx(EmptyState, { title: query
                    ? "no matching posts"
                    : "no posts yet", description: query
                    ? "try another search."
                    : "i forgot to add the stuff sorry" }))] }));
}
