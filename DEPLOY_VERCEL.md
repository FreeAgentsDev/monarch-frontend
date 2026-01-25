# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar el frontend de Monarch en Vercel de forma rápida y sencilla.

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

En la sección **"Environment Variables"**, agrega:

```
VITE_API_URL=https://tu-api-url.com/api
```

**Importante**: 
- Para desarrollo: usa tu Mock API o API de desarrollo
- Para producción: usa la URL de tu API en producción

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

### Paso 4: Configurar Variables de Entorno

```bash
vercel env add VITE_API_URL
```

Ingresa la URL de tu API cuando se solicite.

### Paso 5: Desplegar a Producción

```bash
vercel --prod
```

## 🔧 Configuración Avanzada

### Variables de Entorno por Ambiente

Puedes configurar diferentes variables para desarrollo, preview y producción:

```bash
# Desarrollo
vercel env add VITE_API_URL development

# Preview
vercel env add VITE_API_URL preview

# Producción
vercel env add VITE_API_URL production
```

### Dominio Personalizado

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los registros DNS según las instrucciones

### Configuración de Rewrites

El archivo `vercel.json` ya está configurado para:
- Redirigir todas las rutas a `index.html` (SPA routing)
- Cachear assets estáticos

## 📊 Monitoreo y Analytics

Vercel incluye:
- **Analytics**: Métricas de rendimiento
- **Speed Insights**: Core Web Vitals
- **Logs**: Logs en tiempo real

Actívalos en: Settings → Analytics

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

### Error: API Connection Failed

Verifica:
1. La variable `VITE_API_URL` está configurada
2. La API permite CORS desde tu dominio de Vercel
3. La API está accesible públicamente

### Error: Routing not working

Verifica que `vercel.json` tenga la configuración de rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📝 Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Build local funciona (`npm run build`)
- [ ] No hay errores de TypeScript (`npm run build`)
- [ ] `.env.example` actualizado
- [ ] `vercel.json` configurado
- [ ] README actualizado con URL de producción

## 🚀 Post-Deploy

Después del despliegue:

1. **Verifica la URL**: Abre la URL proporcionada por Vercel
2. **Prueba las funcionalidades**: Navega por todas las páginas
3. **Revisa la consola**: Verifica que no haya errores
4. **Configura dominio**: Si tienes dominio personalizado
5. **Comparte el link**: Con tu equipo para testing

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/guides/deploying-vite-with-vercel)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎉 ¡Listo!

Tu aplicación debería estar desplegada y funcionando. Cada push a `main` actualizará automáticamente el deployment.

---

**Última actualización**: 2024
**Versión**: 1.0.0
