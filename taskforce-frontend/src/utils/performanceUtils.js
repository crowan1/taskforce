export const cleanupStorage = () => {
    try {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000;
        Object.keys(sessionStorage).forEach(key => {
            try {
                const item = sessionStorage.getItem(key);
                if (item) {
                    const parsed = JSON.parse(item);
                    if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
                        sessionStorage.removeItem(key);
                    }
                }
            } catch (e) {}
        });

        const sessionStorageSize = JSON.stringify(sessionStorage).length;
        
        if (sessionStorageSize > 2 * 1024 * 1024) {
            const essentialKeys = ['token', 'user', 'refreshToken'];
            const backup = {};
            essentialKeys.forEach(key => {
                if (sessionStorage.getItem(key)) {
                    backup[key] = sessionStorage.getItem(key);
                }
            });
            
            sessionStorage.clear();
            Object.entries(backup).forEach(([key, value]) => {
                sessionStorage.setItem(key, value);
            });
        }
        
    } catch (error) {}
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

export const preloadCriticalData = async () => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        
        const { dashboardServices } = await import('../services/dashboard/dashboardServices');
        dashboardServices.getProjects().catch(() => {});
        
    } catch (error) {}
};

export const optimizeImages = () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.loading) {
            img.loading = 'lazy';
        }
    });
};

export const initPerformanceOptimizations = () => {
    cleanupStorage();
    setInterval(cleanupStorage, 30 * 60 * 1000);
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', optimizeImages);
    } else {
        optimizeImages();
    }
    
    setTimeout(preloadCriticalData, 2000);
};
