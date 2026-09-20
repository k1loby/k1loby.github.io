import { useEffect, useState } from "react";
import { loadProjects, } from "../content/projects.js";
export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        loadProjects()
            .then((items) => {
            if (cancelled)
                return;
            setProjects(items);
        })
            .catch((reason) => {
            if (cancelled)
                return;
            const message = reason instanceof Error
                ? reason.message
                : "could not load github repositories";
            setProjects([]);
            setError(message);
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    return { projects, loading, error };
}
