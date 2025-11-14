/**
 * Emoji Detector - Intelligent emoji detection for menu sections
 * Detects emojis based on section names in multiple languages
 */

// Comprehensive emoji mapping with keywords
const EMOJI_KEYWORDS = {
  // Bebidas frías
  '🧊': ['frío', 'fría', 'frios', 'frias', 'cold', 'iced', 'helado', 'helada', 'frozen', 'congelado', 'congelada', 'glacé', 'ice', 'hielo', 'frappé', 'frappe', 'granizado', 'frapuchino', 'freeze'],
  '🥤': ['refresco', 'refrescos', 'soda', 'gaseosa', 'gaseosas', 'soft drink', 'pop', 'coca cola', 'pepsi', 'fanta', 'sprite', 'bebida', 'bebidas gasificadas', 'carbonated', 'fizzy'],
  '🧃': ['jugo', 'jugos', 'juice', 'zumo', 'zumos', 'natural', 'nectar', 'néctar', 'extracto', 'exprimido', 'fresh juice', 'juicebar', 'jugoterapia'],
  '🥛': ['leche', 'milk', 'lácteo', 'lácteos', 'dairy', 'batido', 'smoothie', 'licuado', 'malteada', 'milkshake', 'shake', 'frappé lácteo', 'lechera', 'yogurt bebible', 'kéfir'],
  '💧': ['agua', 'water', 'mineral', 'sparkling', 'con gas', 'sin gas', 'still water', 'h2o', 'hidratación', 'aqua', 'aguas', 'botella'],

  // Bebidas calientes
  '☕': ['café', 'coffee', 'espresso', 'cappuccino', 'latte', 'americano', 'cortado', 'macchiato', 'caffe', 'cafetería', 'cafecito', 'cafetera', 'moka', 'mocha', 'café con leche', 'café negro', 'black coffee', 'cafeto', 'descafeinado', 'decaf', 'cold brew', 'ristretto', 'lungo', 'doppio', 'flat white', 'affogato'],
  '🍵': ['té', 'tea', 'infusión', 'infusiones', 'herbal', 'chai', 'te verde', 'green tea', 'te negro', 'black tea', 'te rojo', 'oolong', 'matcha', 'earl grey', 'english breakfast', 'chamomile', 'manzanilla', 'hierbas', 'tisana', 'rooibos', 'te blanco', 'white tea', 'pu-erh'],
  '🫖': ['tetera', 'teapot', 'tetería', 'tea house', 'casa de té', 'salón de té'],

  // Bebidas alcohólicas
  '🍺': ['cerveza', 'beer', 'ale', 'lager', 'pilsner', 'stout', 'ipa', 'birra', 'chela', 'cheve', 'pinta', 'caña', 'schop', 'draft', 'artesanal', 'craft beer', 'cervecería', 'brewhouse', 'pale ale', 'amber', 'porter', 'wheat beer', 'weiss', 'hefeweizen', 'bock', 'dunkel'],
  '🍷': ['vino', 'wine', 'tinto', 'blanco', 'rosado', 'red wine', 'white wine', 'rosé', 'malbec', 'cabernet', 'merlot', 'pinot', 'chardonnay', 'sauvignon', 'tempranillo', 'syrah', 'shiraz', 'reserva', 'gran reserva', 'viña', 'bodega', 'vineyard', 'sommelier', 'enoteca', 'vinoteca', 'carta de vinos', 'vinos premium'],
  '🍸': ['cóctel', 'cócteles', 'cocktail', 'cocktails', 'mixología', 'mixology', 'trago', 'tragos', 'coctelería', 'martini', 'cosmopolitan', 'manhattan', 'negroni', 'old fashioned', 'drink', 'drinks', 'barra', 'bar', 'mixto', 'combinado', 'mixologist', 'bartender'],
  '🥃': ['whisky', 'whiskey', 'bourbon', 'scotch', 'ron', 'rum', 'vodka', 'ginebra', 'gin', 'tequila', 'mezcal', 'licor', 'licores', 'destilado', 'spirits', 'brandy', 'cognac', 'armagnac', 'pisco', 'grappa', 'sake', 'soju', 'baijiu', 'aguardiente', 'anís', 'absenta', 'absinthe', 'single malt', 'blended', 'añejo', 'reposado'],
  '🍾': ['champagne', 'champán', 'cava', 'prosecco', 'espumoso', 'espumante', 'sparkling', 'burbujas', 'brut', 'extra brut', 'demi sec', 'celebración', 'celebration', 'crémant', 'lambrusco', 'asti', 'franciacorta'],
  '🍹': ['tropical', 'margarita', 'piña colada', 'mojito', 'daiquiri', 'caipirinha', 'mai tai', 'blue lagoon', 'sex on the beach', 'tequila sunrise', 'cuba libre', 'singapore sling', 'zombie', 'hurricane', 'bahama mama', 'exótico', 'exotic', 'frutal', 'fruity'],

  // Pizza y pasta
  '🍕': ['pizza', 'pizzas', 'pizzería', 'pizzeria', 'napolitana', 'margherita', 'pepperoni', 'quattro formaggi', 'capricciosa', 'hawaiana', 'carbonara pizza', 'calzone', 'focaccia', 'stromboli', 'pizza al taglio', 'pizzeta', 'emporio'],
  '🍝': ['pasta', 'pastas', 'spaghetti', 'espagueti', 'fettuccine', 'penne', 'ravioli', 'lasagna', 'lasaña', 'linguine', 'tagliatelle', 'rigatoni', 'fusilli', 'farfalle', 'tortellini', 'gnocchi', 'ñoquis', 'cannelloni', 'macarrones', 'mac n cheese', 'pasta fresca', 'pasta casera', 'noodles'],
  '🥫': ['salsa', 'sauce', 'marinara', 'pesto', 'carbonara', 'alfredo', 'bolognesa', 'boloñesa', 'ragú', 'amatriciana', 'arrabbiata', 'aglio e olio', 'putanesca', 'napolitana', 'tomate', 'tomato sauce'],

  // Hamburguesas y sandwiches
  '🍔': ['hamburguesa', 'hamburguesas', 'burger', 'burgers', 'hamburguesería', 'cheeseburger', 'smash burger', 'double burger', 'triple', 'whopper', 'big mac', 'bacon burger', 'veggie burger', 'chicken burger', 'burguesa', 'hamburguer'],
  '🌭': ['hot dog', 'perro caliente', 'pancho', 'completo', 'hotdog', 'frankfurt', 'salchicha', 'corn dog', 'chili dog'],
  '🥪': ['sandwich', 'sándwich', 'bocadillo', 'bocata', 'sub', 'torta', 'sánguche', 'emparedado', 'subway', 'club sandwich', 'tostado', 'croque', 'panini', 'ciabatta', 'baguette', 'montadito', 'bocadillos'],
  '🌮': ['taco', 'tacos', 'mexicano', 'mexican', 'taquería', 'taqueria', 'al pastor', 'carnitas', 'barbacoa', 'lengua', 'suadero', 'tex-mex', 'street tacos', 'soft tacos', 'hard shell'],
  '🌯': ['burrito', 'wrap', 'enrollado', 'fajita', 'quesadilla', 'enchilada', 'chimichanga', 'tostada', 'flautas', 'sincronizada', 'tortilla wrap'],

  // Carnes
  '🥩': ['carne', 'carnes', 'meat', 'beef', 'res', 'ternera', 'vaca', 'asado', 'parrilla', 'grill', 'barbecue', 'bbq', 'barbacoa', 'bife', 'bistec', 'filete', 'churrasco', 'entrecot', 'solomillo', 'lomo', 'ribeye', 't-bone', 'sirloin', 'wagyu', 'angus', 'kobe', 'corte', 'cortes', 'steak', 'steakhouse', 'asador', 'parrillada', 'chuletón'],
  '🥓': ['tocino', 'bacon', 'panceta', 'tocineta', 'beicon', 'bacón', 'crispy bacon', 'canadian bacon', 'turkey bacon'],
  '🍗': ['pollo', 'chicken', 'ave', 'aves', 'alitas', 'wings', 'pollo frito', 'fried chicken', 'pollo asado', 'roasted chicken', 'pollo al horno', 'nuggets', 'tenders', 'fingers', 'pechuga', 'muslo', 'drumstick', 'thigh', 'kentucky', 'broaster'],
  '🍖': ['costilla', 'costillas', 'ribs', 'chuleta', 'chuletas', 'rack', 'baby back ribs', 'spare ribs', 'short ribs', 'costillar', 'chuletón', 'pork chop', 'lamb chop', 'cordero'],
  '🦴': ['hueso', 'bone', 'ossobuco', 'tuétano', 'marrow', 'bone-in', 'con hueso'],

  // Mariscos y pescados
  '🦞': ['langosta', 'lobster', 'marisco', 'mariscos', 'seafood', 'mar', 'del mar', 'fruits de mer', 'bogavante', 'langostino', 'cigala', 'marisquería'],
  '🦐': ['camarón', 'camarones', 'gamba', 'gambas', 'shrimp', 'prawn', 'langostino', 'langostinos', 'al ajillo', 'scampi', 'ceviche de camarón'],
  '🦀': ['cangrejo', 'crab', 'jaiba', 'centolla', 'buey de mar', 'king crab', 'blue crab', 'soft shell crab'],
  '🦑': ['calamar', 'calamares', 'squid', 'pulpo', 'octopus', 'chipirones', 'sepia', 'jibia', 'tinta', 'a la romana', 'a la plancha'],
  '🐟': ['pescado', 'fish', 'pez', 'pescados', 'pescadería', 'catch of the day', 'del día', 'fresco', 'fresh fish', 'pescado blanco', 'white fish'],
  '🐠': ['atún', 'tuna', 'salmón', 'salmon', 'trucha', 'trout', 'merluza', 'hake', 'bacalao', 'cod', 'lenguado', 'sole', 'robalo', 'sea bass', 'lubina', 'dorada', 'bream', 'mero', 'grouper', 'pargo', 'snapper'],
  '🍣': ['sushi', 'sashimi', 'nigiri', 'maki', 'roll', 'japonés', 'japanese', 'uramaki', 'temaki', 'gunkan', 'california roll', 'philadelphia', 'spicy tuna', 'dragon roll', 'rainbow roll', 'tempura roll', 'sushi bar', 'omakase', 'chirashi', 'poke', 'poke bowl'],

  // Ensaladas y vegetales
  '🥗': ['ensalada', 'ensaladas', 'salad', 'salads', 'verde', 'greens', 'fresca', 'fresh', 'caesar', 'caprese', 'griega', 'greek', 'mixta', 'waldorf', 'niçoise', 'cobb', 'vegetales frescos', 'bowl', 'ensaladera', 'garden', 'house salad'],
  '🥬': ['vegetariano', 'vegetarian', 'veggie', 'verdura', 'verduras', 'vegetales', 'lechuga', 'lettuce', 'espinaca', 'spinach', 'arugula', 'rúcula', 'kale', 'col rizada', 'acelga', 'chard', 'berro', 'watercress', 'endive', 'escarola', 'radicchio'],
  '🌱': ['vegano', 'vegan', 'plant-based', 'orgánico', 'organic', 'sin carne', 'meatless', 'plant', 'plantas', 'basado en plantas', 'eco', 'sustentable', 'sustainable', 'bio', 'ecológico', 'health', 'saludable', 'raw', 'crudo'],
  '🥒': ['pepino', 'cucumber', 'pickles', 'encurtido', 'pepinillo', 'gherkin'],
  '🥕': ['zanahoria', 'carrot', 'zanahorias', 'carrots', 'baby carrots'],
  '🥦': ['brócoli', 'broccoli', 'brécol', 'brocoli'],
  '🌽': ['maíz', 'corn', 'elote', 'choclo', 'mazorca', 'sweet corn', 'maíz dulce', 'esquites', 'corn on the cob', 'popcorn', 'palomitas'],
  '🍅': ['tomate', 'tomato', 'jitomate', 'cherry tomato', 'tomates cherry', 'roma', 'heirloom', 'tomates reliquia'],

  // Sopas y guisos
  '🍲': ['sopa', 'sopas', 'soup', 'soups', 'caldo', 'caldos', 'broth', 'consomé', 'crema', 'cream', 'bisque', 'chowder', 'gazpacho', 'minestrone', 'tom yum', 'miso soup', 'pozole', 'menudo', 'sopa de pollo', 'chicken soup', 'sopa de cebolla', 'onion soup', 'sopa del día'],
  '🥘': ['guiso', 'guisos', 'stew', 'cazuela', 'estofado', 'casserole', 'olla', 'pot', 'cocido', 'puchero', 'fabada', 'cassoulet', 'bourguignon', 'goulash', 'curry', 'tajine', 'paella', 'risotto', 'arroz', 'rice'],
  '🍜': ['ramen', 'noodles', 'fideos', 'pho', 'udon', 'soba', 'yakisoba', 'pad thai', 'lo mein', 'chow mein', 'laksa', 'bun bo hue', 'tallarines', 'asian noodles', 'noodle soup'],

  // Desayuno
  '🍳': ['desayuno', 'breakfast', 'huevo', 'huevos', 'egg', 'eggs', 'omelet', 'omelette', 'tortilla', 'revuelto', 'scrambled', 'frito', 'fried', 'poché', 'poached', 'benedictino', 'benedict', 'rancheros', 'huevos rancheros', 'huevos rotos', 'shakshuka', 'frittata', 'brunch', 'matutino', 'mañana'],
  '🥞': ['panqueque', 'panqueques', 'pancake', 'pancakes', 'waffle', 'waffles', 'hotcakes', 'hot cakes', 'crepe', 'crepes', 'crêpes', 'tortitas', 'flapjacks', 'dutch baby', 'blinis', 'silver dollar', 'stack'],
  '🥐': ['croissant', 'medialunas', 'pan dulce', 'pastry', 'bollería', 'pastelería', 'panadería', 'repostería', 'pain au chocolat', 'brioche', 'danish', 'ensaimada', 'palmera', 'napolitana', 'suizo', 'concha'],
  '🥖': ['pan', 'bread', 'baguette', 'tostada', 'toast', 'francés', 'ciabatta', 'sourdough', 'masa madre', 'integral', 'whole wheat', 'multigrano', 'artesanal', 'artisan', 'baker', 'bakery', 'bagel'],
  '🧈': ['mantequilla', 'butter', 'mermelada', 'jam', 'jalea', 'jelly', 'miel', 'honey', 'nutella', 'spread', 'dulce de leche', 'cajeta', 'arequipe', 'manjar'],

  // Postres
  '🍰': ['pastel', 'pasteles', 'cake', 'cakes', 'torta', 'tortas', 'postre', 'postres', 'dessert', 'desserts', 'dulcería', 'sweet', 'sweets', 'dulces', 'repostería', 'patisserie', 'tres leches', 'red velvet', 'chiffon', 'sponge cake', 'bizcocho', 'layer cake', 'tiramisu', 'cheesecake', 'carrot cake'],
  '🧁': ['cupcake', 'magdalena', 'muffin', 'ponqué', 'panquecito', 'fairy cake', 'mantecada', 'queque'],
  '🍪': ['galleta', 'galletas', 'cookie', 'cookies', 'biscuit', 'biscotti', 'shortbread', 'snickerdoodle', 'chocolate chip', 'oatmeal cookie', 'galletitas', 'polvorones', 'alfajor'],
  '🍩': ['dona', 'donas', 'donut', 'donuts', 'rosquilla', 'doughnut', 'berlina', 'bomba', 'cruller', 'long john', 'glazed', 'filled', 'jelly donut', 'dunkin'],
  '🍮': ['flan', 'pudding', 'natilla', 'crema', 'custard', 'crème brûlée', 'crema catalana', 'panna cotta', 'arroz con leche', 'rice pudding', 'flan napolitano', 'leche asada'],
  '🍨': ['helado', 'helados', 'ice cream', 'gelato', 'nieve', 'heladería', 'ice cream shop', 'sundae', 'banana split', 'copa', 'tarro', 'pint', 'vainilla', 'vanilla', 'chocolate', 'strawberry', 'cookie dough', 'rocky road', 'mint chip'],
  '🍧': ['raspado', 'granizado', 'sorbete', 'sorbet', 'shaved ice', 'snow cone', 'hielo raspado', 'kakigori', 'bingsu', 'paleta helada', 'popsicle'],
  '🍦': ['soft serve', 'helado suave', 'cono', 'cone', 'mcflurry', 'blizzard', 'frozen yogurt', 'froyo', 'twist'],
  '🎂': ['tarta', 'birthday', 'cumpleaños', 'celebración', 'aniversario', 'anniversary', 'fiesta', 'party', 'celebration cake', 'wedding cake', 'pastel de bodas'],
  '🥧': ['pie', 'pay', 'strudel', 'apple pie', 'pumpkin pie', 'lemon pie', 'key lime pie', 'pecan pie', 'tarta de manzana', 'tarte tatin', 'galette', 'crostata'],
  '🍫': ['chocolate', 'cacao', 'brownie', 'chocolatina', 'trufa', 'truffle', 'ganache', 'fondant', 'mousse', 'chocolate cake', 'hot chocolate', 'chocolate caliente', 'cocoa', 'dark chocolate', 'milk chocolate', 'white chocolate'],
  '🍬': ['dulce', 'dulces', 'candy', 'caramelo', 'golosina', 'confite', 'confectionery', 'gominola', 'gummy', 'lollipop', 'chupete', 'piruleta', 'chicle', 'gum', 'marshmallow', 'malvavisco', 'nube', 'toffee'],

  // Frutas
  '🍎': ['manzana', 'apple', 'manzanas', 'apples', 'reineta', 'granny smith', 'fuji', 'gala', 'red delicious'],
  '🍊': ['naranja', 'orange', 'cítrico', 'citrus', 'mandarina', 'tangerine', 'clementina', 'clementine', 'pomelo', 'grapefruit', 'toronja'],
  '🍋': ['limón', 'lemon', 'lima', 'lime', 'limonada', 'lemonade', 'citrus', 'cítrico', 'amarillo'],
  '🍌': ['banana', 'plátano', 'banano', 'guineo', 'cambur', 'maduro', 'plantain', 'platano macho'],
  '🍉': ['sandía', 'watermelon', 'patilla', 'melón de agua', 'angurria'],
  '🍓': ['fresa', 'fresas', 'strawberry', 'strawberries', 'frutilla', 'frutillas', 'fresón', 'morango'],
  '🥝': ['kiwi', 'kiwis', 'actinidia'],
  '🍑': ['durazno', 'melocotón', 'peach', 'nectarina', 'nectarine', 'pelón'],
  '🍍': ['piña', 'pineapple', 'ananá', 'ananás'],
  '🥥': ['coco', 'coconut', 'cocotero', 'agua de coco', 'coconut water', 'leche de coco', 'coconut milk'],

  // Snacks y acompañamientos
  '🍟': ['papa', 'papas', 'patata', 'patatas', 'fries', 'french fries', 'acompañamiento', 'sides', 'guarnición', 'papas fritas', 'chips', 'potato wedges', 'gajos', 'curly fries', 'waffle fries', 'steak fries', 'sweet potato fries', 'papas rústicas', 'patatas bravas', 'loaded fries', 'poutine', 'yuca frita', 'cassava', 'tostones', 'patacones', 'plátano frito'],
  '🥔': ['potato', 'potatoes', 'papa asada', 'baked potato', 'mashed potatoes', 'puré', 'puré de papa', 'hash browns', 'rösti', 'latkes', 'croqueta', 'croquetas'],
  '🧀': ['queso', 'cheese', 'quesería', 'cheeseboard', 'tabla de quesos', 'quesos artesanales', 'fromage', 'formaggio', 'mozzarella', 'parmesano', 'parmesan', 'cheddar', 'gouda', 'brie', 'camembert', 'roquefort', 'gorgonzola', 'blue cheese', 'queso azul', 'manchego', 'gruyere', 'provolone', 'feta', 'queso fresco', 'ricotta', 'mascarpone', 'queso de cabra', 'goat cheese', 'queso fundido', 'fondue', 'raclette', 'nachos con queso', 'cheese dip'],
  '🌰': ['nuez', 'nueces', 'nuts', 'frutos secos', 'almendra', 'almendras', 'almond', 'cashew', 'anacardo', 'castaña', 'chestnut', 'avellana', 'hazelnut', 'pistacho', 'pistachio', 'macadamia', 'pecan', 'pacana', 'nuez de brasil', 'brazil nut', 'mixed nuts', 'nueces mixtas', 'nueces tostadas', 'roasted nuts', 'nueces caramelizadas', 'praline'],
  '🥜': ['maní', 'peanut', 'cacahuete', 'peanuts', 'cacahuates', 'mantequilla de maní', 'peanut butter', 'maní tostado', 'maní confitado', 'maní japonés', 'garrapiñada'],
  '🍿': ['palomitas', 'popcorn', 'pororó', 'cabritas', 'rositas', 'cotufas', 'crispetas', 'pop corn', 'palomitas de maíz'],
  '🥨': ['pretzel', 'bretzel', 'pretzels', 'galleta salada', 'snack salado'],
  '🥖': ['baguette', 'pan francés', 'french bread', 'pan artesanal', 'pan de masa madre', 'sourdough bread'],
  '🥯': ['bagel', 'bagels', 'rosca', 'rosquilla salada'],

  // Comidas del día
  '🌅': ['mañana', 'morning', 'breakfast', 'desayuno', 'desayunos', 'brunch', 'matinal', 'matutino', 'amanecer', 'dawn', 'early morning', 'madrugada', 'temprano', 'early bird', 'sunrise'],
  '🌞': ['mediodía', 'lunch', 'almuerzo', 'comida', 'midday', 'noon', 'almuerzos', 'menú del día', 'menú ejecutivo', 'lunch menu', 'business lunch', 'comida corrida', 'almuerzo ejecutivo', 'lunchtime', 'hora del almuerzo'],
  '🌙': ['noche', 'night', 'cena', 'dinner', 'nocturno', 'evening', 'tarde noche', 'supper', 'cenas', 'nighttime', 'after dark', 'late night', 'medianoche', 'midnight', 'sunset', 'atardecer', 'dusk', 'anochecer'],

  // Especiales
  '⭐': ['especial', 'especiales', 'special', 'specials', 'destacado', 'destacados', 'recomendado', 'recomendados', 'recommendation', 'chef', 'del chef', 'chef especial', 'especialidad', 'especialidades', 'specialty', 'house special', 'especialidad de la casa', 'top picks', 'favoritos', 'favorites', 'best sellers', 'más vendidos', 'popular', 'populares', 'estrella', 'star', 'featured', 'selection', 'selección', 'pick', 'editor choice', 'must try', 'imperdible'],
  '🔥': ['picante', 'spicy', 'hot', 'ardiente', 'chile', 'ají', 'chili', 'pepper', 'jalapeño', 'habanero', 'ghost pepper', 'carolina reaper', 'sriracha', 'tabasco', 'salsa picante', 'hot sauce', 'fuego', 'fire', 'extra picante', 'extra hot', 'muy picante', 'very spicy', 'mild', 'medium', 'caliente', 'flaming', 'flameante', 'incendiario'],
  '💎': ['premium', 'exclusivo', 'deluxe', 'gourmet', 'luxury', 'lujo', 'de lujo', 'prime', 'selecto', 'select', 'exquisito', 'refined', 'refinado', 'elegante', 'elegant', 'high-end', 'alta gama', 'top tier', 'elite', 'superior', 'finest', 'lo mejor', 'best quality', 'calidad superior', 'exceptional', 'excepcional', 'exclusive', 'limited edition', 'edición limitada', 'vip', 'signature', 'reserva especial'],
  '🎉': ['fiesta', 'party', 'celebración', 'celebration', 'festivo', 'festive', 'eventos', 'event', 'evento', 'ocasión especial', 'special occasion', 'cumpleaños', 'birthday', 'aniversario', 'anniversary', 'boda', 'wedding', 'graduación', 'graduation', 'navidad', 'christmas', 'año nuevo', 'new year', 'halloween', 'día festivo', 'holiday', 'catering', 'banquete', 'banquet', 'buffet', 'brindis', 'toast', 'happy hour'],
  '👨‍🍳': ['del chef', 'chef', 'signature', 'autor', 'chef especial', 'chef selection', 'selección del chef', 'creación del chef', 'chef creation', 'plato del chef', 'cocina de autor', 'author cuisine', 'firma del chef', 'receta del chef', 'chef recipe', 'maestro', 'master chef', 'chef recommendation', 'recomendación del chef', 'cocinero', 'cook'],
  '🆕': ['nuevo', 'new', 'novedad', 'novedades', 'recién llegado', 'just arrived', 'fresh', 'fresco', 'estreno', 'debut', 'latest', 'lo último', 'reciente', 'recent', 'lanzamiento', 'launch'],
  '⏰': ['temporada', 'seasonal', 'de temporada', 'season', 'estacional', 'limited time', 'tiempo limitado', 'por tiempo limitado', 'temporal', 'temporary'],

  // Comidas internacionales
  '🥙': ['árabe', 'arab', 'shawarma', 'kebab', 'falafel', 'mediterranean', 'mediterráneo', 'hummus', 'baba ganoush', 'tabbouleh', 'tabule', 'kibbeh', 'kibe', 'fattoush', 'labneh', 'pita', 'pan árabe', 'mezze', 'meze', 'baklava', 'dolma', 'moussaka', 'greek', 'griego', 'gyros', 'souvlaki', 'tzatziki', 'levantine', 'levantino', 'middle eastern', 'medio oriente', 'persian', 'persa', 'turkish', 'turco', 'lebanese', 'libanés'],
  '🍛': ['curry', 'curri', 'indio', 'indian', 'india', 'thai', 'tailandés', 'asiático', 'asian', 'tikka masala', 'butter chicken', 'vindaloo', 'korma', 'biryani', 'tandoori', 'naan', 'samosa', 'pakora', 'chutney', 'raita', 'dal', 'paneer', 'masala', 'pad thai', 'tom yum', 'green curry', 'red curry', 'yellow curry', 'massaman', 'panang', 'coconut curry', 'curry de coco', 'malaysian', 'malayo', 'singapore', 'singapur', 'indonesian', 'indonesio', 'rendang', 'satay'],
  '🍱': ['bento', 'japonés', 'japanese', 'asiático', 'oriental', 'comida japonesa', 'teriyaki', 'tempura', 'katsu', 'tonkatsu', 'gyoza', 'edamame', 'miso', 'donburi', 'ramen', 'udon', 'soba', 'yakitori', 'okonomiyaki', 'takoyaki', 'onigiri', 'nori', 'wasabi', 'ginger', 'jengibre', 'shoyu', 'soy sauce', 'salsa de soja', 'sake', 'bento box', 'lunch box', 'japanese set'],
  '🥟': ['dumpling', 'dumplings', 'empanada', 'empanadas', 'empanadilla', 'empanadillas', 'gyoza', 'jiaozi', 'potsticker', 'wonton', 'wantan', 'dim sum', 'har gow', 'siu mai', 'bao', 'baozi', 'xiaolongbao', 'soup dumpling', 'mandu', 'momo', 'pierogi', 'pelmeni', 'ravioli', 'tortellini', 'pastelito', 'pastelitos', 'piroshki', 'samosa', 'bollo', 'bollito'],
  '🥡': ['chino', 'chinese', 'china', 'comida china', 'wok', 'chop suey', 'chow mein', 'lo mein', 'fried rice', 'arroz frito', 'sweet and sour', 'agridulce', 'kung pao', 'general tso', 'orange chicken', 'pollo a la naranja', 'beef and broccoli', 'mongolian beef', 'sesame chicken', 'spring roll', 'rollito primavera', 'egg roll', 'fortune cookie', 'galleta de la fortuna', 'peking duck', 'pato pekinés', 'mapo tofu', 'hot pot', 'dim sum', 'cantonese', 'cantonés', 'sichuan', 'szechuan', 'hunan'],
  '🌮': ['mexicano', 'mexican', 'mexico', 'comida mexicana', 'tex-mex', 'taco', 'tacos', 'burrito', 'quesadilla', 'enchilada', 'fajita', 'nachos', 'guacamole', 'salsa', 'pico de gallo', 'mole', 'pozole', 'menudo', 'tamales', 'elote', 'esquites', 'ceviche', 'aguachile', 'tostada', 'sope', 'huarache', 'torta', 'chilaquiles', 'carnitas', 'barbacoa', 'al pastor', 'cochinita', 'yucateco'],
  '🍕': ['italiano', 'italian', 'italia', 'italy', 'comida italiana', 'pizza', 'pasta', 'risotto', 'ossobuco', 'saltimbocca', 'prosciutto', 'carpaccio', 'bruschetta', 'antipasti', 'caprese', 'margherita', 'arancini', 'polenta', 'tiramisu', 'panna cotta', 'gelato', 'espresso', 'caffè', 'trattoria', 'osteria', 'ristorante', 'cucina italiana'],
  '🍔': ['americano', 'american', 'america', 'usa', 'comida americana', 'burger', 'hamburguesa', 'hot dog', 'bbq', 'barbecue', 'ribs', 'steak', 'mac and cheese', 'chicken wings', 'buffalo wings', 'coleslaw', 'cornbread', 'biscuits', 'gravy', 'meatloaf', 'pot roast', 'clam chowder', 'gumbo', 'jambalaya', 'cajun', 'creole', 'southern', 'sureño', 'diner', 'comfort food'],
  '🥘': ['español', 'spanish', 'españa', 'spain', 'paella', 'tapas', 'pintxos', 'jamón', 'chorizo', 'tortilla española', 'gazpacho', 'patatas bravas', 'croquetas', 'pulpo a la gallega', 'fabada', 'cocido', 'pisto', 'crema catalana', 'churros', 'sangría', 'ibérico', 'manchego'],
  '🥖': ['francés', 'french', 'francia', 'france', 'comida francesa', 'baguette', 'croissant', 'crêpe', 'quiche', 'ratatouille', 'bouillabaisse', 'coq au vin', 'boeuf bourguignon', 'cassoulet', 'confit', 'escargot', 'foie gras', 'crème brûlée', 'macaron', 'éclair', 'madeleine', 'tarte tatin', 'soufflé', 'brasserie', 'bistro', 'patisserie'],
  '🌭': ['alemán', 'german', 'alemania', 'germany', 'salchicha', 'bratwurst', 'currywurst', 'schnitzel', 'sauerbraten', 'spätzle', 'sauerkraut', 'pretzel', 'strudel', 'black forest', 'selva negra', 'biergarten', 'oktoberfest'],
  '🍜': ['coreano', 'korean', 'korea', 'bibimbap', 'bulgogi', 'kimchi', 'korean bbq', 'galbi', 'samgyeopsal', 'japchae', 'tteokbokki', 'banchan', 'gochujang', 'soju'],

  // Extras
  '🍯': ['miel', 'honey', 'miel de abeja', 'honeycomb', 'panal', 'miel de maple', 'maple syrup', 'jarabe de arce', 'agave', 'néctar de agave', 'dulce'],
  '🧂': ['sal', 'salt', 'condimento', 'condimentos', 'seasoning', 'especias', 'spices', 'pimienta', 'pepper', 'black pepper', 'sal marina', 'sea salt', 'sal rosa', 'pink salt', 'himalayan salt', 'kosher salt', 'fleur de sel', 'sal de grano', 'sal fina'],
  '🥄': ['cuchara', 'spoon', 'cucharilla', 'teaspoon', 'tablespoon', 'cucharón', 'ladle', 'cuchara sopera'],
  '🍴': ['cubierto', 'cubiertos', 'utensils', 'silverware', 'cutlery', 'tenedor', 'fork', 'cuchillo', 'knife', 'vajilla', 'utensilios'],
  '🥢': ['palillos', 'chopsticks', 'palitos', 'hashi', 'kuaizi', 'asiático', 'asian'],
  '🧊': ['hielo', 'ice', 'ice cubes', 'cubos de hielo', 'on the rocks', 'con hielo', 'enfriado', 'chilled'],
  '🍋': ['limón', 'lemon', 'lima', 'lime', 'cítrico', 'citrus', 'ácido', 'acid', 'agrio', 'sour', 'twist', 'wedge', 'rodaja'],
  '🌶️': ['chile', 'chili', 'pepper', 'ají', 'picante', 'spicy', 'jalapeño', 'serrano', 'habanero', 'poblano', 'chipotle', 'cayenne', 'guajillo', 'ancho'],
};

