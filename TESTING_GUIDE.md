# 🧪 Probar Checkout - Guía Rápida

Instrucciones para probar el flujo completo de compra con Mercado Pago Checkout Bricks.

## 🚀 Inicio Rápido

### Paso 1: Instalar y Ejecutar
```bash
cd "c:\Users\franc\Prueba Ecommerce\frontend"
npm install
npm run dev
```

### Paso 2: Abrir en Navegador
```
http://localhost:5173
```

### Paso 3: Agregar Producto al Carrito
```
1. Página inicio muestra 5 productos
2. Seleccionar cantidad (1-5)
3. Click en "Add to Cart"
4. Badge del carrito se actualiza (+1)
```

### Paso 4: Ir a Checkout
```
1. Click en icono carrito (navbar)
2. Ver resumen del carrito
3. Click en "Proceed to Checkout"
```

### Paso 5: Completar Formulario
```
Campos:
├─ First Name:      Juan
├─ Last Name:       Pérez
├─ Email:           juan@example.com (REQUERIDO)
├─ Phone:           +54 9 11 1234-5678
├─ Document Type:   DNI
└─ Document Number: 12345678

⚠️ El email es requerido
```

### Paso 6: Iniciar Pago
```
1. Click en "Pay $XX.XX with Mercado Pago"
2. Esperar a que se procese
3. Serás redirigido a Mercado Pago Checkout Bricks
```

### Paso 7: Ingresar Tarjeta de Test

**Para Pago Aprobado ✅:**
```
Número:     4111 1111 1111 1111
Fecha:      11/25
CVV:        123
Titular:    TEST TEST
```

O simplemente completa con cualquier dato en los campos.

### Paso 8: Confirmar Pago
```
1. Seleccionar la tarjeta
2. Completar datos (pueden ser ficticios)
3. Click en "Pagar"
4. Esperar confirmación
```

### Paso 9: Ver Resultado
```
✅ Serás redirigido a Success Page
✅ Mostrar estado: "Payment Approved!"
✅ Ver Order ID
```

## 📊 Estados de Test

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| **Aprobada** | 4111 1111 1111 1111 | ✅ Pago procesado |
| **Rechazada** | 4222 2222 2222 2222 | ❌ Pago rechazado |
| **Pendiente** | 4000 0000 0000 0002 | ⏳ Pendiente de confirmación |

## 🔄 Flujo Visual

```
NAVEGADOR (Home)
    ↓
    [Ver 5 productos]
    ↓
    Agregar "Laptop Pro" al carrito
    ↓
CARRITO
    ↓
    [Resumen: Laptop Pro $1299.99]
    ↓
    Click "Proceed to Checkout"
    ↓
CHECKOUT
    ↓
    Completar datos:
    ├─ First Name: Juan
    ├─ Last Name: Pérez
    ├─ Email: juan@test.com
    └─ Document: 12345678
    ↓
    Click "Pay $1299.99 with Mercado Pago"
    ↓
MERCADO PAGO CHECKOUT BRICKS
    ↓
    Ingresar tarjeta: 4111 1111 1111 1111
    ├─ Fecha: 11/25
    ├─ CVV: 123
    └─ Titular: Test
    ↓
    Click "Pagar"
    ↓
SUCCESS PAGE ✅
    ↓
    [Payment Approved!]
    [Order ID: xxxxxxxx]
```

## 🐛 Si Algo Falla

### "Cannot find module" o errores de Node
```bash
# Solución:
rm -rf node_modules
npm install
npm run dev
```

### Productos no cargan
```
Causas posibles:
1. Supabase no configurado
2. Variables de entorno incorrectas
3. Base de datos vacía

Solución: Ver SETUP.md paso 4 (insertar productos)
```

### No se puede hacer clic en "Pay"
```
Causas posibles:
1. Email vacío
2. Carrito vacío
3. Formulario inválido

Solución: Completar email y verificar carrito no vacío
```

### Redirige a Mercado Pago pero error
```
Causas posibles:
1. Credenciales incorrectas
2. Edge Functions no desplegadas
3. Secrets no configurados

Solución: Ver SECRETS.md para configurar
```

### Pago va pero no llega a Success Page
```
Causas posibles:
1. Webhook no configurado
2. BD no actualizada
3. SessionStorage vacío

Solución: Ver MERCADO_PAGO_SETUP.md
```

## 📝 Qué Verificar

### En Navegador (F12 Console)

Antes de pagar:
```javascript
// Ver carrito
localStorage.getItem('cart-storage')
// Debe mostrar los items en JSON

// Ver variables de entorno
console.log(import.meta.env.VITE_SUPABASE_URL)
// Debe mostrar la URL
```

Después de pagar:
```javascript
// Ver order ID guardado
sessionStorage.getItem('pending_order_id')
// Debe mostrar un UUID
```

### En Network Tab (DevTools)

1. Abrir DevTools → Network
2. Hacer click en "Pay"
3. Buscar requests a:
   ```
   bgugepseqlyffrtfkepo.supabase.co/functions/v1/create-payment
   ```
4. Ver response (debe ser JSON con order_id)

## ✅ Checklist de Testing

- [ ] npm run dev ejecutándose
- [ ] Página carga en http://localhost:5173
- [ ] 5 productos visibles en home
- [ ] Puedo agregar producto al carrito
- [ ] Badge de carrito se actualiza
- [ ] Puedo ir a Cart page
- [ ] Puedo hacer checkout
- [ ] Formulario valida email requerido
- [ ] Puedo click en Pay
- [ ] Se abre Mercado Pago Checkout Bricks
- [ ] Puedo ingresar tarjeta
- [ ] Puedo hacer clic en Pagar
- [ ] Regreso a Success Page después de 5 segundos
- [ ] Estado muestra "approved"

## 🎯 Próximos Pasos

### Si Todo Funciona ✅
```
1. ¡Felicidades! El flujo está completo
2. Probar con las 3 tarjetas de test
3. Revisar órdenes en Supabase
4. Listo para deployment
```

### Si Algo No Funciona ❌
```
1. Revisar console del navegador (F12)
2. Ver logs de Edge Functions:
   supabase functions logs create-payment -f
3. Consultar tablas en Supabase console
4. Revisar SECRETS.md para secretos
```

## 📊 Ver Órdenes Creadas

En Supabase Console:

1. Ir a: https://app.supabase.com/project/bgugepseqlyffrtfkepo/editor/tables/public
2. Seleccionar tabla: **orders**
3. Ver las órdenes creadas
4. Status debe cambiar a "approved" después del pago

## 💡 Tips

1. **Múltiples productos**
   - Agregar varios productos con cantidades diferentes
   - Ver que el total se calcula correctamente

2. **Probar los 3 estados**
   - Aprobado: 4111 1111 1111 1111
   - Rechazado: 4222 2222 2222 2222
   - Pendiente: 4000 0000 0000 0002

3. **Ver respuestas de servidor**
   - DevTools → Network → create-payment
   - Ver JSON con order_id

4. **Logs de funciones**
   ```bash
   supabase functions logs create-payment -f
   supabase functions logs mercadopago-webhook -f
   ```

## 🚀 Cuando Estés Listo para PROD

1. Cambiar credenciales en Mercado Pago
2. Actualizar .env con credenciales PROD
3. Desplegar a Render
4. Configurar webhook final en Mercado Pago
5. ¡A vender! 💰

---

**Estado:** ✅ Listo para testing
**Duración:** 5-10 minutos por prueba
**Resultados esperados:** Órdenes en BD con status approved
