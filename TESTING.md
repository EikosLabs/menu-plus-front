# Testing con Jest

Este proyecto usa **Jest** y **React Testing Library** para pruebas unitarias y de integración.

## Configuración

La configuración de Jest se encuentra en `jest.config.js` e incluye:

- **Entorno**: jsdom para simular el DOM del navegador
- **Transformadores**: Babel para transpilar JSX y ES modules
- **Mocks**: CSS modules y archivos estáticos
- **Coverage**: Configurado para generar reportes de cobertura

## Scripts Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (útil durante desarrollo)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar tests con salida detallada
npm run test:verbose
```

## Estructura de Tests

Los archivos de test deben ubicarse junto a los archivos que prueban:

```
src/
  components/
    ui/
      Button.jsx
      Button.test.jsx         # Test del componente
  utils/
    security.js
    security.test.js          # Test de la utilidad
```

También puedes crear carpetas `__tests__` si prefieres:

```
src/
  components/
    __tests__/
      Button.test.jsx
```

## Escribiendo Tests

### Tests de Componentes React

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Tests de Utilidades

```javascript
import { sanitizeHtml } from './security';

describe('sanitizeHtml', () => {
  it('sanitizes HTML special characters', () => {
    const input = '<script>alert("xss")</script>';
    const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
    expect(sanitizeHtml(input)).toBe(expected);
  });
});
```

## APIs de Testing Library

### Queries Principales

- `getByText`: Encuentra elemento por texto
- `getByRole`: Encuentra elemento por rol ARIA
- `getByLabelText`: Encuentra elemento por label
- `getByTestId`: Encuentra elemento por data-testid
- `queryBy*`: Versión que retorna null si no encuentra
- `findBy*`: Versión asíncrona

### Interacciones

```javascript
import { fireEvent } from '@testing-library/react';

fireEvent.click(button);
fireEvent.change(input, { target: { value: 'nuevo valor' } });
fireEvent.submit(form);
```

### Matchers de Jest

```javascript
expect(value).toBe(expected);           // Igualdad estricta
expect(value).toEqual(expected);        // Igualdad profunda
expect(value).toBeTruthy();             // Valor truthy
expect(value).toBeFalsy();              // Valor falsy
expect(array).toContain(item);          // Array contiene item
expect(fn).toHaveBeenCalled();          // Función fue llamada
expect(fn).toHaveBeenCalledWith(arg);   // Función llamada con args
```

### Matchers de jest-dom

```javascript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass('className');
expect(element).toHaveAttribute('attr', 'value');
```

## Mocking

### Mock de Funciones

```javascript
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue(Promise.resolve('data'));
```

### Mock de Módulos

```javascript
jest.mock('./moduleToMock');

// O con implementación custom
jest.mock('./api', () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: 'test' }))
}));
```

## Cobertura de Código

Para generar un reporte de cobertura:

```bash
npm run test:coverage
```

Esto generará un reporte en la carpeta `coverage/`. Los umbrales de cobertura pueden configurarse en `jest.config.js` según las necesidades del proyecto.

## Ejemplos Disponibles

El proyecto incluye tests fundamentales para:

1. **Componentes UI** (8 tests):
   - `Button.test.jsx`: 5 tests - renderizado, onClick, disabled, loading, variantes
   - `LoadingSpinner.test.jsx`: 3 tests - mensaje default, mensaje custom, spinner

2. **Utilidades** (30 tests):
   - `security.test.js`: 12 tests - sanitización HTML/URL, validación de precios, truncado de texto, datos de menú
   - `onboardingValidation.test.js`: 18 tests - validación de email, URL, teléfono, archivos, colores, formularios

**Total: 38 tests fundamentales**

## Mejores Prácticas

1. **Tests descriptivos**: Usa nombres claros que describan qué se está probando
2. **Arrange-Act-Assert**: Organiza tus tests en estas tres fases
3. **Un concepto por test**: Cada test debe probar una sola cosa
4. **No testear detalles de implementación**: Testea el comportamiento, no el código
5. **Usa data-testid con moderación**: Prefiere queries semánticas (getByRole, getByText)
6. **Mockea dependencias externas**: APIs, localStorage, etc.

## Troubleshooting

### Error: Cannot find module

Asegúrate de que los paths en los imports coincidan con la estructura de archivos.

### Error: window is not defined

Verifica que `testEnvironment: 'jsdom'` esté configurado en `jest.config.js`.

### Tests muy lentos

- Usa `test.only()` para ejecutar solo un test durante desarrollo
- Ejecuta `npm run test:watch` para re-ejecutar solo tests afectados

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom matchers](https://github.com/testing-library/jest-dom)
