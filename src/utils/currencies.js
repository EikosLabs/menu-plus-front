/**
 * Currency types matching backend enum
 */
export const Currency = {
	USD: 0,  // Dólar estadounidense
	UYU: 1,  // Peso uruguayo
	GBP: 2,  // Libra esterlina
	ARS: 3,  // Peso argentino
	BOB: 4,  // Boliviano (Bolivia)
	BRL: 5,  // Real brasileño
	CLP: 6,  // Peso chileno
	COP: 7,  // Peso colombiano
	CRC: 8,  // Colón costarricense
	CUP: 9,  // Peso cubano
	DOP: 10, // Peso dominicano
	GTQ: 11, // Quetzal guatemalteco
	HNL: 12, // Lempira hondureña
	MXN: 13, // Peso mexicano
	NIO: 14, // Córdoba nicaragüense
	PAB: 15, // Balboa panameño
	PEN: 16, // Sol peruano
	PYG: 17, // Guaraní paraguayo
	VES: 18  // Bolívar venezolano
};

/**
 * Currency symbols and names for display
 */
export const currencyInfo = {
	[Currency.USD]: { symbol: '$', code: 'USD', name: 'Dólar estadounidense' },
	[Currency.UYU]: { symbol: '$U', code: 'UYU', name: 'Peso uruguayo' },
	[Currency.GBP]: { symbol: '£', code: 'GBP', name: 'Libra esterlina' },
	[Currency.ARS]: { symbol: '$', code: 'ARS', name: 'Peso argentino' },
	[Currency.BOB]: { symbol: 'Bs', code: 'BOB', name: 'Boliviano' },
	[Currency.BRL]: { symbol: 'R$', code: 'BRL', name: 'Real brasileño' },
	[Currency.CLP]: { symbol: '$', code: 'CLP', name: 'Peso chileno' },
	[Currency.COP]: { symbol: '$', code: 'COP', name: 'Peso colombiano' },
	[Currency.CRC]: { symbol: '₡', code: 'CRC', name: 'Colón costarricense' },
	[Currency.CUP]: { symbol: '$', code: 'CUP', name: 'Peso cubano' },
	[Currency.DOP]: { symbol: 'RD$', code: 'DOP', name: 'Peso dominicano' },
	[Currency.GTQ]: { symbol: 'Q', code: 'GTQ', name: 'Quetzal guatemalteco' },
	[Currency.HNL]: { symbol: 'L', code: 'HNL', name: 'Lempira hondureña' },
	[Currency.MXN]: { symbol: '$', code: 'MXN', name: 'Peso mexicano' },
	[Currency.NIO]: { symbol: 'C$', code: 'NIO', name: 'Córdoba nicaragüense' },
	[Currency.PAB]: { symbol: 'B/.', code: 'PAB', name: 'Balboa panameño' },
	[Currency.PEN]: { symbol: 'S/', code: 'PEN', name: 'Sol peruano' },
	[Currency.PYG]: { symbol: '₲', code: 'PYG', name: 'Guaraní paraguayo' },
	[Currency.VES]: { symbol: 'Bs.S', code: 'VES', name: 'Bolívar venezolano' }
};

/**
 * Get currency symbol by currency type
 */
export function getCurrencySymbol(currencyType) {
	return currencyInfo[currencyType]?.symbol || '$';
}

/**
 * Get currency code by currency type
 */
export function getCurrencyCode(currencyType) {
	return currencyInfo[currencyType]?.code || 'USD';
}

/**
 * Get currency name by currency type
 */
export function getCurrencyName(currencyType) {
	return currencyInfo[currencyType]?.name || 'Dólar estadounidense';
}

/**
 * Format price with currency
 */
export function formatPrice(price, currencyType) {
	const symbol = getCurrencySymbol(currencyType);
	const code = getCurrencyCode(currencyType);
	return `${symbol}${Number(price).toFixed(2)} ${code}`;
}

/**
 * Get all currencies as array for dropdown
 */
export function getAllCurrencies() {
	return Object.keys(Currency).map(key => ({
		value: Currency[key],
		code: currencyInfo[Currency[key]].code,
		name: currencyInfo[Currency[key]].name,
		symbol: currencyInfo[Currency[key]].symbol
	}));
}
