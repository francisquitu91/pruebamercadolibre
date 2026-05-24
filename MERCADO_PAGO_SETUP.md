# 🛒 Mercado Pago Checkout Bricks Integration

Documentación completa para usar Mercado Pago Checkout Bricks con tu aplicación.

## 📋 Tus Credenciales

```
User ID:                 513536259
Application ID:          2995513543311110
Integración:             Checkout Bricks ✓

Modo TEST (Desarrollo)
├─ Public Key:           TEST-37f92d37-7c4d-4215-a1a1-06de62c445c5
├─ Access Token:         TEST-2995513543311110-052316-084049300b00c0baafa69692a693ccc6-513536259
└─ Estado:               Activo y listo para usar

Modo PROD (Producción)
└─ Se usarán credenciales diferentes (cuando estés listo)
```

## ✅ Configuración Actual

Tu proyecto está configurado con:

**Frontend (.env):**
```env
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-37f92d37-7c4d-4215-a1a1-06de62c445c5
VITE_MERCADOPAGO_APP_ID=2995513543311110
```

**Backend (Supabase Secrets):**
```
MERCADOPAGO_ACCESS_TOKEN=TEST-2995513543311110-052316-084049300b00c0baafa69692a693ccc6-513536259
```

## 🧪 Probar con Tarjetas de Test

Mercado Pago proporciona tarjetas virtuales para testing:

### Tarjeta Aprobada ✅
```
Número:     4111 1111 1111 1111
Fecha:      11/25 (cualquier fecha futura)
CVV:        123
Titular:    TEST TEST
```

**Resultado:** Pago aprobado inmediatamente

### Tarjeta Rechazada ❌
```
Número:     4222 2222 2222 2222
Fecha:      11/25 (cualquier fecha futura)
CVV:        123
Titular:    TEST TEST
```

**Resultado:** Pago rechazado

### Tarjeta Pendiente ⏳
```
Número:     4000 0000 0000 0002
Fecha:      11/25 (cualquier fecha futura)
CVV:        123
Titular:    TEST TEST
```

**Resultado:** Pago en estado pendiente

## 🚀 Flujo de Compra Paso a Paso

### 1. Usuario Agrega Productos

```
Frontend: ProductCard → Click "Add to Cart"
          ↓
Zustand:  Store actualiza carrito
          ↓
LocalStorage: Carrito guardado
```

### 2. Usuario va a Checkout

```
Frontend: Navbar → Cart icon
          ↓
Frontend: CartSidebar → "Proceed to Checkout"
          ↓
Frontend: CheckoutPage cargada
```

### 3. Completa Formulario

Campos:
- ✅ First Name
- ✅ Last Name
- ✅ Email (requerido)
- ✅ Phone (opcional)
- ✅ Document Type (DNI, Passport, RUC)
- ✅ Document Number

### 4. Click "Pay with Mercado Pago"

```
Frontend: CheckoutForm → handlePayment()
          ↓
POST /functions/v1/create-payment
          ↓
Backend (Edge Function):
  ├─ Valida productos en BD
  ├─ Recalcula total
  ├─ INSERT order (pending)
  ├─ INSERT order_items
  └─ POST https://api.mercadopago.com/checkout/preferences
          ↓
Response: {order_id, preference_id, init_point}
          ↓
Frontend: window.location.href = init_point
          ↓
Mercado Pago Checkout Bricks (Formulario de pago)
```

### 5. Usuario Paga en Mercado Pago

```
Checkout Bricks:
├─ Ingresa tarjeta
├─ Completa datos de pago
└─ Click "Pagar"
```

### 6. Webhook Notificación

```
Mercado Pago detecta pago
          ↓
POST /functions/v1/mercadopago-webhook
          ↓
Backend valida en API MP
          ↓
UPDATE orders SET status = "approved"
          ↓
Usuario redirigido a Success Page
```

## 🎯 Componentes Implicados

### Frontend
- **CheckoutForm.tsx**: Formulario de datos + botón de pago
- **SuccessPage.tsx**: Página de confirmación

### Backend
- **create-payment**: Crear orden + MP preference
- **mercadopago-webhook**: Recibir y procesar pagos

### Base de Datos
- **orders**: Guardar órdenes con estado
- **order_items**: Items de cada orden

## 📊 Estados de Pago

