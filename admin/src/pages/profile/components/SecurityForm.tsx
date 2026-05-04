import { useState } from 'react';
import { Controller } from 'react-hook-form';
import ActionButton from '../../../components/ActionButton';
import Alert from '../../../components/Alert';
import FormInput from '../../../components/form/FormInput';
import { useChangePasswordMutation } from '../../../store/api/authApi';

const SecurityForm = ({ pwControl, handlePwSubmit, pwErrors, pwIsSubmitting, resetPw }: any) => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    const onFormSubmit = async (data: any) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        try {
            const res = await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            }).unwrap();
            setSuccessMessage(res.message || 'Password changed successfully');
            setErrorMessage(null);
            // Reset the form after successful password change
            resetPw();
        } catch (err: any) {
            setErrorMessage(err?.data?.message || err?.message || 'Failed to change password');
            setSuccessMessage(null);
        }
    };

    return (
        <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow p-8">
            <h2 className="text-xl font-bold mb-6">Security</h2>
            {successMessage && <Alert type="success" title="Success" message={successMessage} />}
            {errorMessage && <Alert type="danger" title="Error" message={errorMessage} />}
            <form className="space-y-6" onSubmit={handlePwSubmit(onFormSubmit)}>
                <Controller
                    name="currentPassword"
                    control={pwControl}
                    render={({ field }) => (
                        <FormInput id="currentPassword" type="password" label="Current Password" error={pwErrors.currentPassword?.message} placeholder="Enter current password" {...field} />
                    )}
                />
                <Controller
                    name="newPassword"
                    control={pwControl}
                    render={({ field }) => <FormInput id="newPassword" type="password" label="New Password" error={pwErrors.newPassword?.message} placeholder="Enter new password" {...field} />}
                />
                <Controller
                    name="confirmPassword"
                    control={pwControl}
                    render={({ field }) => (
                        <FormInput id="confirmPassword" type="password" label="Confirm New Password" error={pwErrors.confirmPassword?.message} placeholder="Confirm new password" {...field} />
                    )}
                />
                <div className="flex justify-end">
                    <ActionButton type="submit" variant="primary" isLoading={pwIsSubmitting || isChangingPassword} displayText="Change Password" />
                </div>
            </form>
        </div>
    );
};

export default SecurityForm;
