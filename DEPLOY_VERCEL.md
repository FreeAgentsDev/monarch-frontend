# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar el frontend de Monarch en Vercel de forma rápida y sencilla. Los datos se sirven desde los **JSON estáticos** en `public/api/` (no hace falta API externa).

## 📋 Prerrequisitos

- Cuenta en [Vercel](https://vercel.com) (gratuita)
- Repositorio en GitHub (ya configurado)
- Node.js instalado localmente (para pruebas)

## 🎯 Opción 1: Despliegue desde GitHub (Recomendado)

### Paso 1: Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"**
3. Selecciona el repositorio `FreeAgentsDev/monarch-frontend`
4. Vercel detectará automáticamente que es un proyecto Vite

### Paso 2: Configurar el Proyecto

Vercel debería detectar automáticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Si no se detecta automáticamente, configura manualmente:
- Framework: **Vite**
- Root Directory: `./` (o deja vacío)
- Build Command: `npm run build`
- Output Directory: `dist`

### Paso 3: Variables de Entorno

No es necesario configurar variables para el MVP. Los datos se cargan desde los JSON en `public/api/`, que Vercel sirve como estáticos (p. ej. `/api/orders.json`, `/api/dashboard/stats.json`).

Si en el futuro usas un backend real, puedes agregar `VITE_API_URL` con la URL de tu API.

### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que se complete el build (2-3 minutos)
3. ¡Listo! Tu aplicación estará disponible en una URL como:
   `https://monarch-frontend.vercel.app`

## 🛠️ Opción 2: Despliegue desde CLI

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Iniciar Sesión

```bash
vercel login
```

### Paso 3: Desplegar

Desde el directorio del frontend:

```bash
cd frontend
vercel
```

Sigue las instrucciones:
- **Set up and deploy?** → `Y`
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → `N` (primera vez) o `Y` (si ya existe)
- **Project name?** → `monarch-frontend` (o el que prefieras)
- **Directory?** → `./` (enter para usar el actual)
- **Override settings?** → `N`

### Paso 4: Desplegar a Producción

```bash
vercel --prod
```

## 🔧 Mock API Integrada

### ¿Cómo Funciona?

El proyecto incluye funciones serverless de Vercel en la carpeta `/api` que actúan como Mock API:

- **`/api/orders.js`** - Endpoint de pedidos
- **`/api/dashboard/stats.js`** - Estadísticas del dashboard
- **`/api/accounting/transactions.js`** - Transacciones contables
- **`/api/shopify/shops.js`** - Tiendas Shopify
- **`/api/shopify/sync-logs.js`** - Logs de sincronización
- **`/api/data.json`** - Datos mock

### Endpoints Disponibles

```
GET  /api/orders                    # Lista de pedidos
GET  /api/orders/:id                # Pedido específico
PATCH /api/orders/:id/status        # Actualizar estado

GET  /api/dashboard/stats           # Estadísticas del dashboard

GET  /api/accounting/transactions    # Transacciones (con filtros)

GET  /api/shopify/shops             # Lista de tiendas
POST /api/shopify/shops/:id/sync    # Sincronizar tienda
GET  /api/shopify/sync-logs         # Logs de sincronización
```

### Filtros Soportados

**Orders:**
- `?status=pending` - Filtrar por estado
- `?country=US` - Filtrar por país

**Transactions:**
- `?type=sale` - Filtrar por tipo
- `?dateFrom=2024-01-01` - Filtrar desde fecha
- `?dateTo=2024-01-31` - Filtrar hasta fecha

## 🔄 Actualizaciones Automáticas

Cada vez que hagas push a la rama `main`, Vercel:
1. Detectará los cambios
2. Creará un nuevo deployment
3. Ejecutará los tests (si los tienes)
4. Desplegará automáticamente

### Preview Deployments

Para cada Pull Request, Vercel crea un deployment de preview:
- URL única por PR
- Perfecto para testing
- Se elimina automáticamente al cerrar el PR

## 🐛 Troubleshooting

### Error: Build Failed

```bash
# Ver logs detallados
vercel logs

# O en el dashboard de Vercel
# Ve a Deployments → Click en el deployment fallido → View Function Logs
```

### Error: Module not found

Asegúrate de que todas las dependencias estén en `package.json`:
```bash
npm install
npm run build
```

### Error: API Endpoints not working

Verifica:
1. Los archivos en `/api` están incluidos en el repositorio
2. La estructura de carpetas es correcta
3. Los archivos tienen extensión `.js` (no `.ts`)

### Error: CORS

Las funciones serverless ya incluyen headers CORS. Si tienes problemas:
- Verifica que los headers estén en `vercel.json`
- Revisa los logs de las funciones en Vercel

### Error: Routing not working

Verifica que `vercel.json` tenga la configuración de rewrites:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📝 Checklist Pre-Deploy

- [ ] Archivos de API en `/api` incluidos
- [ ] `vercel.json` configurado correctamente
- [ ] Build local funciona (`npm run build`)
- [ ] No hay errores de TypeScript (`npm run build`)
- [ ] Variables de entorno configuradas (si usas API externa)
- [ ] README actualizado

## 🚀 Post-Deploy

Después del despliegue:

1. **Verifica la URL**: Abre la URL proporcionada por Vercel
2. **Prueba la API**: Visita `/api/dashboard/stats` para verificar
3. **Prueba las funcionalidades**: Navega por todas las páginas
4. **Revisa la consola**: Verifica que no haya errores
5. **Configura dominio**: Si tienes dominio personalizado
6. **Comparte el link**: Con tu equipo para testing

## 📊 Monitoreo y Analytics

Vercel incluye:
- **Analytics**: Métricas de rendimiento
- **Speed Insights**: Core Web Vitals
- **Logs**: Logs en tiempo real de funciones serverless
- **Function Logs**: Logs específicos de cada endpoint

Actívalos en: Settings → Analytics

## 🔐 Seguridad

### Para Producción Real

Si vas a usar esto en producción con datos reales:

1. **Reemplaza la Mock API** con tu API real
2. **Configura autenticación** en los endpoints
3. **Usa variables de entorno** para secrets
4. **Implementa rate limiting**
5. **Agrega validación de datos**

### Para Demo/Testing

La Mock API integrada es perfecta para:
- ✅ Demos y presentaciones
- ✅ Testing y desarrollo
- ✅ Prototipos
- ✅ MVPs

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vite + Vercel](https://vercel.com/guides/deploying-vite-with-vercel)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎉 ¡Listo!

Tu aplicación debería estar desplegada con la Mock API integrada. Cada push a `main` actualizará automáticamente el deployment.

**Ventajas de este enfoque:**
- ✅ Todo en un solo despliegue
- ✅ Sin necesidad de servidor separado
- ✅ Escalable automáticamente
- ✅ Sin costos adicionales (plan gratuito de Vercel)
- ✅ Perfecto para demos y MVPs

---

**Última actualización**: 2024
**Versión**: 1.0.0