```
Estado         Significado              Acción del Backend
─────────────────────────────────────────────────────────
pending        Aguardando confirmación  Esperar webhook
approved       Pago aprobado ✓          Actualizar stock
rejected       Pago rechazado ✗         Notificar usuario
cancelled      Pago cancelado           Notificar usuario
refunded       Reembolso procesado      Restaurar stock
```

## 🔧 Configurar Webhook en Mercado Pago

⚠️ **Importante para producción:**

1. Ir a: https://www.mercadopago.com.ar/developers/panel/webhooks

2. Click en "Agregar nuevo"

3. Seleccionar eventos:
   ```
   ✅ payment.created
   ✅ payment.updated
   ```

4. Agregar URL:
   ```
   https://bgugepseqlyffrtfkepo.supabase.co/functions/v1/mercadopago-webhook
   ```

5. Click "Guardar"

6. Hacer test desde "Notificaciones de prueba"

## 📱 Checkout Bricks vs Checkout Preferencias

**Checkout Bricks (Actual):**
- ✅ Mejor UX (inline checkout)
- ✅ Moderno y responsive
- ✅ Menos redirects
- ✅ Recomendado por MP
- ✅ Más opciones de pago

**Checkout Preferencias (Anterior):**
- ✅ Más simple de implementar
- ⚠️ Redirige a MP (peor UX)
- ✅ Funciona en todos lados

Tu proyecto está optimizado para **Checkout Bricks**.

## 🔐 Seguridad

### Public Key (Frontend) ✅
```
TEST-37f92d37-7c4d-4215-a1a1-06de62c445c5
```
- ✅ Seguro publicar en frontend
- ✅ Solo lectura
- ✅ Permisos limitados

### Access Token (Backend) 🔒
```
TEST-2995513543311110-052316-084049300b00c0baafa69692a693ccc6-513536259
```
- 🔒 NUNCA en frontend
- 🔒 SOLO en Supabase Secrets
- 🔒 Acceso total a tu cuenta MP

## 📈 Monitorear Transacciones

En Mercado Pago Dashboard:
1. Ir a https://www.mercadopago.com.ar/home
2. Dashboard → Pagos recibidos
3. Filtrar por fecha/estado
4. Ver detalles de cada transacción

## 🆘 Troubleshooting

### Error: "Invalid Public Key"
```
Solución: Verificar que la Public Key es correcta en .env
TEST-37f92d37-7c4d-4215-a1a1-06de62c445c5
```

### Error: "Payment preference not created"
```
Solución: Verificar que el Access Token está en Supabase Secrets
```

### Webhook no se dispara
```
Solución: 
1. Ir a Mercado Pago → Webhooks
2. Verificar URL correcta
3. Hacer test de notificación
```

### Carrito desaparece después de pago
```
Solución: Es normal (localStorage se limpia)
Implementar: Mostrar confirmación de orden con número
```

## 🚀 Cambiar a PRODUCCIÓN

Cuando estés listo para vendidas reales:

### 1. Obtener Credenciales PROD

Ir a: https://www.mercadopago.com.ar/developers/panel/credentials

Copiar:
- Public Key (PROD)
- Access Token (PROD)

### 2. Actualizar .env

```env
VITE_MERCADOPAGO_PUBLIC_KEY=PROD-xxxx...
```

### 3. Actualizar Supabase Secrets

```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN="PROD-xxxx..."
```

### 4. Redeploy

```bash
supabase functions deploy mercadopago-webhook
supabase functions deploy create-payment
```

### 5. Actualizar Webhook en Mercado Pago

Cambiar URL si el dominio cambió.

## 💰 Comisiones

En TEST mode: **SIN COMISIONES** (para testing)

En PROD mode:
- Comisión estándar según tu tipo de cuenta
- Revisar: https://www.mercadopago.com.ar/ayuda/comisiones

## 📚 Referencias

- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
- [Checkout Bricks Docs](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks)
- [API Reference](https://www.mercadopago.com.ar/developers/es/reference)
- [Test Cards](https://www.mercadopago.com.ar/developers/es/guides/resources/test-cards)

## ✅ Checklist Final

- [x] Credenciales configuradas
- [x] Public Key en frontend
- [x] Access Token en Supabase Secrets
- [x] CheckoutForm con Bricks
- [x] Webhook configurada (para PROD)
- [x] Tarjetas de test listas
- [ ] Probar flujo completo
- [ ] Cambiar a PROD (cuando estés listo)

---

**Estado:** ✅ Listo para testing
**Modo:** TEST
**Próximo:** Probar con tarjetas de test y luego pasar a PROD
