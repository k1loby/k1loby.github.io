import { site } from "../site.js";
const REPO_LIST_CACHE_KEY = `github-project-list:v3:${site.githubUser}`;
const REPO_LIST_CACHE_HOURS = 1 / 60;
const CARD_FILES_CACHE_HOURS = 1 / 60;
const FALLBACK_DESCRIPTION = "i forgot to add the description file";
function readCache(key, maxHours) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.at >
            maxHours * 60 * 60 * 1000) {
            return null;
        }
        return parsed.data;
    }
    catch {
        return null;
    }
}
function writeCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({
            at: Date.now(),
            data,
        }));
    }
    catch {
    }
}
async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json",
        },
    });
    if (!response.ok) {
        throw new Error(`GitHub returned ${response.status}`);
    }
    return (await response.json());
}
function formatLicense(repo) {
    const license = repo.license;
    if (!license) {
        return "no license";
    }
    if (license.spdx_id &&
        license.spdx_id !== "NOASSERTION") {
        return license.spdx_id;
    }
    return license.name || "no license";
}
function encodePath(path) {
    return path
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");
}
function rawRepoUrl(repo, path) {
    return (`https://raw.githubusercontent.com/` +
        `${repo.full_name}/` +
        `${encodeURIComponent(repo.default_branch)}/` +
        `${encodePath(path)}`);
}
async function loadRepoCardFiles(repo) {
    const cacheKey = `github-project-card-files:v2:` +
        `${repo.full_name}:${repo.default_branch}`;
    const cached = readCache(cacheKey, CARD_FILES_CACHE_HOURS);
    if (cached) {
        return cached;
    }
    let result = {
        description: FALLBACK_DESCRIPTION,
    };
    try {
        const tree = await fetchJson(`https://api.github.com/repos/` +
            `${repo.full_name}/git/trees/` +
            `${encodeURIComponent(repo.default_branch)}` +
            `?recursive=1`);
        const thumbnailFile = tree.tree.find((item) => item.type === "blob" &&
            /(^|\/)thumbnail_klbb\.(png|jpg|gif)$/i
                .test(item.path));
        const descriptionFile = tree.tree.find((item) => item.type === "blob" &&
            /(^|\/)card_desc\.txt$/i
                .test(item.path));
        if (thumbnailFile) {
            result.thumbnail = rawRepoUrl(repo, thumbnailFile.path);
        }
        if (descriptionFile) {
            try {
                const response = await fetch(rawRepoUrl(repo, descriptionFile.path), {
                    cache: "no-store",
                });
                if (response.ok) {
                    const text = (await response.text()).trim();
                    if (text) {
                        result.description = text;
                    }
                }
            }
            catch {
            }
        }
    }
    catch {
    }
    writeCache(cacheKey, result);
    return result;
}
async function fetchRepos() {
    const username = site.githubUser;
    if (!username) {
        return [];
    }
    const cached = readCache(REPO_LIST_CACHE_KEY, REPO_LIST_CACHE_HOURS);
    if (cached &&
        cached.length > 0) {
        return cached;
    }
    const repos = await fetchJson(`https://api.github.com/users/` +
        `${username}/repos` +
        `?per_page=100&sort=updated&type=owner`);
    const cleaned = repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => {
        const aa = a.pushed_at
            ? Date.parse(a.pushed_at)
            : 0;
        const bb = b.pushed_at
            ? Date.parse(b.pushed_at)
            : 0;
        return bb - aa;
    });
    if (cleaned.length > 0) {
        writeCache(REPO_LIST_CACHE_KEY, cleaned);
    }
    else {
        try {
            localStorage.removeItem(REPO_LIST_CACHE_KEY);
        }
        catch {
        }
    }
    return cleaned;
}
export async function loadProjects() {
    const repos = await fetchRepos();
    return Promise.all(repos.map(async (repo) => {
        const cardFiles = await loadRepoCardFiles(repo);
        const generatedTags = [
            ...(repo.topics || []),
            ...(repo.language
                ? [repo.language.toLowerCase()]
                : []),
        ];
        return {
            repo: repo.full_name,
            name: repo.name,
            description: cardFiles.description,
            href: repo.html_url,
            thumbnail: cardFiles.thumbnail ||
                `https://opengraph.githubassets.com/1/` +
                    `${repo.full_name}`,
            tags: Array.from(new Set(generatedTags)).slice(0, 5),
            stars: repo.stargazers_count,
            language: repo.language || undefined,
            license: formatLicense(repo),
        };
    }));
}
