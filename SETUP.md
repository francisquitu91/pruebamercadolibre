# 📋 Setup Paso a Paso

Guía completa para configurar y ejecutar el proyecto localmente.

## Paso 1: Clonar el Repositorio

```bash
git clone <tu-repo>
cd Prueba\ Ecommerce
```

## Paso 2: Instalar Node Modules del Frontend

```bash
cd frontend
npm install
```

Esto instalará:
- React 18
- TypeScript
- Vite
- TailwindCSS
- Supabase SDK
- Zustand
- React Router

## Paso 3: Configurar Supabase CLI

### Instalar Supabase CLI (global)

```bash
npm install -g supabase
```

### Login en Supabase

```bash
supabase login
```

Se abrirá una ventana del navegador. Ingresa con tu cuenta Supabase.

### Linkear Proyecto Existente

En la raíz del proyecto:

```bash
supabase link --project-ref bgugepseqlyffrtfkepo
```

Cuando te pida contraseña de base de datos, escribe la que uses en tu proyecto Supabase.

## Paso 4: Ejecutar Migraciones SQL

```bash
supabase db push
```

Esto creará:
- Tabla `products`
- Tabla `orders`
- Tabla `order_items`
- Índices
- RLS Policies

Verificar en la consola de Supabase que las tablas existan:
https://app.supabase.com/project/bgugepseqlyffrtfkepo/sql

## Paso 5: Insertar Productos de Prueba

En la consola SQL de Supabase, ejecutar:

```sql
INSERT INTO products (name, description, price, stock, image_url) VALUES
('Laptop Pro', 'Potente laptop para desarrollo', 1299.99, 5, 'https://via.placeholder.com/300x300?text=Laptop'),
('Mouse Inalámbrico', 'Mouse ergonómico sin cables', 49.99, 20, 'https://via.placeholder.com/300x300?text=Mouse'),
('Teclado Mecánico', 'Teclado con switches mecánicos', 129.99, 15, 'https://via.placeholder.com/300x300?text=Keyboard'),
('Monitor 4K', 'Monitor ultra HD 4K 27"', 599.99, 8, 'https://via.placeholder.com/300x300?text=Monitor'),
('Webcam HD', 'Cámara web 1080p', 79.99, 30, 'https://via.placeholder.com/300x300?text=Webcam');
```

Verificar en: **Project → SQL Editor → Run**

## Paso 6: Obtener Service Role Key

1. Ir a: https://app.supabase.com/project/bgugepseqlyffrtfkepo/settings/api
2. Copiar `service_role key` (la larga)
3. Guardar en un lugar seguro

## Paso 7: Obtener Token de Mercado Pago

1. Crear cuenta en Mercado Pago Developers: https://www.mercadopago.com.ar/developers
2. Ir a Credentials
3. Copiar **Access Token** (modo test)

## Paso 8: Configurar Secretos de Edge Functions

Opción A: Usar Supabase CLI

```bash
supabase secrets set SUPABASE_URL="https://bgugepseqlyffrtfkepo.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
supabase secrets set MERCADOPAGO_ACCESS_TOKEN="tu-mercado-pago-token-aqui"
```

Opción B: Ir a la consola web
- https://app.supabase.com/project/bgugepseqlyffrtfkepo/functions
- Click en cualquier función → "Secrets"
- Agregar los 3 secretos

## Paso 9: Desplegar Edge Functions

```bash
supabase functions deploy create-payment
supabase functions deploy mercadopago-webhook  
supabase functions deploy order-status
```

Verificar en: https://app.supabase.com/project/bgugepseqlyffrtfkepo/functions

## Paso 10: Verificar Variables de Entorno del Frontend

Verificar que `.env` tenga:

```env
VITE_SUPABASE_URL=https://bgugepseqlyffrtfkepo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DI0rvTq6HCmGstBpLXupeg_a2LQBwCG
VITE_EDGE_FUNCTION_URL=https://bgugepseqlyffrtfkepo.supabase.co/functions/v1
```

## Paso 11: Ejecutar Frontend Localmente

```bash
cd frontend
npm run dev
```

Debería abrir automáticamente en: http://localhost:5173

## Paso 12: Probar el Flujo

1. **Ver productos**: Deberías ver 5 productos en la home
2. **Agregar carrito**: Click en "Add to Cart"
3. **Ir a cart**: Link en navbar
4. **Checkout**: Poner email y click en "Pay with Mercado Pago"
5. **Pago simulado**: 
   - Usar test card: `4111 1111 1111 1111`
   - Fecha: cualquier futura (ej: 11/25)
   - CVV: 123
   - Click "Pagar"

Si todo funciona, serás redirigido a success page con estado "approved".

## Troubleshooting

### Error: "Cannot find module @supabase/supabase-js"

```bash
cd frontend
npm install --save @supabase/supabase-js
```

### Error: "Edge Functions URL not working"

Verificar:
1. Que las funciones estén desplegadas: `supabase functions list`
2. Que la URL en `.env` sea correcta
3. Revisar logs: `supabase functions logs create-payment`

### Error: "Missing environment variables"

Verificar que los secretos están en Supabase:
```bash
supabase secrets list
```

Debe mostrar los 3 secretos.

### Carrito no persiste

Es normal en primera ejecución. Zustand lo guarda en localStorage automáticamente.

### Productos no cargan

1. Verificar que existan en la DB: SQL Editor → SELECT * FROM products
2. Verificar RLS: Policy de lectura debe estar permitida
3. Revisar console del navegador para ver error

## Comandos Útiles

```bash
# Ver logs de Edge Functions
supabase functions logs create-payment -f

# Desplegar una función específica
supabase functions deploy create-payment

# Listar todas las funciones
supabase functions list

# Ver estado de migraciones
supabase migrations list

# Borrar datos de prueba (cuidado!)
# En SQL Editor: DELETE FROM products;
```

## Siguiente: Deploy en Render

Ver archivo `DEPLOYMENT.md` para instrucciones de deploy a producción.
