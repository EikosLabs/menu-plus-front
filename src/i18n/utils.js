import en from "./locales/en.json";
import es from "./locales/es.json";

const translations = {
	es,
	en,
};

export const defaultLang = "es";
export const languages = {
	es: "Español",
	en: "English",
};

export function getCurrentLang() {
    if (typeof window !== "undefined") {
        // Preferir el idioma del path para coincidir con SSR
        const path = window.location.pathname;
        const langFromPath = path.split("/")[1];
        if (languages[langFromPath]) {
            return langFromPath;
        }

        // Si no hay idioma en el path, usar el idioma por defecto
        // para evitar desajustes de hidratación con el HTML del servidor
        return defaultLang;
    }

	try {
		if (typeof globalThis !== "undefined" && globalThis.Astro?.url) {
			const pathname = globalThis.Astro.url.pathname;
			const langFromPath = pathname.split("/")[1];
			if (languages[langFromPath]) {
				return langFromPath;
			}
		}

        return defaultLang;
	} catch (_error) {
		return defaultLang;
	}
}

export function t(key, lang = null) {
	const currentLang = lang || getCurrentLang();
	const keys = key.split(".");

	let translation = translations[currentLang];

	if (!translation) {
		translation = translations[defaultLang];
	}

	for (const k of keys) {
		translation = translation?.[k];
		if (!translation) {
			break;
		}
	}

	if (!translation) {
		translation = translations[defaultLang];
		for (const k of keys) {
			translation = translation?.[k];
			if (!translation) {
				break;
			}
		}
	}

	return translation || key;
}

export function changeLang(newLang) {
	if (typeof window === "undefined") {
		return;
	}

	if (!languages[newLang]) {
		return;
	}

	localStorage.setItem("preferred-language", newLang);

	const currentPath = window.location.pathname;
	const pathSegments = currentPath.split("/").filter((segment) => segment);

	if (languages[pathSegments[0]]) {
		pathSegments.shift();
	}

	let newPath = "";
	if (newLang !== defaultLang) {
		newPath = `/${newLang}`;
	}

	if (pathSegments.length > 0) {
		newPath += `/${pathSegments.join("/")}`;
	}

	if (!newPath) {
		newPath = "/";
	}

	window.location.href = newPath;
}

export function localizeUrl(url, lang = null) {
	const targetLang = lang || getCurrentLang();

	if (targetLang === defaultLang) {
		return url;
	}

	let cleanUrl = url.startsWith("/") ? url : `/${url}`;

	const pathSegments = cleanUrl.split("/").filter((segment) => segment);
	if (languages[pathSegments[0]]) {
		pathSegments.shift();
		cleanUrl = `/${pathSegments.join("/")}`;
	}

	return `/${targetLang}${cleanUrl === "/" ? "" : cleanUrl}`;
}

export function useTranslation() {
	const currentLang = getCurrentLang();

	return {
		t: (key) => t(key, currentLang),
		currentLang,
		changeLang,
		languages,
		localizeUrl: (url) => localizeUrl(url, currentLang),
	};
}

export function formatNumber(number, lang = null) {
	const currentLang = lang || getCurrentLang();

	const formatters = {
		es: new Intl.NumberFormat("es-ES"),
		en: new Intl.NumberFormat("en-US"),
	};

	return formatters[currentLang]?.format(number) || number;
}

export function formatPrice(price, currency = "USD", lang = null) {
	const currentLang = lang || getCurrentLang();

	const formatters = {
		es: new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency: currency,
		}),
		en: new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}),
	};

	return formatters[currentLang]?.format(price) || `${currency} ${price}`;
}

export function formatDate(date, lang = null) {
	const currentLang = lang || getCurrentLang();

	const formatters = {
		es: new Intl.DateTimeFormat("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}),
		en: new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}),
	};

	return formatters[currentLang]?.format(new Date(date)) || date;
}
