# Mock API - Archivos JSON Estáticos

## 📋 Descripción

La mock API ha sido convertida a archivos JSON estáticos para evitar problemas con el despliegue en Vercel. Todos los datos ahora se cargan directamente desde archivos JSON en la carpeta `/public/api/`.

## 📁 Estructura de Archivos

```
public/
└── api/
    ├── orders.json                    # Lista completa de pedidos
    ├── dashboard/
    │   └── stats.json                  # Estadísticas del dashboard
    ├── accounting/
    │   ├── transactions.json           # Lista completa de transacciones
    │   └── reports/
    │       ├── balance.json            # Reporte de balance
    │       └── income.json             # Estado de resultados
    └── shopify/
        ├── shops.json                  # Lista de tiendas Shopify
        └── sync-logs.json              # Logs de sincronización
```

## 🔧 Funcionamiento

### Carga de Datos

Todos los datos se cargan usando `fetch()` directamente desde los archivos JSON estáticos. El servicio `api.ts` implementa:

1. **Carga de archivos JSON**: Usa `fetch()` para cargar los archivos desde `/api/*.json`
2. **Caché en memoria**: Los datos se cargan una vez y se mantienen en memoria para mejorar el rendimiento
3. **Filtrado en el cliente**: Todos los filtros se aplican en el cliente después de cargar los datos
4. **Compatibilidad con axios**: Mantiene la misma interfaz que axios (respuestas con `.data`) para no romper el código existente

### Filtros Soportados

#### Pedidos (`ordersApi.getAll()`)
- `status`: Filtrar por estado (pending, processing, shipped, delivered, cancelled)
- `country`: Filtrar por código de país
- `storeId`: Filtrar por ID de tienda
- `customerEmail`: Búsqueda por email
- `search`: Búsqueda en número de pedido, nombre o email del cliente
- `dateFrom` / `dateTo`: Filtrar por rango de fechas
- `minAmount` / `maxAmount`: Filtrar por rango de montos
- `sortBy` / `sortOrder`: Ordenar por cualquier campo
- `page` / `limit`: Paginación

#### Transacciones (`accountingApi.getTransactions()`)
- `type`: Filtrar por tipo (sale, refund, expense)
- `category`: Filtrar por categoría
- `shopId`: Filtrar por ID de tienda
- `countryCode`: Filtrar por código de país
- `orderId`: Filtrar por ID de pedido
- `dateFrom` / `dateTo`: Filtrar por rango de fechas
- `minAmount` / `maxAmount`: Filtrar por rango de montos
- `currency`: Filtrar por moneda
- `sortBy` / `sortOrder`: Ordenar por cualquier campo
- `page` / `limit`: Paginación

#### Tiendas (`shopifyApi.getShops()`)
- `isActive`: Filtrar por estado activo/inactivo
- `countryCode`: Filtrar por código de país
- `syncStatus`: Filtrar por estado de sincronización
- `currency`: Filtrar por moneda
- `sortBy` / `sortOrder`: Ordenar por cualquier campo
- `page` / `limit`: Paginación

## 🚀 Ventajas

1. **Sin dependencias de servidor**: No requiere funciones serverless en Vercel
2. **Despliegue simple**: Los archivos JSON se sirven como archivos estáticos
3. **Rápido**: Los datos se cargan directamente sin pasar por un servidor
4. **Fácil de mantener**: Los datos están en archivos JSON simples y fáciles de editar
5. **Compatible con Vercel**: Funciona perfectamente en el plan gratuito de Vercel

## 📝 Notas Importantes

- **Actualizaciones en memoria**: Las actualizaciones (como cambiar el estado de un pedido) se realizan en memoria y no se persisten. Esto es suficiente para una demo, pero en producción necesitarías un backend real.

- **Sincronización simulada**: La función `syncShop()` simula una sincronización pero no realiza cambios reales. Solo actualiza el estado en memoria.

- **Datos completos**: Todos los datos de la mock API original han sido copiados completamente a los archivos JSON estáticos.

## 🔄 Migración desde Mock API

Si anteriormente usabas la mock API con funciones serverless, no necesitas cambiar nada en tu código. El servicio `api.ts` mantiene la misma interfaz:

```typescript
// Antes (con axios)
const response = await ordersApi.getAll({ status: 'pending' })
const orders = response.data

// Ahora (con JSON estáticos) - ¡Funciona igual!
const response = await ordersApi.getAll({ status: 'pending' })
const orders = response.data
```

## 📦 Archivos Modificados

- `src/services/api.ts`: Completamente reescrito para usar archivos JSON estáticos
- `public/api/*.json`: Nuevos archivos JSON con todos los datos

## 🗑️ Archivos que ya no se necesitan

Los siguientes archivos ya no son necesarios para el funcionamiento básico (pero se mantienen por si acaso):

- `api/[...path].js`: Función serverless de Vercel (ya no se usa)
- `api/data.json`: Datos centralizados (ahora están en archivos separados)
- `api/utils/*`: Utilidades para funciones serverless (ya no se usan)

## ✅ Verificación

Para verificar que todo funciona correctamente:

1. Ejecuta `npm run dev` en el frontend
2. Navega a las diferentes páginas (Dashboard, Pedidos, Contabilidad, Shopify)
3. Verifica que los datos se carguen correctamente
4. Prueba los filtros y búsquedas
5. Verifica que el despliegue en Vercel funcione sin problemas
