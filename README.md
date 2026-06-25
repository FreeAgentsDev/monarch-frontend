# Monarch — API (Go + Gin)

Backend HTTP del proyecto Monarch. Sirve pedidos y tiendas (modo demo en memoria) y está preparado para conectarse después a PostgreSQL.

## Requisitos

- [Go](https://go.dev/dl/) 1.22 o superior
- Para la base de datos: PostgreSQL (local o servidor del equipo); cliente recomendado [DataGrip](https://www.jetbrains.com/datagrip/) o `psql`

## Arrancar el servidor

```powershell
cd monarch-backend
go mod tidy
go run ./cmd/server
```

Por defecto escucha en **http://localhost:8080**. Otro puerto:

```powershell
$env:PORT = "3000"; go run ./cmd/server
```

### Rutas útiles (demo)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/health` | Estado del servicio |
| GET | `/api/v1/orders` | Lista de pedidos (query params opcionales) |
| GET | `/api/v1/orders/:id` | Detalle de pedido |
| PATCH | `/api/v1/orders/:id` | Body JSON: `{"status":"shipped"}` |
| GET | `/api/v1/shops` | Tiendas Shopify (demo) |
| POST | `/api/v1/shops/:id/sync` | Simula sincronización |

## Frontend (opcional)

En `monarch-frontend`, archivo `.env` o `.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

Reinicia Vite. Pedidos y pantalla Shopify usarán este API en lugar de los JSON estáticos.

---

## Cómo mostrar el backend y la base de datos a un senior

### 1. Demo en vivo (misma reunión)

1. **API:** Deja corriendo `go run ./cmd/server` y comparte pantalla.
2. Abre en el navegador `http://localhost:8080/api/v1/health` o usa **Postman** / **Insomnia** contra las rutas de la tabla anterior.
3. **Base de datos:** Abre **DataGrip**, conectado a tu instancia PostgreSQL, base `monarch` (o la que uses), y muestra el árbol **Schemas → public → tables** y una consulta de ejemplo:

   ```sql
   SELECT * FROM countries ORDER BY sort_order;
   ```

Así se ve el API respondiendo y el esquema real sin exponer credenciales por chat.

### 2. Si el senior está remoto (sin acceso a tu PC)

- **API:** Opciones habituales: desplegar el binario o un contenedor en un PaaS (Railway, Fly.io, Render, etc.) o usar un túnel temporal (**ngrok**, **Cloudflare Tunnel**) apuntando a `localhost:8080`. No subas secretos al repositorio; usa variables de entorno en el proveedor.
- **PostgreSQL:** **No** abras el puerto 5432 a Internet sin firewall/VPN. Mejor:
  - Compartir **capturas** o un **video corto** de DataGrip,
  - Exportar **solo el esquema** y enviarlo por canal seguro del equipo:

    En DataGrip: clic derecho en la base → **SQL Scripts** → **Dump with 'pg_dump'** → marcar solo estructura si no quieres datos.

  - O acordar un **entorno staging** con acceso controlado (VPN, IP allowlist).

### 3. Documentación que suele pedir un senior

- Cómo se levanta el proyecto (esta sección y comandos de arriba).
- URL base del API y contrato JSON (campos de pedidos/tiendas alineados con el frontend).
- Dónde vive la DB (host, nombre de base, versión de PostgreSQL) — **sin** pegar contraseñas en el README; eso va en gestor de secretos o `.env` local ignorado por git.

### 4. Respaldo del esquema (recomendado)

Los scripts `.sql` de migración ya no están en este repo. Para no perder el diseño:

- En DataGrip o consola: `pg_dump` solo esquema hacia un archivo, o **Export DDL** desde el IDE.
- Guarda ese archivo en un lugar acordado con el equipo (repo privado, Drive interno, etc.).

---

## Estructura del código

- `cmd/server/main.go` — entrada
- `internal/config` — configuración (p. ej. `PORT`)
- `internal/router` — Gin, CORS, rutas
- `internal/handlers` — controladores HTTP
- `internal/store` — almacenamiento en memoria y fixtures JSON embebidos

## Próximos pasos técnicos habituales

- Conectar el API a PostgreSQL (`pgx` / `database/sql`) usando el esquema que ya aplicaste en DataGrip.
- Autenticación (JWT o sesiones) y sustituir el login demo del frontend.
- Herramienta de migraciones versionada (p. ej. `golang-migrate`, `goose`) si el equipo lo estandariza.
