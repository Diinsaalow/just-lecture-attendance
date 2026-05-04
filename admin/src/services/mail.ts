import { storageUtil } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const getAuthToken = () => {
    return storageUtil.getToken();
};


export const mailApi = {
    getConfig: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/mail-config?limit=1&page=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch mail configuration');
        }
        const data = await response.json();
        return data.docs?.[0] || null;
    },

    updateConfig: async (configData: any) => {
        const token = getAuthToken();
        // First get the config to get the ID
        const config = await mailApi.getConfig();
        if (!config?._id) {
            throw new Error('Mail configuration not found');
        }

        const response = await fetch(`${API_BASE_URL}/mail-config/${config._id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        return await response.json();
    },

    sendTestEmail: async (data: { test_email: string }) => {
        const token = getAuthToken();
        // First get the config to get the ID
        const config = await mailApi.getConfig();
        if (!config?._id) {
            throw new Error('Mail configuration not found');
        }

        const response = await fetch(`${API_BASE_URL}/mail-config/test`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mailConfigId: config._id,
                toEmail: data.test_email,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        return await response.json();
    },
};

