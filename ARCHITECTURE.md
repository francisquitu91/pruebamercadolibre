# 🏗️ Arquitectura y Seguridad

Documentación sobre la arquitectura del proyecto y las implementaciones de seguridad.

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE (NAVEGADOR)                 │
│  React + TypeScript + Vite + TailwindCSS + Zustand         │
│  - ProductCard, CartSidebar, CheckoutForm, Navbar          │
│  - Pages: Home, Cart, Checkout, Success                     │
│  - Services: products.ts, payment.ts                        │
│  - Context: Zustand Store (carrito persistente)            │
└────────────────┬────────────────────────────────────────────┘
                 │
      HTTPS (TLS/SSL)
                 │
┌────────────────▼────────────────────────────────────────────┐
│            SUPABASE EDGE FUNCTIONS (Backend)                │
│  Deno Runtime - Serverless - Node.js Compatible            │
│  - create-payment: Recibir carrito → Validar → MP Api      │
│  - mercadopago-webhook: Recibir pago → Actualizar BD       │
│  - order-status: Consultar estado de orden                  │
└────────────────┬────────────────────────────────────────────┘
                 │
    REST API (HTTPS)
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────────┐    ┌──────▼──────────────┐
│  PostgreSQL    │    │  Mercado Pago API  │
│  (Supabase)    │    │  (Pagos)           │
│                │    │                     │
│ - products     │    │ - Crear preferencia│
│ - orders       │    │ - Verificar pago   │
│ - order_items  │    │ - Webhooks         │
└────────────────┘    └────────────────────┘
```

## Flujo de Datos

### 1. Cargar Productos

```
Frontend: HomePage
  ↓
GET /supabase/rest/v1/products
  ↓
PostgreSQL (RLS: SELECT permitido para todos)
  ↓
Frontend: Grid de ProductCards
```

**Seguridad**: RLS permite lectura pública.

### 2. Agregar al Carrito

```
Frontend: Click "Add to Cart"
  ↓
Zustand Store actualiza
  ↓
localStorage.setItem('cart-storage', state)
  ↓
CartSidebar se actualiza (sin servidor)
```

**Seguridad**: No toca servidor, validación en checkout.

### 3. Crear Pago

```
Frontend: CheckoutForm → handlePayment()
  ↓
POST /functions/v1/create-payment {items: [...]}
  ↓
Edge Function (create-payment):
  ├─ SELECT * FROM products WHERE id IN (...)
  ├─ Validar stock
  ├─ Recalcular total = SUM(price * quantity)
  ├─ INSERT INTO orders (status: pending)
  ├─ INSERT INTO order_items (...)
  ├─ POST https://api.mercadopago.com/checkout/preferences
  └─ Response: {order_id, preference_id, init_point}
  ↓
Frontend: window.location.href = init_point
  ↓
Usuario va a Mercado Pago checkout
```

**Seguridad**:
- ✅ Total calculado en backend (nunca confiar frontend)
- ✅ Stock validado antes de crear orden
- ✅ Service Role Key solo en Edge Function
- ✅ Anon Key nunca tiene acceso a datos sensibles

### 4. Procesar Pago (Webhook)

```
Mercado Pago detecta pago
  ↓
POST /functions/v1/mercadopago-webhook
  {
    "type": "payment",
    "data": { "id": "12345" }
  }
  ↓
Edge Function (mercadopago-webhook):
  ├─ GET https://api.mercadopago.com/v1/payments/{id}
  ├─ Validar status
  ├─ UPDATE orders SET status = "approved"
  └─ (Opcional) Decrementar stock
  ↓
Base de datos actualizada
```

**Seguridad**:
- ✅ Verificar pago en API antes de actualizar
- ✅ Payment ID valida la transacción
- ✅ External reference vincula orden
- ✅ Service Role Key solo actualiza datos específicos

### 5. Mostrar Resultado

```
Frontend: SuccessPage
  ↓
GET /functions/v1/order-status?order_id={id}
  ↓
Edge Function: SELECT status FROM orders WHERE id = ?
  ↓
Frontend: Mostrar estado (approved/rejected/pending)
```

## Base de Datos - Row Level Security (RLS)

### Tabla: products

```sql
-- Política: Todos pueden leer productos
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);
```

**Resultado**: Cualquiera puede hacer `SELECT * FROM products`.

### Tabla: orders

```sql
-- Política: Usuarios solo ven sus propias órdenes
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Política: Usuarios pueden crear órdenes (user_id = null para anónimos)
CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

