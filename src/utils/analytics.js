// Analytics Utility - Real-time tracking
export const trackPageView = async (page = window.location.pathname) => {
    try {
        const device = getDeviceType();
        const browser = getBrowser();

        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'pageView',
                data: { page }
            })
        });

        // İlk ziyaret - visitor tracking
        if (!sessionStorage.getItem('visitor-tracked')) {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'visitor',
                    data: { device, browser, country: 'Unknown' }
                })
            });
            sessionStorage.setItem('visitor-tracked', 'true');
        }
    } catch (error) {
        console.log('Analytics not available:', error);
    }
};

export const trackProjectClick = async (projectTitle, projectLink) => {
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'projectClick',
                data: { project: projectTitle }
            })
        });

        console.log('📊 Project click tracked:', projectTitle);
    } catch (error) {
        console.log('Analytics not available:', error);
    }
};

// Helper functions
const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
};

const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
};
