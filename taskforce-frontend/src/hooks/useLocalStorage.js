import { useState, useEffect } from 'react';

export const useLocalStorage = (key, defaultValue = null) => {
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    });

    const setStoredValue = (newValue) => {
        try {
            setValue(newValue);
            if (newValue === null || newValue === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(newValue));
            }
        } catch (error) {}
    };

    return [value, setStoredValue];
};

export const useApiCache = (cacheKey, apiCall, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const { data: cachedData, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < 5 * 60 * 1000) {
                        if (isMounted) {
                            setData(cachedData);
                            setLoading(false);
                        }
                        return;
                    }
                }
                
                const result = await apiCall();
                if (isMounted) {
                    setData(result);
                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        data: result,
                        timestamp: Date.now()
                    }));
                }
            } catch (err) {
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, dependencies);

    return { data, loading, error, refetch: () => {
        sessionStorage.removeItem(cacheKey);
        setLoading(true);
    }};
};
