import { router } from '@inertiajs/react';
import { AuthLayout } from '@/src/components/templates/AuthLayout';
import { LoginForm } from '@/src/components/organisms/auth/login-form';

const LoginPage = () => {
    return (
        <AuthLayout title="Sign in to your account">
            <LoginForm
                onForgotPassword={() => router.visit('/forgot-password')}
            />
        </AuthLayout>
    );
};

export default LoginPage;
