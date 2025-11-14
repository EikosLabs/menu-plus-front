# 🎯 Emoji Detector - Ejemplos de Uso

El módulo `emojiDetector.js` detecta automáticamente emojis apropiados basados en el nombre de las secciones del menú.

## 🚀 Características

- ✅ **Detección inteligente** con más de 800+ palabras clave
- ✅ **Multilenguaje** (Español e Inglés)
- ✅ **Normalización de texto** (elimina tildes, case-insensitive)
- ✅ **Coincidencias exactas y parciales**
- ✅ **Sin emoji forzado** - Si no hay coincidencia, usa emoji por defecto variado
- ✅ **Categorías extensas** - Bebidas, comidas, postres, internacionales y más

## 📝 Ejemplos de Detección

### Bebidas Frías ❄️
```javascript
"Bebidas Frías" → 🧊
"Refrescos" → 🥤
"Jugos Naturales" → 🧃
"Batidos" → 🥛
"Agua Mineral" → 💧
```

### Bebidas Calientes ☕
```javascript
"Café" → ☕
"Tés e Infusiones" → 🍵
"Café Espresso" → ☕
```

### Bebidas Alcohólicas 🍺
```javascript
"Cervezas Artesanales" → 🍺
"Vinos Tintos" → 🍷
"Cócteles de Autor" → 🍸
"Whisky Premium" → 🥃
"Champagne" → 🍾
"Cócteles Tropicales" → 🍹
```

### Pizza y Pasta 🍕
```javascript
"Pizzas Gourmet" → 🍕
"Pastas Caseras" → 🍝
"Pasta al Pesto" → 🍝
```

### Hamburguesas y Sandwiches 🍔
```javascript
"Hamburguesas" → 🍔
"Hot Dogs" → 🌭
"Sándwiches" → 🥪
"Tacos Mexicanos" → 🌮
"Burritos" → 🌯
```

### Carnes 🥩
```javascript
"Carnes a la Parrilla" → 🥩
"Asado Argentino" → 🥩
"Pollo Rostizado" → 🍗
"Costillas BBQ" → 🍖
"Bacon" → 🥓
```

### Mariscos y Pescados 🦞
```javascript
"Mariscos Frescos" → 🦞
"Camarones al Ajillo" → 🦐
"Cangrejo" → 🦀
"Calamares Fritos" → 🦑
"Pescado del Día" → 🐟
"Sushi y Sashimi" → 🍣
```

### Ensaladas y Vegetales 🥗
```javascript
"Ensaladas Frescas" → 🥗
"Opciones Vegetarianas" → 🥬
"Menú Vegano" → 🌱
"Verduras Orgánicas" → 🥬
```

### Sopas y Guisos 🍲
```javascript
"Sopas Caseras" → 🍲
"Guisos Tradicionales" → 🥘
"Ramen Japonés" → 🍜
```

### Desayuno 🍳
```javascript
"Desayunos" → 🍳
"Huevos al Gusto" → 🍳
"Panqueques" → 🥞
"Croissants" → 🥐
"Pan Tostado" → 🥖
```

### Postres 🍰
```javascript
"Postres Caseros" → 🍰
"Pasteles" → 🍰
"Cupcakes" → 🧁
"Galletas" → 🍪
"Donas" → 🍩
"Helados Artesanales" → 🍨
"Flanes" → 🍮
"Tortas" → 🎂
"Brownies de Chocolate" → 🍫
```

### Frutas 🍓
```javascript
"Frutas Frescas" → 🍓
"Ensalada de Frutas" → 🍓
"Jugo de Naranja" → 🍊
"Batido de Fresa" → 🍓
```

### Acompañamientos 🍟
```javascript
"Papas Fritas" → 🍟
"Guarniciones" → 🍟
"Quesos Artesanales" → 🧀
```

### Especiales ⭐
```javascript
"Especiales del Chef" → ⭐
"Recomendaciones" → ⭐
"Platos Picantes" → 🔥
"Menú Premium" → 💎
"Del Chef" → 👨‍🍳
```

