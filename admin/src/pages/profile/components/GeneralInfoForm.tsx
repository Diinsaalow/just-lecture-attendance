import { Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Camera, X } from 'lucide-react';
import { useState } from 'react';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import { useUpdateProfileMutation, useUpdateProfilePictureMutation } from '../../../store/api/authApi';

const GeneralInfoForm = ({ control, handleSubmit, onSubmit, errors, isSubmitting, imageFile, setImageFile, user }: any) => {
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

    // Profile info update mutation
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

    // Profile picture update mutation
    const [updateProfilePicture, { isLoading: isUpdatingPicture }] = useUpdateProfilePictureMutation();

    // Debug logging
    console.log('GeneralInfoForm user:', user);
    console.log('GeneralInfoForm user.profileImage:', user?.profileImage);

    const onFormSubmit = async (data: any) => {
        let profileImageUrl = user?.profileImage;

        // If user wants to remove current image, set to null
        if (removeCurrentImage) {
            profileImageUrl = null;
        }

        // If a new image is selected, upload it first
        if (imageFile && imageFile instanceof File) {
            try {
                const res = await updateProfilePicture(imageFile).unwrap();
                profileImageUrl = res.profileImage;
                setImageFile(null); // Clear after upload
                setRemoveCurrentImage(false); // Reset remove flag
                toast.success('Profile picture updated successfully');
            } catch (err: any) {
                // Display the exact backend error message
                const errorMessage = err?.data?.message || err?.message || 'Failed to update profile picture';
                toast.error(errorMessage);
                return;
            }
        }

        // Update profile info
        try {
            await updateProfile({
                ...data,
                profileImage: profileImageUrl,
            }).unwrap();
            onSubmit(data); // call parent handler for success message
            setRemoveCurrentImage(false); // Reset remove flag after successful update
            toast.success('Profile updated successfully');
        } catch (err: any) {
            // Display the exact backend error message
            const errorMessage = err?.data?.message || err?.message || 'Failed to update profile';
            toast.error(errorMessage);
        }
    };

    return (
        <form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-8 mb-8 bg-white dark:bg-black w-full" onSubmit={handleSubmit(onFormSubmit)}>
            <h6 className="text-lg font-bold mb-5">General Information</h6>
            <div className="flex flex-col md:flex-row items-start">
                {/* Profile Image */}
                <div className="md:mr-8 w-32 h-32 mb-5 flex justify-center items-start self-start">
                    <div className="relative">
                        {/* Image Preview */}
                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="Profile preview" className="w-full h-full object-cover" />
                            ) : user?.profileImage && !removeCurrentImage ? (
                                <>
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Failed to load profile image:', user.profileImage);
                                            e.currentTarget.style.display = 'none';
                                            // Show camera icon as fallback
                                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                            if (fallback) {
                                                (fallback as HTMLElement).style.display = 'flex';
                                            }
                                        }}
                                    />
                                    <div className="fallback-icon w-full h-full flex items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                                        <Camera className="h-8 w-8 text-gray-400" />
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <label
                            htmlFor="profile_image"
                            className="absolute bottom-0 right-0 w-8 h-8 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg z-10 transition-colors border-2 border-white"
                        >
                            <Camera className="h-4 w-4 text-white" />
                            <input
                                id="profile_image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        // Check file size (5MB = 5 * 1024 * 1024 bytes)
                                        const maxSize = 5 * 1024 * 1024;
                                        if (file.size > maxSize) {
                                            toast.error('File size must be less than 5MB');
                                            // Reset the file input
                                            e.target.value = '';
                                            return;
                                        }
                                        setImageFile(file);
                                    }
                                }}
                            />
                        </label>

                        {/* Remove Button */}
                        {(imageFile || (user?.profileImage && !removeCurrentImage)) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setImageFile(null);
                                    setRemoveCurrentImage(true);
                                    // Reset file input
                                    const fileInput = document.getElementById('profile_image') as HTMLInputElement;
                                    if (fileInput) fileInput.value = '';
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="h-3 w-3 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Error Message */}
                    {errors.profileImage?.message && <p className="mt-2 text-sm text-red-500">{errors.profileImage.message}</p>}
                </div>
                {/* Fields */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor="firstName" className="block mb-1 font-medium">
                                    First Name
                                </label>
                                <FormInput id="firstName" label="" error={errors.firstName?.message} placeholder="Enter your first name" className="w-full" {...field} />
                            </div>
                        )}
                    />
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor="lastName" className="block mb-1 font-medium">
                                    Last Name
                                </label>
                                <FormInput id="lastName" label="" error={errors.lastName?.message} placeholder="Enter your last name" className="w-full" {...field} />
                            </div>
                        )}
                    />
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor="email" className="block mb-1 font-medium">
                                    Email
                                </label>
                                <FormInput id="email" label="" error={errors.email?.message} placeholder="Enter your email" className="w-full" {...field} />
                            </div>
                        )}
                    />
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor="phone" className="block mb-1 font-medium">
                                    Phone
                                </label>
                                <FormInput
                                    id="phone"
                                    label=""
                                    error={typeof errors.phone?.message === 'string' ? errors.phone.message : undefined}
                                    placeholder="Enter your phone number"
                                    className="w-full"
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            </div>
                        )}
                    />
                    <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => (
                            <div className="md:col-span-2">
                                <label htmlFor="bio" className="block mb-1 font-medium">
                                    Bio
                                </label>
                                <FormInput
                                    id="bio"
                                    label=""
                                    error={typeof errors.bio?.message === 'string' ? errors.bio.message : undefined}
                                    placeholder="Tell us about yourself"
                                    className="w-full"
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            </div>
                        )}
                    />
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block mb-1 font-medium">
                                    Address
                                </label>
                                <FormInput
                                    id="address"
                                    label=""
                                    error={typeof errors.address?.message === 'string' ? errors.address.message : undefined}
                                    placeholder="Enter your address"
                                    className="w-full"
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            </div>
                        )}
                    />
                </div>
            </div>
            <div className="mt-6 flex">
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting || isUpdatingProfile || isUpdatingPicture} displayText="Save" />
            </div>
        </form>
    );
};

export default GeneralInfoForm;
