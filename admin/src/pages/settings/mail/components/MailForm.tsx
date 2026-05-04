import { SendHorizonal } from "lucide-react";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import ActionButton from "../../../../components/ActionButton";
import FormInput from "../../../../components/form/FormInput";
import { MailConfigFormData } from "../index";

interface MailFormProps {
    control: Control<MailConfigFormData>;
    errors: FieldErrors<MailConfigFormData>;
    isLoading: boolean;
    isSubmitting: boolean;
    isPending: boolean;
    generalError: string | null;
    onSubmit: (e?: React.BaseSyntheticEvent) => void;
    showTestButton?: boolean;
    onShowTestModal?: () => void;
}

const MailForm: React.FC<MailFormProps> = ({
    control,
    errors,
    isLoading,
    isSubmitting,
    isPending,
    generalError,
    onSubmit,
    showTestButton,
    onShowTestModal,
}) => (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Controller
                name="host"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="mail_host"
                        label="Mail Host *"
                        error={errors.host?.message}
                        disabled={isLoading || isSubmitting || isPending}
                        {...field}
                    />
                )}
            />
            <Controller
                name="port"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="mail_port"
                        label="Mail Port *"
                        type="number"
                        error={errors.port?.message}
                        disabled={isLoading || isSubmitting || isPending}
                        value={field.value?.toString() || ""}
                        onChange={(value) => field.onChange(parseInt(value) || 0)}
                        onBlur={field.onBlur}
                    />
                )}
            />
            <Controller
                name="user"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="mail_user"
                        label="Mail Username *"
                        error={errors.user?.message}
                        disabled={isLoading || isSubmitting || isPending}
                        {...field}
                    />
                )}
            />
            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="mail_password"
                        label="Mail Password"
                        type="password"
                        error={errors.password?.message}
                        disabled={isLoading || isSubmitting || isPending}
                        autoComplete="new-password"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                )}
            />
            <Controller
                name="fromName"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="mail_from_name"
                        label="Mail From Name *"
                        error={errors.fromName?.message}
                        disabled={isLoading || isSubmitting || isPending}
                        {...field}
                    />
                )}
            />
            <Controller
                name="fromEmail"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="mail_from_email"
                        label="Mail From Email *"
                        error={errors.fromEmail?.message}
                        disabled={isLoading || isSubmitting || isPending}
                        {...field}
                    />
                )}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mail Encryption *
            </label>
            <Controller
                name="secure"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="true"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                disabled={isLoading || isSubmitting || isPending}
                                className="form-radio text-primary"
                            />
                            <span className="text-sm">SSL</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="false"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                                disabled={isLoading || isSubmitting || isPending}
                                className="form-radio text-primary"
                            />
                            <span className="text-sm">TLS</span>
                        </label>
                        {errors.secure?.message && (
                            <span className="text-red-500 text-sm ml-4">{errors.secure.message}</span>
                        )}
                    </div>
                )}
            />
        </div>

        {generalError && (
            <div className="text-red-500 text-sm">{generalError}</div>
        )}

        <div className="flex gap-3 pt-4">
            <ActionButton
                type="submit"
                variant="primary"
                isLoading={isSubmitting || isPending}
                displayText="Save"
            />

            {showTestButton && onShowTestModal && (
                <ActionButton
                    type="button"
                    variant="info"
                    displayText="Send Test Email"
                    onClick={onShowTestModal}
                    disabled={isLoading || isSubmitting || isPending}
                    iconLeft={<SendHorizonal size={16} />}
                />
            )}
        </div>
    </form>
);

export default MailForm;
