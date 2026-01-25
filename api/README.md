# API Serverless Functions - Documentación Completa

Este directorio contiene todas las funciones serverless de Vercel que reemplazan completamente la Mock API.

## 📁 Estructura

```
api/
├── utils/
│   └── helpers.js              # Funciones utilitarias compartidas
├── data.json                   # Base de datos mock
├── orders.js                   # GET /api/orders
├── orders/
│   ├── [id].js                # GET, PATCH /api/orders/:id
│   └── [id]/
│       └── status.js          # PATCH /api/orders/:id/status
├── dashboard/
│   └── stats.js               # GET /api/dashboard/stats
├── accounting/
│   ├── transactions.js        # GET /api/accounting/transactions
│   └── reports/
│       ├── balance.js         # GET /api/accounting/reports/balance
│       └── income.js          # GET /api/accounting/reports/income
└── shopify/
    ├── shops.js               # GET, POST /api/shopify/shops
    ├── shops/
    │   ├── [id].js           # GET, PUT, PATCH, DELETE /api/shopify/shops/:id
    │   └── [id]/
    │       └── sync.js       # POST /api/shopify/shops/:id/sync
    └── sync-logs.js          # GET /api/shopify/sync-logs
```

## ✨ Características Implementadas

### 🔧 Funciones Utilitarias (`utils/helpers.js`)

- **CORS Headers**: Configuración automática de CORS
- **Error Handling**: Funciones estandarizadas para errores
- **Query Parsing**: Parsing inteligente de query parameters
- **Validación**: Validación de estados y tipos
- **Paginación**: Sistema completo de paginación
- **Sorting**: Ordenamiento por cualquier campo

### 📦 Endpoints de Pedidos

#### `GET /api/orders`
Lista todos los pedidos con filtros avanzados.

**Query Parameters:**
- `status` - Filtrar por estado (pending, processing, shipped, delivered, cancelled)
- `country` - Filtrar por código de país
- `storeId` - Filtrar por ID de tienda
- `customerEmail` - Búsqueda por email
- `search` - Búsqueda general (número, cliente, email)
- `dateFrom` - Filtrar desde fecha (YYYY-MM-DD)
- `dateTo` - Filtrar hasta fecha (YYYY-MM-DD)
- `minAmount` - Monto mínimo
- `maxAmount` - Monto máximo
- `sortBy` - Campo para ordenar
- `sortOrder` - Orden (asc, desc)
- `page` - Número de página
- `limit` - Items por página

