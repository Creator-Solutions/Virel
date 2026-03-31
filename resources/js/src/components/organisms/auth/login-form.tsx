import { useFormik } from 'formik';
import { router } from '@inertiajs/react';
import { Input } from '@/src/components/atoms/input';
import { PasswordField } from '@/src/components/molecules/auth/password-field';
import { useAuthStore } from '@/store/auth.store';
import type { LoginFormValues } from '@/domains/auth/auth.schema';
import { loginSchema } from '@/domains/auth/auth.schema';
import { validateWithZod } from '@/lib/utils';
import Git from '@/images/github.svg';

interface LoginFormProps {
    onForgotPassword?: () => void;
}

function LoginForm({ onForgotPassword }: LoginFormProps) {
    const { isLoading, error, loginWithGithub } = useAuthStore();

    const formik = useFormik<LoginFormValues>({
        initialValues: {
            email: '',
            password: '',
        },
        validate: validateWithZod(loginSchema),
        onSubmit: () => {},
    });

    const handleSubmit = async () => {
        await formik.setTouched({ email: true, password: true });
        const errors = await formik.validateForm();

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            router.post('/login', formik.values);
        } catch (err: unknown) {
            const serverError = err as {
                errors?: { email?: string[]; password?: string[] };
            };

            if (serverError?.errors) {
                formik.setFieldError('email', serverError.errors.email?.[0]);
                formik.setFieldError(
                    'password',
                    serverError.errors.password?.[0],
                );
            }
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <p className="text-center text-sm text-virel-errorText">
                    {error}
                </p>
            )}

            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-virel-text"
                >
                    Email address
                </label>
                <div className="mt-2">
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                            formik.touched.email && formik.errors.email
                                ? 'border-virel-errorText'
                                : 'text-white'
                        }
                    />
                </div>
                {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-sm text-virel-errorText">
                        {formik.errors.email}
                    </p>
                )}
            </div>

            <PasswordField
                id="password"
                label="Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="password"
                className="text-white"
                error={
                    formik.touched.password ? formik.errors.password : undefined
                }
                forgotPassword={onForgotPassword}
            />

            <button
                type="button"
                disabled={isLoading}
                className="btn-primary w-full"
                onClick={handleSubmit}
            >
                {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
                type="button"
                onClick={loginWithGithub}
                className="cu flex flex-row items-center gap-x-2 text-sm text-white"
            >
                <img src={Git} alt="Github" className="h-8 w-8 text-white" />
                Sign in with Github
            </button>
        </div>
    );
}

export { LoginForm };
export type { LoginFormProps };
