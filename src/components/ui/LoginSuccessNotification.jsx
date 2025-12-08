import React, { useEffect, useState } from 'react';

export default function LoginSuccessNotification({ visible, onComplete }) {
	const [animationPhase, setAnimationPhase] = useState('initial');
	const [showConfetti, setShowConfetti] = useState(false);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (visible) {
			// Phase 1: Initial pop-in
			setAnimationPhase('pop-in');
			setShowConfetti(true);

			// Phase 2: Checkmark animation
			const phase2Timer = setTimeout(() => {
				setAnimationPhase('checkmark');
			}, 300);

			// Phase 3: Progress bar
			const progressInterval = setInterval(() => {
				setProgress(prev => {
					if (prev >= 100) {
						clearInterval(progressInterval);
						// Final phase
						setTimeout(() => {
							setAnimationPhase('complete');
							onComplete?.();
						}, 300);
						return 100;
					}
					return prev + 5;
				});
			}, 50);

			// Hide confetti after animation
			const confettiTimer = setTimeout(() => {
				setShowConfetti(false);
			}, 1500);

			return () => {
				clearTimeout(phase2Timer);
				clearTimeout(confettiTimer);
				clearInterval(progressInterval);
			};
		} else {
			setAnimationPhase('initial');
			setProgress(0);
			setShowConfetti(false);
		}
	}, [visible, onComplete]);

	if (!visible) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
			{/* Confetti */}
			{showConfetti && (
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					{[...Array(12)].map((_, i) => (
						<div
							key={i}
							className="absolute animate-bounce"
							style={{
								left: `${10 + (i * 8)}%`,
								top: `${Math.random() * 60}%`,
								animationDelay: `${i * 0.1}s`,
								animationDuration: `${1.5 + Math.random()}s`
							}}
						>
							{['🎉', '✨', '⭐', '🎊', '💫', '🌟'][i % 6]}
						</div>
					))}
				</div>
			)}

			{/* Main Card */}
			<div className={`relative bg-white border-4 border-neo-black p-8 max-w-md w-full transform transition-all duration-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
				animationPhase === 'pop-in' ? 'scale-0' :
				animationPhase === 'checkmark' ? 'scale-105' :
				animationPhase === 'complete' ? 'scale-95 opacity-0' :
				'scale-100'
			}`}>
				{/* Content */}
				<div className="relative z-10 text-center">
					{/* Success Icon Container */}
					<div className="inline-flex items-center justify-center w-20 h-20 bg-neo-flame rounded-full mb-6 border-4 border-neo-black transform transition-all duration-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
						<svg
							className={`w-10 h-10 text-white transform transition-all duration-500 ${
								animationPhase === 'pop-in' ? 'scale-0' :
								animationPhase === 'checkmark' ? 'scale-100' :
								'scale-100'
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={3}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					{/* Success Message */}
					<h2 className="text-2xl font-black text-neo-black mb-2 uppercase tracking-tight">
						¡Bienvenido de nuevo!
					</h2>
					<p className="text-neo-black font-medium mb-6">
						Inicio de sesión exitoso. Redirigiendo al dashboard...
					</p>

					{/* Progress Bar */}
					<div className="w-full bg-gray-200 h-4 border-2 border-neo-black mb-4 relative overflow-hidden">
						<div
							className="h-full bg-neo-green transition-all duration-300 ease-out"
							style={{ width: `${progress}%` }}
						></div>
					</div>

					{/* Progress Text */}
					<p className="text-sm font-bold text-neo-black uppercase">
						{animationPhase === 'complete' ? '¡Listo!' : `${progress}% completado`}
					</p>

					{/* Loading Dots */}
					{animationPhase !== 'complete' && (
						<div className="flex justify-center gap-2 mt-4">
							{[0, 1, 2].map((i) => (
								<div
									key={i}
									className="w-3 h-3 bg-neo-black rounded-full animate-bounce"
									style={{ animationDelay: `${i * 0.15}s` }}
								></div>
							))}
						</div>
					)}
				</div>

				 {/* Decorative Elements */}
				<div className="absolute -top-3 -right-3 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent border-r-neo-flame transform rotate-45"></div>
				<div className="absolute -bottom-3 -left-3 w-0 h-0 border-b-[20px] border-l-[20px] border-b-transparent border-l-neo-green transform rotate-45"></div>
			</div>
		</div>
	);
}