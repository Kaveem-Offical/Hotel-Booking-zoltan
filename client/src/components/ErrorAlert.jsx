import React, { useState, useEffect } from 'react';
import { AlertCircle, X, AlertTriangle, XCircle, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

/**
 * Beautiful large animated error alert component
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} props.type - Type of error: 'error' | 'warning' | 'info' | 'success'
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {function} props.onDismiss - Callback when dismissed
 * @param {function} props.onRetry - Callback for retry action (optional)
 * @param {string} props.title - Optional title for the error
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullWidth - Make the alert full width
 */
const ErrorAlert = ({
    message,
    type = 'error',
    dismissible = true,
    onDismiss,
    onRetry,
    title,
    className = '',
    fullWidth = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [iconBounce, setIconBounce] = useState(true);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 50);

        // Stop icon bounce after initial animation
        const bounceTimer = setTimeout(() => setIconBounce(false), 2000);

        return () => {
            clearTimeout(timer);
            clearTimeout(bounceTimer);
        };
    }, []);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss?.();
        }, 400);
    };

    // Configuration based on type
    const config = {
        error: {
            icon: XCircle,
            gradient: 'from-red-500 via-rose-500 to-pink-500',
            bgGradient: 'from-red-50 via-rose-50 to-pink-50 dark:from-red-950/60 dark:via-rose-950/50 dark:to-pink-950/40',
            borderGradient: 'from-red-300 via-rose-300 to-pink-300 dark:from-red-700 dark:via-rose-700 dark:to-pink-700',
            iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
            titleColor: 'text-red-800 dark:text-red-100',
            textColor: 'text-red-700 dark:text-red-200',
            glowColor: 'rgba(239, 68, 68, 0.4)',
            particleColor: 'bg-red-400'
        },
        warning: {
            icon: AlertTriangle,
            gradient: 'from-amber-500 via-orange-500 to-yellow-500',
            bgGradient: 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/60 dark:via-orange-950/50 dark:to-yellow-950/40',
            borderGradient: 'from-amber-300 via-orange-300 to-yellow-300 dark:from-amber-700 dark:via-orange-700 dark:to-yellow-700',
            iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
            titleColor: 'text-amber-800 dark:text-amber-100',
            textColor: 'text-amber-700 dark:text-amber-200',
            glowColor: 'rgba(245, 158, 11, 0.4)',
            particleColor: 'bg-amber-400'
        },
        info: {
            icon: AlertCircle,
            gradient: 'from-blue-500 via-indigo-500 to-purple-500',
            bgGradient: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/60 dark:via-indigo-950/50 dark:to-purple-950/40',
            borderGradient: 'from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700',
            iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            titleColor: 'text-blue-800 dark:text-blue-100',
            textColor: 'text-blue-700 dark:text-blue-200',
            glowColor: 'rgba(59, 130, 246, 0.4)',
            particleColor: 'bg-blue-400'
        },
        success: {
            icon: CheckCircle2,
            gradient: 'from-green-500 via-emerald-500 to-teal-500',
            bgGradient: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/60 dark:via-emerald-950/50 dark:to-teal-950/40',
            borderGradient: 'from-green-300 via-emerald-300 to-teal-300 dark:from-green-700 dark:via-emerald-700 dark:to-teal-700',
            iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
            titleColor: 'text-green-800 dark:text-green-100',
            textColor: 'text-green-700 dark:text-green-200',
            glowColor: 'rgba(34, 197, 94, 0.4)',
            particleColor: 'bg-green-400'
        }
    };

    const currentConfig = config[type] || config.error;
    const Icon = currentConfig.icon;
    const defaultTitle = type === 'error' ? 'Oops! Something went wrong'
        : type === 'warning' ? 'Heads up!'
            : type === 'success' ? 'Success!'
                : 'Notice';

    return (
        <div
            role="alert"
            className={`
                relative overflow-hidden rounded-2xl
                ${fullWidth ? 'w-full' : 'max-w-2xl mx-auto'}
                transform transition-all duration-500 ease-out
                ${isVisible && !isExiting
                    ? 'opacity-100 translate-y-0 scale-100'
                    : isExiting
                        ? 'opacity-0 translate-y-4 scale-95'
                        : 'opacity-0 -translate-y-8 scale-90'}
                ${className}
            `}
            style={{
                boxShadow: isVisible ? `0 20px 60px -15px ${currentConfig.glowColor}, 0 10px 30px -10px ${currentConfig.glowColor}` : 'none'
            }}
        >
            {/* Animated gradient border */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentConfig.borderGradient} rounded-2xl p-[2px] animate-gradient-x`}>
                <div className={`absolute inset-[2px] bg-gradient-to-br ${currentConfig.bgGradient} rounded-2xl backdrop-blur-xl`} />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 ${currentConfig.particleColor} rounded-full opacity-30 animate-float-particle`}
                        style={{
                            left: `${15 + i * 15}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: `${3 + i * 0.5}s`
                        }}
                    />
                ))}
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer-slide" />
            </div>

            {/* Main content */}
            <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                    {/* Large animated icon */}
                    <div className="relative flex-shrink-0">
                        {/* Pulsing ring */}
                        <div className={`absolute inset-0 ${currentConfig.iconBg} rounded-2xl opacity-30 animate-ping-slow`} />

                        {/* Icon container */}
                        <div
                            className={`
                                relative w-16 h-16 md:w-20 md:h-20 rounded-2xl ${currentConfig.iconBg}
                                flex items-center justify-center shadow-2xl
                                ${iconBounce ? 'animate-bounce-in' : ''}
                            `}
                            style={{
                                boxShadow: `0 10px 40px -10px ${currentConfig.glowColor}`
                            }}
                        >
                            <Icon
                                size={36}
                                className="text-white drop-shadow-lg animate-icon-shake"
                                strokeWidth={2}
                            />

                            {/* Sparkle effects */}
                            <Sparkles
                                size={14}
                                className="absolute -top-1 -right-1 text-white opacity-80 animate-pulse"
                            />
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                        <h3 className={`
                            text-xl md:text-2xl font-bold ${currentConfig.titleColor} mb-2
                            animate-slide-in-right
                        `}>
                            {title || defaultTitle}
                        </h3>
                        <p className={`
                            text-base md:text-lg ${currentConfig.textColor} leading-relaxed
                            animate-slide-in-right animation-delay-100
                        `}>
                            {message}
                        </p>

                        {/* Action buttons */}
                        {onRetry && (
                            <div className="mt-5 flex flex-wrap gap-3 animate-slide-in-right animation-delay-200">
                                <button
                                    onClick={onRetry}
                                    className={`
                                        inline-flex items-center gap-2 px-6 py-3
                                        text-base font-semibold text-white rounded-xl
                                        bg-gradient-to-r ${currentConfig.gradient}
                                        hover:shadow-lg hover:scale-105
                                        active:scale-95
                                        transition-all duration-200
                                        group
                                    `}
                                    style={{
                                        boxShadow: `0 4px 20px -5px ${currentConfig.glowColor}`
                                    }}
                                >
                                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dismiss button */}
                    {dismissible && (
                        <button
                            onClick={handleDismiss}
                            className={`
                                absolute top-4 right-4 md:relative md:top-0 md:right-0
                                flex-shrink-0 p-2 rounded-xl
                                ${currentConfig.textColor}
                                hover:bg-white/30 dark:hover:bg-white/10
                                transition-all duration-300
                                hover:scale-110 hover:rotate-90
                                active:scale-90
                            `}
                            aria-label="Dismiss"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            {/* Animated progress bar at bottom */}
            <div className="relative h-1.5 bg-black/5 dark:bg-white/5 overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${currentConfig.gradient} animate-progress-expand`}
                />
            </div>
        </div>
    );
};

export default ErrorAlert;