### Comidas del Día 🌞
```javascript
"Desayunos de Mañana" → 🌅
"Brunch Matutino" → 🌅
"Almuerzos" → 🌞
"Menú Ejecutivo" → 🌞
"Cenas" → 🌙
"Late Night" → 🌙
```

### Snacks y Acompañamientos 🍟
```javascript
"Papas Fritas" → 🍟
"Loaded Fries" → 🍟
"Patatas Bravas" → 🍟
"Tabla de Quesos" → 🧀
"Quesos Artesanales" → 🧀
"Frutos Secos" → 🌰
"Almendras Tostadas" → 🌰
"Palomitas de Maíz" → 🍿
"Pretzels" → 🥨
"Bagels" → 🥯
```

### Cocina Internacional 🌎

#### Mediterránea y Árabe 🥙
```javascript
"Comida Árabe" → 🥙
"Shawarma" → 🥙
"Falafel" → 🥙
"Hummus" → 🥙
"Gyros Griego" → 🥙
"Mezze Libanés" → 🥙
"Kebab Turco" → 🥙
```

#### India y Tailandia 🍛
```javascript
"Curry Thai" → 🍛
"Tikka Masala" → 🍛
"Butter Chicken" → 🍛
"Pad Thai" → 🍛
"Green Curry" → 🍛
"Tandoori" → 🍛
```

#### Japonesa 🍱
```javascript
"Bento Box" → 🍱
"Teriyaki" → 🍱
"Tempura" → 🍱
"Katsu" → 🍱
"Yakitori" → 🍱
"Edamame" → 🍱
```

#### Dim Sum y Dumplings 🥟
```javascript
"Empanadas" → 🥟
"Gyoza" → 🥟
"Dim Sum" → 🥟
"Wontons" → 🥟
"Baozi" → 🥟
"Xiaolongbao" → 🥟
```

#### China 🥡
```javascript
"Comida China" → 🥡
"Chow Mein" → 🥡
"Fried Rice" → 🥡
"General Tso" → 🥡
"Sweet and Sour" → 🥡
"Spring Rolls" → 🥡
```

#### Mexicana 🌮
```javascript
"Tacos al Pastor" → 🌮
"Quesadillas" → 🌮
"Enchiladas" → 🌮
"Chilaquiles" → 🌮
"Pozole" → 🌮
```

#### Italiana 🍕
```javascript
"Pizza Napolitana" → 🍕
"Risotto" → 🍕
"Carpaccio" → 🍕
"Bruschetta" → 🍕
"Arancini" → 🍕
```

#### Americana 🍔
```javascript
"BBQ Ribs" → 🍔
"Buffalo Wings" → 🍔
"Mac and Cheese" → 🍔
"Clam Chowder" → 🍔
"Jambalaya" → 🍔
```

#### Española 🥘
```javascript
"Paella" → 🥘
"Tapas" → 🥘
"Jamón Ibérico" → 🥘
"Tortilla Española" → 🥘
"Pulpo a la Gallega" → 🥘
```

#### Francesa 🥖
```javascript
"Croissants" → 🥖
"Quiche" → 🥖
"Ratatouille" → 🥖
"Coq au Vin" → 🥖
"Crème Brûlée" → 🥖
```

#### Alemana 🌭
```javascript
"Bratwurst" → 🌭
"Schnitzel" → 🌭
"Sauerkraut" → 🌭
"Pretzels" → 🌭
```

#### Coreana 🍜
```javascript
"Bibimbap" → 🍜
"Bulgogi" → 🍜
"Kimchi" → 🍜
"Korean BBQ" → 🍜
"Japchae" → 🍜
```

## 🔧 Uso en el Código

### Básico
```javascript
import { getEmojiForSection } from './utils/emojiDetector.js';

// Detectar emoji automáticamente
const emoji = getEmojiForSection("Bebidas Frías", 0);
console.log(emoji); // 🧊
```