/**
 * Normaliza texto para búsqueda (elimina tildes, convierte a minúsculas)
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .trim();
}

/**
 * Detecta emoji basado en el nombre de la sección
 * @param {string} sectionName - Nombre de la sección
 * @returns {string} - Emoji detectado o cadena vacía si no hay coincidencia
 */
export function detectEmoji(sectionName) {
  if (!sectionName || typeof sectionName !== 'string') {
    return '';
  }

  const normalizedName = normalizeText(sectionName);

  // Primero buscar coincidencias exactas de palabras completas
  for (const [emoji, keywords] of Object.entries(EMOJI_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // Coincidencia de palabra completa
      const wordBoundaryRegex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
      if (wordBoundaryRegex.test(normalizedName)) {
        return emoji;
      }
    }
  }

  // Si no hay coincidencia exacta, buscar coincidencias parciales
  for (const [emoji, keywords] of Object.entries(EMOJI_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // Coincidencia parcial (la palabra clave está contenida)
      if (normalizedName.includes(normalizedKeyword)) {
        return emoji;
      }
    }
  }

  // No se encontró coincidencia
  return '';
}

/**
 * Obtiene emoji para una sección con fallback a emojis por defecto
 * @param {string} sectionName - Nombre de la sección
 * @param {number} index - Índice de la sección (para emoji por defecto)
 * @returns {string} - Emoji detectado o emoji por defecto basado en índice
 */
