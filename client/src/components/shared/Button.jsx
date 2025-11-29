import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 border border-transparent',
        secondary: 'bg-slate-800/50 hover:bg-slate-800/80 text-slate-200 border border-slate-700 backdrop-blur-sm',
        ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200',
        danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
        icon: 'p-2 bg-slate-800/50 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 backdrop-blur-sm rounded-full aspect-square'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2'
    };

    return (
        <button
            ref={ref}
            className={twMerge(
                clsx(
                    baseStyles,
                    variants[variant],
                    variant !== 'icon' && sizes[size],
                    className
                )
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
