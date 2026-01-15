// Vercel Blob Storage - Projects API (FIXED)
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

    try {
        // GET - Read projects from Blob
        if (req.method === 'GET') {
            try {
                // List all blobs and find projects.json
                const { blobs } = await list({ prefix: 'projects' });

                if (blobs.length > 0) {
                    // Get the latest projects blob
                    const projectsBlob = blobs.find(b => b.pathname.includes('projects'));
                    if (projectsBlob) {
                        const response = await fetch(projectsBlob.url);
                        const projects = await response.json();
                        return res.status(200).json({ success: true, projects });
                    }
                }

                // No blob found, return empty array
                console.log('No projects blob found, returning empty');
                return res.status(200).json({ success: true, projects: [] });

            } catch (err) {
                console.log('Blob read error, returning fallback:', err.message);
                return res.status(200).json({ success: true, projects: [] });
            }
        }

        // POST - Write projects to Blob
        if (req.method === 'POST') {
            const { projects, password } = req.body || {};

            // Password check
            const validPassword = process.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024';
            if (password !== validPassword) {
                return res.status(401).json({ success: false, error: 'Şifre yanlış' });
            }

            if (!projects || !Array.isArray(projects)) {
                return res.status(400).json({ success: false, error: 'Geçersiz proje verisi' });
            }

            // Save to Blob
            const blob = await put('projects.json', JSON.stringify(projects, null, 2), {
                access: 'public',
                addRandomSuffix: false,
                contentType: 'application/json'
            });

            console.log('✅ Projects saved to Blob:', blob.url);

            return res.status(200).json({
                success: true,
                message: 'Projeler kaydedildi!',
                count: projects.length,
                url: blob.url
            });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });

    } catch (error) {
        console.error('Projects API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Sunucu hatası',
            details: error.message
        });
    }
};
