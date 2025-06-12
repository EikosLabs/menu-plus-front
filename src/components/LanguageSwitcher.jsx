import React, { useState, useEffect } from "react";
import { changeLang, languages, useTranslation } from "../i18n/utils";

export default function LanguageSwitcher({ className = "" }) {
	const { t, currentLang } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className={`relative ${className}`}>
				<button className="flex items-center space-x-2 rounded-lg border border-slate-300 bg-white px-3 py-2 transition-colors hover:bg-slate-50">
					<svg
						className="h-5 w-5 text-slate-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 5h12M9 3v2m1.11 9.908l1.928-1.928"
						/>
					</svg>
					<span className="font-medium text-slate-700 text-sm">...</span>
				</button>
			</div>
		);
	}

	const handleLanguageChange = (lang) => {
		changeLang(lang);
		setIsOpen(false);
	};

	const currentLanguageName = languages[currentLang] || languages.es;
	const availableLanguages = Object.entries(languages).filter(
		([code]) => code !== currentLang,
	);

	return (
		<div className={`relative ${className}`}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 rounded-lg border border-slate-300 bg-white px-3 py-2 transition-colors hover:bg-slate-50 focus:border-[#E05C33] focus:outline-none focus:ring-2 focus:ring-[#E05C33]"
				aria-haspopup="true"
				aria-expanded={isOpen}
			>
				<svg
					className="h-5 w-5 text-slate-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 5h12M9 3v2m1.11 9.908l1.928-1.928M21 14l-5.5 5.5L12 16l4-4"
					/>
				</svg>
				<span className="font-medium text-slate-700 text-sm">
					{currentLanguageName}
				</span>
				<svg
					className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{isOpen && (
				<>
					<div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
						<div className="border-slate-100 border-b px-3 py-2 font-semibold text-slate-500 text-xs uppercase tracking-wider">
							{t("common.language")}
						</div>

						{availableLanguages.map(([langCode, langName]) => (
							<button
								key={langCode}
								onClick={() => handleLanguageChange(langCode)}
								className="flex w-full items-center space-x-3 px-3 py-2 text-left transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
							>
								<div className="flex items-center space-x-2">
									<div className="h-2 w-2 rounded-full bg-slate-300" />
									<span className="text-slate-700 text-sm">{langName}</span>
								</div>
							</button>
						))}
					</div>

					<button
						className="fixed inset-0 h-full w-full cursor-default"
						onClick={() => setIsOpen(false)}
						tabIndex={-1}
						aria-hidden="true"
					/>
				</>
			)}
		</div>
	);
}
