import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(64, 'Username must be at most 64 characters'),
    passcode: z.string().min(8, 'Passcode must be 8 characters long').max(16, 'Passcode must be at most 16 characters'),
    rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
