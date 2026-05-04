import { z } from 'zod';

const passcodeRegex = /^\d{6,9}$/;

export const loginSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(64, 'Username must be at most 64 characters'),
    passcode: z
        .string()
        .min(1, 'Passcode is required')
        .regex(passcodeRegex, 'Passcode must be 6–9 digits'),
    rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
