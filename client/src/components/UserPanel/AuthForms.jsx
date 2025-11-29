import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import authService from '../../services/authService';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const AuthForms = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const user = isLogin
                ? await authService.login(data.email, data.password)
                : await authService.register(data);
            onLogin(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        reset();
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-sm text-slate-400">
                    {isLogin
                        ? 'Enter your credentials to access your account'
                        : 'Join us to contribute to the map'}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!isLogin && (
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        leftIcon={<User size={16} />}
                        error={errors.name?.message}
                        {...register('name')}
                    />
                )}

                <Input
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    leftIcon={<Mail size={16} />}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock size={16} />}
                    error={errors.password?.message}
                    {...register('password')}
                />

                {!isLogin && (
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        leftIcon={<Lock size={16} />}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />
                )}

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight size={16} />}
                >
                    {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
            </form>

            <div className="text-center">
                <button
                    onClick={toggleMode}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
            </div>
        </div>
    );
};

export default AuthForms;