**Ejemplo:**
```
GET /api/orders?status=pending&country=US&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

#### `GET /api/orders/:id`
Obtiene un pedido específico.

#### `PATCH /api/orders/:id`
Actualiza un pedido (status, notes, etc.).

#### `PATCH /api/orders/:id/status`
Actualiza el estado de un pedido con validación.

**Body:**
```json
{
  "status": "shipped",
  "notes": "Enviado por DHL"
}
```

### 📊 Dashboard

#### `GET /api/dashboard/stats`
Estadísticas consolidadas calculadas en tiempo real.

**Respuesta incluye:**
- Ventas totales
- Total de pedidos
- Ticket promedio
- Tasa de crecimiento
- Ventas por país
- Pedidos recientes
- Productos top
- Estadísticas adicionales (tiendas activas, transacciones, etc.)

### 💰 Contabilidad

#### `GET /api/accounting/transactions`
Lista transacciones con filtros avanzados.

**Query Parameters:**
- `type` - Tipo (sale, refund, expense)
- `category` - Categoría
- `shopId` - ID de tienda
- `countryCode` - Código de país
- `orderId` - ID de pedido
- `dateFrom` - Fecha desde
- `dateTo` - Fecha hasta
- `minAmount` - Monto mínimo
- `maxAmount` - Monto máximo
- `currency` - Moneda
- `sortBy` - Campo para ordenar
- `page` - Paginación
- `limit` - Items por página

#### `GET /api/accounting/reports/balance`
Balance general a una fecha específica.

**Query Parameters:**
- `date` - Fecha de corte (YYYY-MM-DD)

**Respuesta:**
```json
{
  "date": "2024-01-22",
  "assets": { "total": 10000, "current": 10000, "fixed": 0 },
  "liabilities": { "total": 2000, "current": 2000, "longTerm": 0 },
  "equity": { "total": 8000, "retained": 8000, "capital": 0 },
  "total": 10000
}
```

#### `GET /api/accounting/reports/income`
Estado de resultados para un período.

**Query Parameters:**
- `from` - Fecha inicio (YYYY-MM-DD)
- `to` - Fecha fin (YYYY-MM-DD)

**Respuesta:**
```json
{
  "period": { "from": "2024-01-01", "to": "2024-01-31" },
  "revenue": { "sales": 10000, "refunds": 500, "total": 9500 },
  "expenses": { "total": 2000, "byCategory": { "Marketing": 1000 } },
  "netIncome": 7500,
  "margin": "78.95"
}
```

### 🏪 Shopify

#### `GET /api/shopify/shops`
Lista todas las tiendas.

**Query Parameters:**
- `isActive` - Filtrar por activas/inactivas
- `countryCode` - Filtrar por país
- `syncStatus` - Filtrar por estado de sync
- `currency` - Filtrar por moneda
- `sortBy` - Ordenar
- `page` - Paginación
- `limit` - Items por página

#### `POST /api/shopify/shops`
Crear nueva tienda (mock).

**Body:**
```json
{
  "shopifyDomain": "tienda.myshopify.com",
  "shopifyStoreName": "Mi Tienda",
  "countryCode": "US",
  "country": "Estados Unidos",
  "currency": "USD"
}
```

#### `GET /api/shopify/shops/:id`
Obtener tienda específica.

#### `PUT/PATCH /api/shopify/shops/:id`
Actualizar tienda.

#### `DELETE /api/shopify/shops/:id`
Eliminar tienda (mock).

#### `POST /api/shopify/shops/:id/sync`
Sincronizar tienda.

**Body (opcional):**
```json
{
  "syncType": "orders"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sincronización completada",
  "shopId": "shop1",
  "syncLog": {
    "id": "log123",
    "status": "success",
    "recordsSynced": 15,
    "errorsCount": 0
  }
}
```

#### `GET /api/shopify/sync-logs`
Logs de sincronización.

**Query Parameters:**
- `shopId` - Filtrar por tienda
- `syncType` - Tipo de sync
- `status` - Estado (success, error)
- `dateFrom` - Fecha desde
- `dateTo` - Fecha hasta
- `sortBy` - Ordenar
- `page` - Paginación

## 🛡️ Validación y Seguridad

### Validaciones Implementadas

- ✅ Estados de pedidos válidos
- ✅ Tipos de transacciones válidos
- ✅ Validación de IDs requeridos
- ✅ Validación de tipos de datos
- ✅ Validación de rangos de fechas
- ✅ Validación de montos

### Manejo de Errores

Todas las funciones incluyen:
- Try-catch para errores inesperados
- Mensajes de error descriptivos
- Códigos de estado HTTP apropiados
- Logging de errores (console.error)

### CORS

Todas las funciones configuran CORS automáticamente:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- Soporte para OPTIONS requests

## 📝 Ejemplos de Uso

### Obtener pedidos pendientes de USA
```bash
GET /api/orders?status=pending&country=US
```

### Buscar pedidos por cliente
```bash
GET /api/orders?search=john
```

### Obtener transacciones de ventas del mes
```bash
GET /api/accounting/transactions?type=sale&dateFrom=2024-01-01&dateTo=2024-01-31
```

### Obtener balance general
```bash
GET /api/accounting/reports/balance?date=2024-01-22
```

### Sincronizar tienda
```bash
POST /api/shopify/shops/shop1/sync
Content-Type: application/json

{
  "syncType": "orders"
}
```

## 🚀 Mejoras Futuras

Para producción real, considerar:

1. **Autenticación**: Agregar JWT o API keys
2. **Rate Limiting**: Limitar requests por IP
3. **Persistencia**: Conectar a base de datos real
4. **Cache**: Implementar caché para queries frecuentes
5. **Webhooks**: Notificaciones en tiempo real
6. **Logging**: Sistema de logging más robusto
7. **Monitoring**: Métricas y alertas
8. **Testing**: Tests unitarios y de integración

## 📚 Notas

- Todas las funciones son **stateless**
- Los datos se leen de `data.json` (en producción usar DB)
- Las actualizaciones son **mock** (no persisten)
- Las funciones están optimizadas para Vercel Serverless
- El código es **production-ready** en estructura

---

**Versión**: 1.0.0  
**Última actualización**: 2024
