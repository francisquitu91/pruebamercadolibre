# 🚀 Deployment en Render

Guía para desplegar el frontend en Render (hosting gratuito).

## Requisitos

- Cuenta GitHub con el código del proyecto
- Cuenta Render (https://render.com)

## Paso 1: Preparar Repositorio Git

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "Initial ecommerce deployment"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tu-repo.git
git push -u origin main
```

## Paso 2: Crear Servicio en Render

1. Ir a https://render.com
2. Click en **"New +"** → **"Web Service"**
3. Click en **"Connect a repository"**
4. Buscar y seleccionar tu repositorio
5. Click en **"Connect"**

## Paso 3: Configurar Web Service

Completar con estos valores:

| Campo | Valor |
|-------|-------|
| **Name** | ecommerce-frontend |
| **Root Directory** | frontend |
| **Environment** | Node |
| **Node Version** | 18 |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm install -g serve && serve -s dist` |
| **Plan** | Free |

## Paso 4: Agregar Variables de Entorno

Click en **"Advanced"** y agregar:

```
VITE_SUPABASE_URL=https://bgugepseqlyffrtfkepo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DI0rvTq6HCmGstBpLXupeg_a2LQBwCG
VITE_EDGE_FUNCTION_URL=https://bgugepseqlyffrtfkepo.supabase.co/functions/v1
```

## Paso 5: Deploy

Click en **"Deploy"** y espera ~3-5 minutos.

Verás una URL como: `https://ecommerce-frontend.onrender.com`

## Paso 6: Configurar Webhook de Mercado Pago para Producción

1. Ir a Mercado Pago Developers
2. Configuración → Webhooks
3. Agregar URL (reemplazar con tu dominio Render):

```
https://ecommerce-frontend.onrender.com/api/payment-status
```

⚠️ Nota: El webhook real se manejará en Supabase, no en Render.

## Paso 7: Verificar Deployment

1. Ir a tu URL de Render
2. Deberías ver la tienda funcional
3. Intentar comprar algo para verificar flujo completo

## Troubleshooting

### Build falla con error de Node

1. Ir a **Settings** → **Environment**
2. Cambiar Node Version a `18` o `20`

### Variables de entorno no se cargan

1. Las variables en Render son para servidor
2. Para valores en cliente (VITE_), necesitan estar en `.env`
3. Verificar que `.env` esté commiteado (sin secretos)

### Deploy se queda colgado

- Verificar logs en Render dashboard
- Esperar ~5 minutos (puede ser lento con plan free)
- Si falla, revisar build command

### 404 en archivos estáticos

Verifica que `vite.config.ts` tenga:

```typescript
build: {
  outDir: 'dist',
}
```

## Monitoreo

En Render dashboard puedes:
- Ver logs en tiempo real
- Revisar uso de CPU/memoria
- Reiniciar el servicio si es necesario

## Auto-Deploy desde Git

Render automáticamente redeploya cuando haces push a main:

```bash
git add .
git commit -m "Nuevos cambios"
git push origin main

# Render inicia deployment automáticamente
```

## Base de Datos

Tu base de datos PostgreSQL se mantiene en Supabase (no en Render).

Render es SOLO para el frontend React.

## Dominio Personalizado (Opcional)

Si quieres dominio personalizado:

1. En Render → Settings → Custom Domain
2. Agregar tu dominio
3. Configurar DNS según instrucciones

## Escalabilidad Futura

- Plan Free: 1 instancia, 0.5 GB RAM
- Plan Starter ($7/mes): Mejor performance
- Plan Pro ($12+/mes): Auto-scaling

## Seguridad

✅ Render proporciona SSL automáticamente (HTTPS)
✅ Variables de entorno almacenadas de forma segura
✅ Solo código frontend (sin secretos backend)

Los secretos del backend (SERVICE_ROLE_KEY, MERCADOPAGO_TOKEN) NUNCA van a Render, solo a Supabase.

## Resumen del Stack en Producción

```
Usuario
  ↓
[Render] Frontend React (HTTPS)
  ↓
[Supabase]
  ├─ PostgreSQL (BD)
  ├─ Edge Functions (Backend)
  └─ Auth
  ↓
[Mercado Pago] Pagos
```

---

**¡Deployment completado!** 🎉
