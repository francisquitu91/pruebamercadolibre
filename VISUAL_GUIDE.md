# 🎯 E-Commerce MVP - Guía Visual

Guía visual y rápida del proyecto completo.

## 📊 Stack Technology

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER PRESENTACIÓN                         │
│             React 18 + TypeScript + Vite                     │
│         TailwindCSS + Zustand + React Router                 │
│                  [frontend/] ~500 líneas                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  TIER APLICACIÓN                              │
│        Supabase Edge Functions (Deno) - Serverless           │
│  create-payment | mercadopago-webhook | order-status        │
│              [supabase/functions/] ~400 líneas                │
└─────────────────────────────────────────────────────────────┘
        ↓                              ↓
    ┌───────────────┐         ┌───────────────┐
    │  PostgreSQL   │         │  Mercado Pago │
    │  (Supabase)   │         │      API      │
    │               │         │               │
    │ - products    │         │ - Pagos       │
    │ - orders      │         │ - Webhooks    │
    │ - order_items │         │ - Verificación│
    └───────────────┘         └───────────────┘
```

## 🗂️ Estructura de Carpetas Simplificada

```
frontend/
├── src/
│   ├── components/       ← Componentes React reutilizables
│   ├── pages/           ← Páginas de la aplicación
│   ├── context/         ← Zustand store (carrito)
│   ├── services/        ← Funciones para llamadas API
│   ├── lib/             ← Inicialización de Supabase
│   ├── types/           ← TypeScript interfaces
│   ├── App.tsx          ← Router principal
│   ├── main.tsx         ← Entry point
│   └── index.css        ← Estilos Tailwind
├── index.html           ← HTML principal
├── package.json         ← Dependencias
├── vite.config.ts       ← Configuración Vite
├── tailwind.config.js   ← Config Tailwind
└── .env                 ← Variables públicas

supabase/
├── functions/
│   ├── create-payment/          ← Crear pago
│   ├── mercadopago-webhook/     ← Recibir notificación pago
│   └── order-status/            ← Consultar estado
├── migrations/
│   └── 20240101000000_init.sql  ← Crear tablas
└── config.toml                  ← Configuración
```

## 🔄 Flujos Principales

### Flujo 1: Ver Productos

```
Usuario abre app
    ↓
HomePage carga
    ↓
getProducts() → SELECT FROM products
    ↓
RLS: permitido (producto es público)
    ↓
5 ProductCards mostradas
```

### Flujo 2: Agregar al Carrito

```
Click "Add to Cart"
    ↓
Zustand store.addToCart()
    ↓
localStorage actualizado
    ↓
CartSidebar muestra items
    ↓
Badge del carrito se actualiza
```

### Flujo 3: Checkout y Pago

```
CheckoutForm → Email + Click "Pay"
    ↓
POST /functions/v1/create-payment {items}
    ↓
Edge Function:
  ├─ Valida productos en BD
  ├─ Calcula total real
  ├─ INSERT order (pending)
  ├─ INSERT order_items
  └─ POST Mercado Pago preference
    ↓
Response: {order_id, init_point}
    ↓
window.location.href = init_point
    ↓
Usuario en checkout de Mercado Pago
```

### Flujo 4: Procesar Pago (Webhook)

```
Usuario paga en Mercado Pago
    ↓
Mercado Pago → webhook notificación
    ↓
POST /functions/v1/mercadopago-webhook
    ↓
Edge Function:
  ├─ Verifica pago en API MP
  ├─ UPDATE order status
  └─ (Opcional) decrement stock
    ↓
BD actualizada
    ↓
SuccessPage muestra estado
```

## 🗄️ Modelo de Datos

### Tabla: products
```
┌─────────────────────────────────┐
│ products                         │
├─────────────────────────────────┤
│ id (UUID) PRIMARY KEY           │
│ name (TEXT) NOT NULL            │
│ description (TEXT)              │
│ price (DECIMAL) NOT NULL        │
│ stock (INTEGER) ≥ 0             │
│ image_url (TEXT)                │
│ created_at (TIMESTAMP)          │
└─────────────────────────────────┘
```

### Tabla: orders
```
┌─────────────────────────────────┐
│ orders                           │
├─────────────────────────────────┤
│ id (UUID) PRIMARY KEY           │
│ user_id (UUID) NULLABLE         │
│ total (DECIMAL) ≥ 0             │
│ status (TEXT)                   │
│   'pending' / 'approved' /      │
│   'rejected' / 'cancelled'      │
│ mercadopago_payment_id (TEXT)   │
│ created_at (TIMESTAMP)          │
└─────────────────────────────────┘
```

### Tabla: order_items
```
┌─────────────────────────────────┐
│ order_items                      │
├─────────────────────────────────┤
│ id (UUID) PRIMARY KEY           │
│ order_id (UUID) FOREIGN KEY     │
│ product_id (UUID) FOREIGN KEY   │
│ quantity (INTEGER) > 0          │
│ price (DECIMAL) > 0             │
│ created_at (TIMESTAMP)          │
└─────────────────────────────────┘
```

## 🔐 Seguridad en Tres Niveles

### Nivel 1: Frontend (Público)
```
✅ Variables públicas (.env)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_EDGE_FUNCTION_URL

