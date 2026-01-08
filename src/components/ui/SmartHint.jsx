import React from "react";

/**
 * SmartHint - Contextual hint card to guide users through actions
 * 
 * @param {string} icon - Emoji or icon
 * @param {string} title - Main hint title
 * @param {string} description - Brief description
 * @param {string} actionLabel - CTA button text
 * @param {function} onAction - Callback when CTA is clicked
 * @param {function} onDismiss - Callback to dismiss hint
 * @param {string} variant - Color variant: 'default' | 'success' | 'warning'
 */
export default function SmartHint({
    icon = "💡",
    title,
    description,
    actionLabel,
    onAction,
    onDismiss,
    variant = "default",
}) {
    const bgColors = {
        default: "bg-gradient-to-r from-neo-sunset/20 to-neo-yellow/20",
        success: "bg-gradient-to-r from-green-100 to-green-50",
        warning: "bg-gradient-to-r from-amber-100 to-amber-50",
    };

    return (
        <div
            className={`${bgColors[variant]} border-2 border-neo-black rounded-lg p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-fadeIn relative`}
        >
            {/* Dismiss button */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 text-gray-500 hover:text-neo-black transition-colors p-1 rounded-full hover:bg-white/50"
                    aria-label="Descartar"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            <div className="flex items-start gap-3 pr-6">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">{icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-neo-black text-sm mb-0.5">{title}</h4>
                    {description && (
                        <p className="text-xs text-gray-600 mb-2">{description}</p>
                    )}

                    {/* CTA Button */}
                    {actionLabel && onAction && (
                        <button
                            onClick={onAction}
                            className="neo-btn neo-btn-primary text-xs py-1.5 px-3"
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
