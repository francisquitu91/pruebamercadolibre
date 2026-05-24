# 🔑 Configuración de Secretos y Variables

Guía para configurar todos los secretos del proyecto de forma segura.

## 📍 Ubicación de Secretos

### Frontend (.env) - ✅ PÚBLICO
```
frontend/.env                        # Variables públicas OK
```

### Backend - 🔒 PRIVADO
```
Supabase → Edge Functions → Secrets   # Variables secretas (seguro)
```

## Parte 1: Obtener las Credenciales

### 1.1 Supabase URL y Keys

1. Ir a: https://app.supabase.com/project/bgugepseqlyffrtfkepo/settings/api

2. Copiar estos valores:

**API Keys** (mostrados en la página):
- **URL**: https://bgugepseqlyffrtfkepo.supabase.co
- **Anon Public Key**: `sb_publishable_DI0rvTq6HCmGstBpLXupeg_a2LQBwCG` ✅ OK publicar
- **Service Role Key**: `ey...` 🔒 SECRETO (guardar en lugar seguro)

### 1.2 Mercado Pago Token

Ya tienes tus credenciales de prueba:

**Credenciales de Prueba (TEST):**
- **Public Key**: `TEST-37f92d37-7c4d-4215-a1a1-06de62c445c5`
- **Access Token**: `TEST-2995513543311110-052316-084049300b00c0baafa69692a693ccc6-513536259`
- **Application ID**: `2995513543311110`
- **User ID**: `513536259`
- **Integración**: Checkout Bricks ✓

Estas credenciales ya están en MODO TEST.
Para PRODUCCIÓN, tendrás que cambiarlas por las credenciales PROD.

## Parte 2: Configurar Variables Frontend

Archivo: `frontend/.env`

Ya está configurado, pero verificar que tenga:

```env
# Supabase (públicas, OK mostrar)
VITE_SUPABASE_URL=https://bgugepseqlyffrtfkepo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DI0rvTq6HCmGstBpLXupeg_a2LQBwCG

# Edge Functions URL
VITE_EDGE_FUNCTION_URL=https://bgugepseqlyffrtfkepo.supabase.co/functions/v1
```

## Parte 3: Configurar Secretos Backend

### Opción A: Usando Supabase CLI (Recomendado)

```bash
# 1. Login en Supabase
supabase login

# 2. Linkear proyecto
supabase link --project-ref bgugepseqlyffrtfkepo
# Te pedirá la contraseña de la BD

# 3. Agregar secretos
supabase secrets set SUPABASE_URL="https://bgugepseqlyffrtfkepo.supabase.co"

supabase secrets set SUPABASE_SERVICE_ROLE_KEY="ey..."
# Pegar el service role key completo de Step 1.1

supabase secrets set MERCADOPAGO_ACCESS_TOKEN="TEST-2995513543311110-052316-084049300b00c0baafa69692a693ccc6-513536259"
# Tu token específico (ya proporcionado)

# 4. Verificar que se establecieron
supabase secrets list
```

### Opción B: Usando Consola Web

1. Ir a: https://app.supabase.com/project/bgugepseqlyffrtfkepo/functions

2. Click en cualquier función (ej: `create-payment`)

3. Click en **"Secrets"** (arriba a la derecha)

4. Click en **"New secret"**

5. Agregar 3 secretos:

**Secreto 1:**
- Name: `SUPABASE_URL`
- Value: `https://bgugepseqlyffrtfkepo.supabase.co`

**Secreto 2:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `ey...` (pegar completo)

**Secreto 3:**
- Name: `MERCADOPAGO_ACCESS_TOKEN`
- Value: `TEST-1234567890...` (pegar completo)

## Parte 4: Verificar Configuración

### Verificar que secretos se establecieron

```bash
supabase secrets list
```

Debería mostrar algo como:

```
name                           value
─────────────────────────────  ──────────────
SUPABASE_URL                   https://...
SUPABASE_SERVICE_ROLE_KEY      ey...
MERCADOPAGO_ACCESS_TOKEN       TEST-...
```

### Probar Edge Functions

```bash
# Desplegar función con los secretos
supabase functions deploy create-payment

# Ver logs en tiempo real
supabase functions logs create-payment -f
```

### Hacer una prueba de pago

1. Ir a http://localhost:5173 (frontend)
2. Agregar producto al carrito
3. Checkout → "Pay with Mercado Pago"
4. Si funciona → Los secretos están bien configurados

## Parte 5: Configuración de Webhook (Mercado Pago)

Este paso es DESPUÉS de desplegar en Render o Supabase.

1. Ir a: https://www.mercadopago.com.ar/developers/panel

2. Configuración → Webhooks

3. Agregar URL:
   ```
   https://bgugepseqlyffrtfkepo.supabase.co/functions/v1/mercadopago-webhook
   ```

4. Eventos a escuchar:
   - ✅ payment.created
   - ✅ payment.updated

5. Click "Salvar"

## Parte 6: Cambiar a Producción (Cuando estés listo)

### En Mercado Pago

1. Cambiar credenciales de TEST a PROD
2. Nuevamente establecer el token:
   ```bash
   supabase secrets set MERCADOPAGO_ACCESS_TOKEN="YOUR_PROD_TOKEN"
   ```
3. Redeploy de funciones:
   ```bash
   supabase functions deploy mercadopago-webhook
   ```

### En Render

Las variables están en `.env`, pero si quieres cambiarlas sin modificar código:

1. Render Dashboard → Environment
2. Cambiar `VITE_SUPABASE_ANON_KEY` (aunque es pública)

## 🔒 Seguridad de Secretos

✅ **Hacer:**
- Usar Supabase CLI o consola web
- Guardar service role key en password manager
- Nunca commitear secretos a Git
- Cambiar token si se expone
- Usar HTTPS siempre

❌ **No hacer:**
- Poner secretos en `.env` del frontend
- Compartir service role key por chat
- Commitear tokens a Git
- Usar tokens de test en producción
- Hardcodear secretos en código

## 📝 Checklist Final

- [ ] SUPABASE_URL establecida
- [ ] SUPABASE_SERVICE_ROLE_KEY establecida
- [ ] MERCADOPAGO_ACCESS_TOKEN establecida
- [ ] `supabase secrets list` muestra los 3
- [ ] Edge Functions desplegadas
- [ ] Webhook configurada en Mercado Pago
- [ ] Prueba de pago exitosa

## 🆘 Troubleshooting

### Error: "Missing required environment variables" en Edge Function

Significa que los secretos NO están configurados.

Solución:
```bash
supabase secrets set VARIABLE_NAME "value"
supabase functions deploy nombre-funcion
```

### Error: "Invalid Mercado Pago token"

Significa que el token es inválido o expiró.

Solución:
1. Ir a Mercado Pago Developer
2. Generar nuevo Access Token
3. `supabase secrets set MERCADOPAGO_ACCESS_TOKEN "new_token"`
4. Redeploy

### Webhook no se dispara

Significa que la URL no está correcta.

Solución:
1. Ir a Mercado Pago → Webhooks
2. Verificar URL: `https://bgugepseqlyffrtfkepo.supabase.co/functions/v1/mercadopago-webhook`
3. Hacer test payment desde Mercado Pago

### "forbidden" en Edge Functions

Significa que la Service Role Key es inválida.

Solución:
1. Ir a Supabase Settings → API
2. Copiar Service Role Key completa
3. `supabase secrets set SUPABASE_SERVICE_ROLE_KEY "key_completa"`
4. Redeploy

---

**¡Listo! Secretos configurados de forma segura.** 🔒
