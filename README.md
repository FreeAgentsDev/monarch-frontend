# Monarch Frontend - Sistema de Gestión Internacional

Frontend del sistema de gestión internacional para la joyería Monarch. Plataforma centralizada que integra múltiples tiendas Shopify en una sola interfaz para la gestión de pedidos, contabilidad y operaciones.

![Monarch System](https://img.shields.io/badge/Monarch-System-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

## 🎯 Descripción

Sistema completo de gestión empresarial diseñado específicamente para la operación internacional de la joyería Monarch. El frontend proporciona una interfaz moderna e intuitiva para:

- **Gestión Centralizada de Pedidos**: Visualización y gestión de pedidos de todas las tiendas Shopify
- **Contabilidad Multi-moneda**: Sistema contable que maneja múltiples monedas y países
- **Integración Shopify**: Monitoreo y gestión de múltiples tiendas Shopify
- **Dashboard Ejecutivo**: Vista consolidada con KPIs y métricas en tiempo real

## ✨ Características

### 🎨 Interfaz Moderna
- Diseño responsive con Tailwind CSS
- Componentes reutilizables y modulares
- Animaciones y transiciones suaves
- Tema consistente y profesional

### 📊 Dashboard Completo
- KPIs principales (ventas, pedidos, ticket promedio, utilidad)
- Gráficos interactivos (barras, líneas, pie)
- Vista consolidada de todos los módulos
- Métricas en tiempo real

### 🛒 Gestión de Pedidos
- Lista completa con filtros avanzados
- Búsqueda por número, cliente, email
- Filtros por estado, país, fecha
- Vista detallada de cada pedido
- Historial de cambios

### 💰 Módulo de Contabilidad
- Transacciones financieras
- Reportes de ingresos y gastos
- Gráficos de estado de resultados
- Conversión multi-moneda
- Exportación de reportes

### 🏪 Integración Shopify
- Lista de tiendas conectadas
- Estado de sincronización
- Estadísticas por tienda
- Sincronización manual
- Logs de operaciones

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn

Los datos se cargan desde archivos JSON estáticos en `public/api/` — no hace falta ningún servidor de API.

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/FreeAgentsDev/monarch-frontend.git
cd monarch-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Build para Producción

```bash
# Construir la aplicación
npm run build

# Preview de la build
npm run preview
```

## 🚀 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Vercel detectará automáticamente la configuración
3. ¡Despliega! (Los datos se sirven desde los JSON estáticos en `public/api/`)

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel
```

📖 **Guía completa**: Ver [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

## 🛠️ Tecnologías

### Core
- **[React 18](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Vite](https://vitejs.dev/)** - Build tool y dev server

### Estilos
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **PostCSS** - Procesamiento de CSS

### Routing
- **[React Router v6](https://reactrouter.com/)** - Navegación y routing

### Visualización de Datos
- **[Recharts](https://recharts.org/)** - Gráficos y visualizaciones

### HTTP Client
- **[Axios](https://axios-http.com/)** - Cliente HTTP

### Utilidades
- **[date-fns](https://date-fns.org/)** - Manipulación de fechas
- **[Lucide React](https://lucide.dev/)** - Iconos

## 📁 Estructura del Proyecto

```
frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes reutilizables
│   │   └── Layout.tsx     # Layout principal con sidebar
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Dashboard.tsx  # Dashboard principal
│   │   ├── Orders.tsx     # Gestión de pedidos
│   │   ├── OrderDetail.tsx # Detalle de pedido
│   │   ├── Accounting.tsx # Módulo de contabilidad
│   │   └── Shopify.tsx    # Integración Shopify
│   ├── services/          # Servicios y APIs
│   │   └── api.ts         # Cliente API y tipos
│   ├── App.tsx            # Componente raíz
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── index.html             # HTML principal
├── package.json           # Dependencias
├── vercel.json            # Configuración Vercel
├── tsconfig.json          # Configuración TypeScript
├── tailwind.config.js     # Configuración Tailwind
└── vite.config.ts         # Configuración Vite
```

## 🎨 Diseño

### Colores Principales
- **Primary**: `#0ea5e9` (Azul)
- **Success**: `#10b981` (Verde)
- **Warning**: `#f59e0b` (Amarillo)
- **Error**: `#ef4444` (Rojo)

### Componentes
- Cards con sombras suaves
- Botones con estados hover
- Tablas responsivas
- Gráficos interactivos
- Sidebar colapsable

## 🔌 Datos (JSON estáticos)

El frontend carga los datos desde archivos JSON en `public/api/`:

- **Dashboard**: `public/api/dashboard/stats.json`
- **Pedidos**: `public/api/orders.json`
- **Contabilidad**: `public/api/accounting/transactions.json`, `reports/balance.json`, `reports/income.json`
- **Shopify**: `public/api/shopify/shops.json`, `sync-logs.json`

El servicio `src/services/api.ts` hace `fetch` a estas rutas (p. ej. `/api/orders.json`). Filtros, paginación y búsqueda se aplican en el cliente. No hace falta servidor de API ni variables de entorno para desarrollo.

> **Backend disponible.** Ya existe un backend real (Go + Gin + PostgreSQL) en el repo
> [`monarch-backend`](https://github.com/FreeAgentsDev/monarch-backend). Para usarlo, configura
> `VITE_API_URL` (p. ej. `http://localhost:8080`) y adapta `src/services/api.ts` y
> `src/context/AuthContext.tsx` para apuntar a `${VITE_API_URL}/api/v1/...` con el header
> `Authorization: Bearer <token>`. Migrar del modo JSON estático al API real es el siguiente paso.

## 🧪 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Construye para producción
npm run preview      # Preview de la build

# Linting
npm run lint         # Ejecuta ESLint
```

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## 🚀 Despliegue

### Vercel (Recomendado)

Ver guía completa en [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Otros Proveedores

#### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

#### Build Manual

```bash
# Construir
npm run build

# Los archivos estarán en /dist
# Subir a tu servidor preferido
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- **Componentes**: PascalCase (`OrderDetail.tsx`)
- **Funciones**: camelCase (`loadOrders`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Archivos**: kebab-case para utilidades (`api-client.ts`)

### Estructura de Componentes

```typescript
// Importaciones externas
import { useState } from 'react'

// Importaciones internas
import { api } from '../services/api'

// Tipos
interface Props {
  // ...
}

// Componente
export default function Component({ prop }: Props) {
  // Hooks
  const [state, setState] = useState()
  
  // Funciones
  const handleAction = () => {
    // ...
  }
  
  // Render
  return (
    // JSX
  )
}
```

## 🐛 Troubleshooting

### Error: Cannot find module
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: Port already in use
```bash
# Vite automáticamente usará el siguiente puerto disponible
# O cambiar en vite.config.ts
```

### Error: Los datos no cargan (404 en /api/*.json)
- Verifica que existan los archivos en `public/api/` (orders.json, dashboard/stats.json, etc.)
- En desarrollo, Vite sirve `public/` en la raíz; en build, se copian a `dist/`

### Error: Build failed en Vercel
- Verificar que todas las dependencias estén en `package.json`
- Revisar los logs en el dashboard de Vercel

## 📄 Licencia

Este proyecto es privado y propiedad de Monarch Jewelry. Todos los derechos reservados.

## 👥 Equipo

Desarrollado por **FreeAgentsDev** para **Monarch Jewelry**

## 📞 Soporte

Para soporte, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Estado**: 🚀 En Desarrollo Activo
