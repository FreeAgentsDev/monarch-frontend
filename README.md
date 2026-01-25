# Monarch Frontend - Sistema de Gestión Internacional

Frontend del sistema de gestión internacional para la joyería Monarch. Plataforma centralizada que integra múltiples tiendas Shopify en una sola interfaz para la gestión de pedidos, contabilidad y operaciones.

![Monarch System](https://img.shields.io/badge/Monarch-System-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?logo=tailwind-css)

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
- Mock API corriendo (ver sección de desarrollo)

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

## 🔌 Integración con API

El frontend se conecta a una API REST. Por defecto, está configurado para usar:

- **Desarrollo**: `http://localhost:3001/api`
- **Producción**: Configurar variable de entorno `VITE_API_URL`

### Endpoints Principales

```typescript
// Dashboard
GET /api/dashboard/stats

// Pedidos
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/status

// Contabilidad
GET /api/accounting/transactions
GET /api/accounting/reports/balance
GET /api/accounting/reports/income

// Shopify
GET /api/shopify/shops
POST /api/shopify/shops/:id/sync
GET /api/shopify/sync-logs
```

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

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3001/api
```

### Mock API para Desarrollo

Para desarrollo local, se recomienda usar el Mock API incluido en el proyecto principal:

```bash
# En otro terminal
cd ../mock-api
npm install
npm start
```

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

### Build Manual

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

### Error: API connection failed
- Verificar que el Mock API esté corriendo
- Verificar la URL en `.env`
- Revisar CORS en el servidor API

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