❌ Nunca exponer
- Service Role Key
- Mercado Pago token
- Base de datos passwords
```

### Nivel 2: Edge Functions (Privado)
```
🔒 Secretos en Supabase
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- MERCADOPAGO_ACCESS_TOKEN

Usados para:
- Validar datos
- Acceder a BD con permisos totales
- Llamar API Mercado Pago
```

### Nivel 3: Base de Datos (RLS)
```
🔐 Row Level Security
- Productos: TODOS pueden leer
- Órdenes: Usuario solo ve suyas
- Order Items: A través de orden
```

## 📱 Páginas del Frontend

| Página | Ruta | Componentes | Funcionalidad |
|--------|------|-------------|--------------|
| **Home** | `/` | ProductCard × 5 | Ver productos |
| **Cart** | `/cart` | CartSidebar | Editar carrito |
| **Checkout** | `/checkout` | CheckoutForm | Procesar pago |
| **Success** | `/success` | Estado badge | Mostrar resultado |

## 🔌 Edge Functions

| Función | Método | URL | Propósito |
|---------|--------|-----|----------|
| **create-payment** | POST | `/functions/v1/create-payment` | Crear orden + MP preference |
| **mercadopago-webhook** | POST | `/functions/v1/mercadopago-webhook` | Recibir notificación pago |
| **order-status** | GET | `/functions/v1/order-status?order_id=...` | Consultar estado orden |

## 📋 Checklist de Implementación

### Frontend ✅
- [x] React app con Vite
- [x] TailwindCSS styles
- [x] React Router
- [x] Zustand cart
- [x] Supabase SDK
- [x] 4 páginas principales
- [x] 4 componentes principales
- [x] TypeScript estricto
- [x] Error handling básico

### Backend ✅
- [x] 3 Edge Functions
- [x] Validación de datos
- [x] Integración Mercado Pago
- [x] Webhook listener
- [x] Error handling

### Base de Datos ✅
- [x] 3 tablas
- [x] Relaciones FK
- [x] Índices
- [x] RLS habilitado
- [x] Migraciones SQL

### Seguridad ✅
- [x] Totales en backend
- [x] Stock validado
- [x] Secretos protegidos
- [x] HTTPS everywhere
- [x] Webhook verificado

### Documentación ✅
- [x] README.md
- [x] SETUP.md
- [x] DEPLOYMENT.md
- [x] QUICKSTART.md
- [x] ARCHITECTURE.md
- [x] SECRETS.md
- [x] STATUS.md

## 🚀 Comandos Rápidos

```bash
# Instalar y ejecutar
cd frontend && npm install && npm run dev

# Desplegar Edge Functions
supabase functions deploy create-payment

# Configurar secretos
supabase secrets set VARIABLE "value"

# Ver logs
supabase functions logs create-payment -f

# Ejecutar migraciones
supabase db push
```

## 🎯 Próximos Pasos

1. **Local Testing** ← Estás aquí
   - [x] Instalar dependencias
   - [x] Ejecutar `npm run dev`
   - [x] Probar flujo de compra

2. **Producción** ← Siguiente
   - [ ] Cambiar credenciales Mercado Pago (PROD)
   - [ ] Desplegar en Render
   - [ ] Configurar webhook final
   - [ ] Llenar más productos

3. **Mejoras** ← Futuro
   - [ ] Auth de usuarios
   - [ ] Admin panel
   - [ ] Email confirmación
   - [ ] Descuentos

## 📞 Ayuda

Si algo no funciona:
1. Revisar logs: `supabase functions logs`
2. Verificar secretos: `supabase secrets list`
3. Consultar console del navegador (F12)
4. Ver documentación: README.md o SETUP.md

---

**Estado**: ✅ Completado y funcional
**Versión**: 1.0.0 MVP
**Última actualización**: 2024
