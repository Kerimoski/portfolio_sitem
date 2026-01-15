// Vercel Blob Storage - Analytics API (FIXED)
const { put, list } = require('@vercel/blob');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const defaultAnalytics = {
        pageViews: {},
        projectClicks: {},
        visitors: { daily: [], total: 0 },
        devices: { desktop: 0, mobile: 0, tablet: 0 },
        browsers: {},
        countries: {}
    };

    try {
        // GET - Read analytics from Blob
        if (req.method === 'GET') {
            try {
                const { blobs } = await list({ prefix: 'analytics' });

                if (blobs.length > 0) {
                    const analyticsBlob = blobs.find(b => b.pathname.includes('analytics'));
                    if (analyticsBlob) {
                        const response = await fetch(analyticsBlob.url);
                        const analytics = await response.json();
                        return res.status(200).json({ success: true, analytics });
                    }
                }

                return res.status(200).json({ success: true, analytics: defaultAnalytics });

            } catch (err) {
                console.log('Analytics read error:', err.message);
                return res.status(200).json({ success: true, analytics: defaultAnalytics });
            }
        }

        // POST - Update analytics in Blob
        if (req.method === 'POST') {
            const { event, data } = req.body || {};

            if (!event) {
                return res.status(400).json({ success: false, error: 'Event required' });
            }

            // Get current analytics
            let analytics = { ...defaultAnalytics };

            try {
                const { blobs } = await list({ prefix: 'analytics' });
                if (blobs.length > 0) {
                    const analyticsBlob = blobs.find(b => b.pathname.includes('analytics'));
                    if (analyticsBlob) {
                        const response = await fetch(analyticsBlob.url);
                        analytics = await response.json();
                    }
                }
            } catch (err) {
                console.log('Creating new analytics');
            }

            // Update based on event
            const today = new Date().toISOString().split('T')[0];

            switch (event) {
                case 'pageView':
                    const page = data?.page || '/';
                    analytics.pageViews = analytics.pageViews || {};
                    analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;
                    break;

                case 'projectClick':
                    const project = data?.project || 'Unknown';
                    analytics.projectClicks = analytics.projectClicks || {};
                    analytics.projectClicks[project] = (analytics.projectClicks[project] || 0) + 1;
                    break;

                case 'visitor':
                    analytics.visitors = analytics.visitors || { daily: [], total: 0 };
                    analytics.visitors.total = (analytics.visitors.total || 0) + 1;

                    const dailyIndex = (analytics.visitors.daily || []).findIndex(d => d.date === today);
                    if (dailyIndex >= 0) {
                        analytics.visitors.daily[dailyIndex].count += 1;
                    } else {
                        analytics.visitors.daily = analytics.visitors.daily || [];
                        analytics.visitors.daily.push({ date: today, count: 1 });
                    }

                    if (data?.device) {
                        analytics.devices = analytics.devices || {};
                        analytics.devices[data.device] = (analytics.devices[data.device] || 0) + 1;
                    }

                    if (data?.browser) {
                        analytics.browsers = analytics.browsers || {};
                        analytics.browsers[data.browser] = (analytics.browsers[data.browser] || 0) + 1;
                    }
                    break;
            }

            // Save to Blob
            await put('analytics.json', JSON.stringify(analytics, null, 2), {
                access: 'public',
                addRandomSuffix: false,
                contentType: 'application/json'
            });

            return res.status(200).json({ success: true, message: 'Analytics updated' });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Sunucu hatası',
            details: error.message
        });
    }
};