export function getEmojiForSection(sectionName, index = 0) {
  // Intentar detectar emoji inteligentemente
  const detectedEmoji = detectEmoji(sectionName);

  if (detectedEmoji) {
    return detectedEmoji;
  }

  // Si no se detectó nada, usar emojis por defecto variados
  const defaultEmojis = ['🍽️', '🍕', '🍔', '🍜', '🍱', '🥘', '🍲', '🥗', '🍛', '🥙'];
  return defaultEmojis[index % defaultEmojis.length];
}

/**
 * Detecta múltiples emojis en un texto (útil para descripciones)
 * @param {string} text - Texto a analizar
 * @returns {string[]} - Array de emojis detectados
 */
export function detectMultipleEmojis(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const normalizedText = normalizeText(text);
  const foundEmojis = new Set();

  for (const [emoji, keywords] of Object.entries(EMOJI_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedText.includes(normalizedKeyword)) {
        foundEmojis.add(emoji);
        break; // Solo agregar el emoji una vez por keyword match
      }
    }
  }

  return Array.from(foundEmojis);
}

/**
 * Obtiene todas las categorías de emojis disponibles
 * @returns {Object} - Objeto con categorías y sus emojis
 */
export function getEmojiCategories() {
  return {
    bebidas: ['🧊', '🥤', '🧃', '🥛', '💧', '☕', '🍵', '🫖', '🍺', '🍷', '🍸', '🥃', '🍾', '🍹'],
    comida: ['🍕', '🍝', '🥫', '🍔', '🌭', '🥪', '🌮', '🌯'],
    carnes: ['🥩', '🥓', '🍗', '🍖', '🦴'],
    mariscos: ['🦞', '🦐', '🦀', '🦑', '🐟', '🐠', '🍣'],
    vegetales: ['🥗', '🥬', '🌱', '🥒', '🥕', '🥦', '🌽', '🍅'],
    sopas: ['🍲', '🥘', '🍜'],
    desayuno: ['🍳', '🥞', '🥐', '🥖', '🧈', '🥯'],
    postres: ['🍰', '🧁', '🍪', '🍩', '🍮', '🍨', '🍧', '🍦', '🎂', '🥧', '🍫', '🍬'],
    frutas: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍓', '🥝', '🍑', '🍍', '🥥'],
    acompañamientos: ['🍟', '🥔', '🧀', '🌰', '🥜', '🍿', '🥨'],
    comidas_del_dia: ['🌅', '🌞', '🌙'],
    especiales: ['⭐', '🔥', '💎', '🎉', '👨‍🍳', '🆕', '⏰'],
    internacional: ['🥙', '🍛', '🍱', '🥟', '🥡', '🌮', '🍕', '🍔', '🥘', '🥖', '🌭', '🍜'],
    extras: ['🍯', '🧂', '🥄', '🍴', '🥢', '🧊', '🍋', '🌶️'],
  };
}