### Detección Múltiple
```javascript
import { detectMultipleEmojis } from './utils/emojiDetector.js';

// Detectar múltiples emojis en un texto
const emojis = detectMultipleEmojis("Pizzas con cerveza y café");
console.log(emojis); // ['🍕', '🍺', '☕']
```

### Solo Detección (sin fallback)
```javascript
import { detectEmoji } from './utils/emojiDetector.js';

const emoji1 = detectEmoji("Bebidas Frías"); // 🧊
const emoji2 = detectEmoji("Sección Random"); // '' (cadena vacía)
```

## 🎨 Normalización de Texto

El detector maneja automáticamente:
- ✅ Mayúsculas/Minúsculas: "PIZZA" = "pizza" = "Pizza"
- ✅ Tildes: "Café" = "Cafe", "Bebidas Frías" = "Bebidas Frias"
- ✅ Espacios extras
- ✅ Palabras parciales: "Pizzería" detecta "pizza"

## 🌍 Multilenguaje

Todas las palabras clave incluyen variantes en:
- 🇪🇸 Español (España y Latinoamérica)
- 🇬🇧 Inglés

Ejemplos:
- "Hamburguesas" = "Burgers" → 🍔
- "Mariscos" = "Seafood" → 🦞
- "Postres" = "Desserts" → 🍰

### Categorías Especiales ⭐

#### Destacados y Recomendaciones ⭐
```javascript
"Especiales del Chef" → ⭐
"Best Sellers" → ⭐
"Más Vendidos" → ⭐
"Favoritos" → ⭐
"Must Try" → ⭐
"Imperdibles" → ⭐
```

#### Picantes 🔥
```javascript
"Extra Picante" → 🔥
"Salsa Habanero" → 🔥
"Ghost Pepper" → 🔥
"Sriracha" → 🔥
```

#### Premium y Gourmet 💎
```javascript
"Premium Selection" → 💎
"Menú Gourmet" → 💎
"Edición Limitada" → 💎
"VIP Experience" → 💎
"Reserva Especial" → 💎
```

#### Celebraciones 🎉
```javascript
"Menu de Fiesta" → 🎉
"Especial Cumpleaños" → 🎉
"Eventos y Catering" → 🎉
"Happy Hour" → 🎉
```

#### Del Chef 👨‍🍳
```javascript
"Creación del Chef" → 👨‍🍳
"Firma del Chef" → 👨‍🍳
"Cocina de Autor" → 👨‍🍳
"Receta del Chef" → 👨‍🍳
```

#### Novedades 🆕
```javascript
"Nuevo" → 🆕
"Recién Llegado" → 🆕
"Lanzamiento" → 🆕
"Latest" → 🆕
```

#### Temporada ⏰
```javascript
"De Temporada" → ⏰
"Seasonal Menu" → ⏰
"Tiempo Limitado" → ⏰
```

### Extras y Condimentos 🧂

```javascript
// Condimentos y especias
"Sal y Pimienta" → 🧂
"Especias" → 🧂
"Sal Rosa del Himalaya" → 🧂

// Miel y dulces
"Miel de Abeja" → 🍯
"Maple Syrup" → 🍯
"Néctar de Agave" → 🍯

// Cítricos
"Limón" → 🍋
"Lima" → 🍋
"Twist de Limón" → 🍋

// Picantes
"Jalapeños" → 🌶️
"Chiles Serranos" → 🌶️
"Habaneros" → 🌶️

// Hielo
"Con Hielo" → 🧊
"On the Rocks" → 🧊
"Ice Cubes" → 🧊
```

## 📚 Categorías Disponibles

