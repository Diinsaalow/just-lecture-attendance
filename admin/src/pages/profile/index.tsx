import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { useGetUserInfoQuery } from '../../store/api/authApi';
import { updateUser as updateUserAction } from '../../store/slices/authSlice';
import { IUser } from '../../types';
import { ProfilePageSkeleton } from '../../components/skeleton';
import GeneralInfoForm from './components/GeneralInfoForm';
import SecurityForm from './components/SecurityForm';
import TwoFactorAuthSettings from './components/TwoFactorAuthSettings';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(255),
    lastName: z.string().min(1, 'Last name is required').max(255),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    phone: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    profileImage: z.any().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
    .object({
        currentPassword: z.string().min(8, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { data: userData, isLoading } = useGetUserInfoQuery();
    const userFromStore = useSelector((state: any) => state.auth.user) as IUser;

    // Use API data if available, otherwise fall back to store data
    const user = userData || userFromStore;
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Profile form
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            bio: user?.bio || '',
            address: user?.address || '',
            profileImage: user?.profileImage || null,
        },
    });

    // Password form
    const {
        control: pwControl,
        handleSubmit: handlePwSubmit,
        reset: resetPw,
        formState: { errors: pwErrors, isSubmitting: pwIsSubmitting },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (user) {
            console.log('Profile user data:', user);
            console.log('Profile image URL:', user.profileImage);
            reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                address: user.address || '',
                profileImage: user.profileImage || null,
            });
            setImageFile(null);
        }
    }, [user, reset]);

    // Handle profile update
    const onSubmit = async (data: ProfileFormData) => {
        setGeneralError(null);
        setSuccessMessage(null);
        try {
            const updatedUser = {
                ...user,
                ...data,
                phone: data.phone || undefined,
                bio: data.bio || undefined,
                address: data.address || undefined,
                profileImage: data.profileImage || undefined,
            };
            dispatch(updateUserAction(updatedUser));
            setSuccessMessage('Profile updated successfully.');
        } catch (err: any) {
            setGeneralError(err.message || 'Failed to update profile.');
        }
    };

    // Handle password change
    const onPasswordSubmit = async (data: PasswordFormData) => {
        setGeneralError(null);
        setSuccessMessage(null);
        try {
            setSuccessMessage('Password changed successfully (placeholder).');
            resetPw();
        } catch (err: any) {
            setGeneralError(err.message || 'Failed to change password.');
        }
    };

    if (isLoading) return <ProfilePageSkeleton />;

    return (
        <div className="space-y-6">
            <GeneralInfoForm
                control={control}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                errors={errors}
                isSubmitting={isSubmitting}
                generalError={generalError}
                successMessage={successMessage}
                imageFile={imageFile}
                setImageFile={setImageFile}
                user={user}
            />
            <SecurityForm pwControl={pwControl} handlePwSubmit={handlePwSubmit} onPasswordSubmit={onPasswordSubmit} pwErrors={pwErrors} pwIsSubmitting={pwIsSubmitting} resetPw={resetPw} />
            <TwoFactorAuthSettings />
        </div>
    );
};

export default ProfilePage;
