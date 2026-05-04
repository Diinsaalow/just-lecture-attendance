import { authApi } from '../store/api/authApi';

export const authService = {
    updateProfile: async (profileData: any) => {
        return await authApi.endpoints.updateProfile.initiate(profileData);
    },
    changePassword: async (passwordData: any) => {
        return await authApi.endpoints.changePassword.initiate(passwordData);
    },
    updateProfilePicture: async (file: File) => {
        return await authApi.endpoints.updateProfilePicture.initiate(file);
    },
};