```javascript
import { getEmojiCategories } from './utils/emojiDetector.js';

const categories = getEmojiCategories();
// {
//   bebidas: ['🧊', '🥤', '🧃', '🥛', '💧', '☕', '🍵', '🫖', '🍺', '🍷', '🍸', '🥃', '🍾', '🍹'],
//   comida: ['🍕', '🍝', '🥫', '🍔', '🌭', '🥪', '🌮', '🌯'],
//   carnes: ['🥩', '🥓', '🍗', '🍖', '🦴'],
//   mariscos: ['🦞', '🦐', '🦀', '🦑', '🐟', '🐠', '🍣'],
//   vegetales: ['🥗', '🥬', '🌱', '🥒', '🥕', '🥦', '🌽', '🍅'],
//   sopas: ['🍲', '🥘', '🍜'],
//   desayuno: ['🍳', '🥞', '🥐', '🥖', '🧈', '🥯'],
//   postres: ['🍰', '🧁', '🍪', '🍩', '🍮', '🍨', '🍧', '🍦', '🎂', '🥧', '🍫', '🍬'],
//   frutas: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍓', '🥝', '🍑', '🍍', '🥥'],
//   acompañamientos: ['🍟', '🥔', '🧀', '🌰', '🥜', '🍿', '🥨'],
//   comidas_del_dia: ['🌅', '🌞', '🌙'],
//   especiales: ['⭐', '🔥', '💎', '🎉', '👨‍🍳', '🆕', '⏰'],
//   internacional: ['🥙', '🍛', '🍱', '🥟', '🥡', '🌮', '🍕', '🍔', '🥘', '🥖', '🌭', '🍜'],
//   extras: ['🍯', '🧂', '🥄', '🍴', '🥢', '🧊', '🍋', '🌶️']
// }
```

## 💡 Tips

1. **Nombres descriptivos**: Usa nombres claros como "Bebidas Frías" en lugar de "Categoría 1"
2. **Palabras clave**: Incluye palabras clave relevantes: "Pastas Caseras" mejor que solo "Pastas"
3. **Fallback automático**: Si no hay coincidencia, el sistema usa emojis variados por defecto
4. **Sin emojis duplicados**: Cada sección tendrá su propio emoji único

## 🔍 Testing

Para probar el detector:

```javascript
// En la consola del navegador
import { detectEmoji } from './utils/emojiDetector.js';

console.log(detectEmoji("Pizza Napolitana")); // 🍕
console.log(detectEmoji("Cerveza Artesanal")); // 🍺
console.log(detectEmoji("Helados Cremosos")); // 🍨
console.log(detectEmoji("Tikka Masala")); // 🍛
console.log(detectEmoji("Best Sellers")); // ⭐
console.log(detectEmoji("Loaded Fries")); // 🍟
console.log(detectEmoji("Bibimbap Coreano")); // 🍜
```

## ✨ Nuevas Características (Última Actualización)

### Más de 800 Palabras Clave
El detector ahora incluye:
- **Bebidas expandidas**: Cold brew, flat white, single malt, craft beer, y más variantes específicas
- **Comida internacional**: 10+ cocinas con 100+ platos específicos (italiana, mexicana, china, japonesa, india, tailandesa, árabe, francesa, española, alemana, coreana)
- **Snacks**: Palomitas, pretzels, bagels, tabla de quesos, nueces tostadas
- **Categorías especiales**: Premium, temporada, novedades, del chef, picante
- **Postres extendidos**: Tiramisu, cheesecake, tres leches, y variedades de helado
- **Carnes específicas**: Wagyu, angus, ribeye, t-bone
- **Platos específicos**: Margherita, linguine, smash burger, poke bowl, y cientos más

### Multilenguaje Mejorado
- Español (España y Latinoamérica con variantes regionales)
- Inglés (US y UK)
- Términos técnicos de cocina en italiano, francés, japonés, chino, etc.

### Categorías Nuevas
- **Comidas del día**: Desayuno, almuerzo, cena con variantes (brunch, late night, etc.)
- **Internacional**: Cocinas específicas por país/región
- **Especiales**: Premium, temporada, del chef, picante, novedades
- **Extras**: Condimentos, hielo, cítricos, chiles

### Mejoras en Detección
- Reconoce platos específicos: "Tikka Masala" detecta emoji de curry
- Detecta variantes de preparación: "Buffalo Wings" detecta emoji americano
- Identifica tipos de cocina: "Korean BBQ" detecta emoji coreano
- Reconoce marcas y estilos: "Neapolitan Pizza", "Craft Beer", etc.
