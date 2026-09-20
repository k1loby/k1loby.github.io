import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Toolbar } from "./components/toolbar.js";
import BadgesPage from "./pages/badges.js";
import BlogPage from "./pages/blog.js";
import BlogPostPage from "./pages/blog-post.js";
import HomePage from "./pages/home.js";
import NotFoundPage from "./pages/not-found.js";
import ProjectsPage from "./pages/projects.js";
import SocialsPage from "./pages/socials.js";
import { site } from "./site.js";
function initialDark() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark")
        return true;
    if (saved === "light")
        return false;
    return matchMedia("(prefers-color-scheme: dark)").matches;
}
export default function App() {
    const [dark, setDark] = useState(initialDark);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        document.documentElement.style.colorScheme = dark ? "dark" : "light";
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);
    useEffect(() => {
        document.title = site.name;
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "site-notice", role: "status", children: [_jsx(Info, { "aria-hidden": "true" }), _jsx("span", { children: "the website isnt finished yet lads but you can still look and view" })] }), _jsx(Toolbar, { dark: dark, onTheme: () => setDark((value) => !value) }), _jsx("main", { className: "site-shell", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/projects", element: _jsx(ProjectsPage, {}) }), _jsx(Route, { path: "/blog", element: _jsx(BlogPage, {}) }), _jsx(Route, { path: "/blog/:slug", element: _jsx(BlogPostPage, {}) }), _jsx(Route, { path: "/badges", element: _jsx(BadgesPage, {}) }), _jsx(Route, { path: "/socials", element: _jsx(SocialsPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) })] }));
}