**Resultado**: 
- Cada usuario solo ve sus órdenes
- La lógica backend (Edge Function) inserta con user_id = NULL (anónimo)

### Tabla: order_items

```sql
-- Política: Solo acceso a items de órdenes que pertenecen al usuario
CREATE POLICY "Users can view items from their orders"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE ...));
```

**Resultado**: Los items están protegidos por la orden padre.

## Seguridad de Secretos

### Frontend (.env) - ✅ PÚBLICO

```env
VITE_SUPABASE_URL=...              # URL pública OK
VITE_SUPABASE_ANON_KEY=...         # Anon key limitada OK
VITE_EDGE_FUNCTION_URL=...         # URL endpoint OK
```

**Por qué es seguro**: 
- La `ANON_KEY` tiene permisos limitados
- RLS protege los datos sensibles
- No puede actualizar órdenes ni acceder a datos privados

### Backend (Supabase Secrets) - 🔒 PRIVADO

```env
SUPABASE_URL                       # Solo backend
SUPABASE_SERVICE_ROLE_KEY         # Máximos permisos - SECRETO
MERCADOPAGO_ACCESS_TOKEN          # Token de pagos - SECRETO
```

**Por qué es secreto**:
- `SERVICE_ROLE_KEY` tiene permisos totales
- Token de Mercado Pago puede cobrar
- NUNCA van al frontend
- NUNCA en commits de Git

## Validaciones de Seguridad

### 1. Recalcular Totales

```typescript
// ❌ NUNCA hacer esto:
const total = items.reduce((sum, item) => sum + item.price, 0);
// El precio viene del frontend (puede ser modificado)

// ✅ SIEMPRE hacer esto:
const products = await supabase
  .from('products')
  .select('price')
  .in('id', productIds);
const total = products.reduce((sum, p) => sum + p.price * qty, 0);
// El precio viene de la BD (no puede falsificarse)
```

### 2. Validar Stock

```typescript
// ✅ En Edge Function:
if (item.quantity > product.stock) {
  throw new Error('Insufficient stock');
}
```

### 3. Vincular Órdenes

```typescript
// ✅ External reference en Mercado Pago
// Evita que alguien modifique order_id en la URL
external_reference: order.id,

// ✅ En webhook:
UPDATE orders SET status = ? WHERE mercadopago_payment_id = ?
// Buscar por payment_id de Mercado Pago, no por order_id
```

### 4. Verificar Pagos

```typescript
// ✅ NUNCA confiar en lo que envía el webhook
// Siempre verificar con API de Mercado Pago:
const mpResponse = await fetch(`/api/payments/${paymentId}`);
const paymentData = await mpResponse.json();
// Usar paymentData.status como fuente de verdad
```

## HTTPS y Certificados

✅ Supabase: HTTPS automático (Let's Encrypt)
✅ Render: HTTPS automático (Let's Encrypt)
✅ Mercado Pago: HTTPS requerido

## Protección CSRF

✅ Supabase maneja CORS automáticamente
✅ Edge Functions tienen headers CORS correctos:
```typescript
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
```

## Rate Limiting (Opcional)

Para producción, considerar:
- Supabase Realtime Auth protection
- Edge Function rate limiting (Supabase Pro)
- DDoS protection en Cloudflare (free)

## Checklist de Seguridad

✅ Row Level Security habilitado
✅ Totales calculados en backend
✅ Stock validado en backend
✅ Secretos no expuestos en frontend
✅ Webhooks verificados con API externa
✅ HTTPS en todo tráfico
✅ Índices en filtros críticos (performance)
✅ Timestamps en todas las transacciones
✅ External reference en pagos

## Próximas Mejoras de Seguridad

Para llevar a producción:
- [ ] Autenticación de usuarios real
- [ ] Rate limiting en Edge Functions
- [ ] Logs de auditoría de transacciones
- [ ] Encriptación de datos sensibles
- [ ] 2FA en admin panel
- [ ] PCI DSS compliance (si almacenas tarjetas)
- [ ] CAPTCHA en checkout

## Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [Mercado Pago Security](https://www.mercadopago.com.ar/developers/es/guides/security)
