# 🏃 Quick Start - 5 Minutos

Instrucciones ultra-rápidas para ejecutar el proyecto localmente.

## Requisitos Instalados

✅ Node.js 18+
✅ Git
✅ Supabase CLI: `npm i -g supabase`

## Comandos

```bash
# 1. Navegar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar servidor de desarrollo
npm run dev
```

**Automáticamente abrirá:** http://localhost:5173

## Listo! 🎉

Ya deberías ver:
- Navbar con carrito
- 5 productos de prueba
- Funcionalidad de carrito completa
- Checkout con Mercado Pago

## Primeros Pasos

1. Click en "Add to Cart" en un producto
2. Ver carrito (icono navbar)
3. "Proceed to Checkout"
4. Poner email y "Pay with Mercado Pago"
5. Usar tarjeta de test: `4111 1111 1111 1111`

## Setup Completo

Si necesitas todo desde cero (BD, backend, etc), ver: **SETUP.md**

## Deploy a Producción

Cuando estés listo: **DEPLOYMENT.md**

---

**¿Algo no funciona?**

1. Verificar que Node 18+ está instalado: `node --version`
2. Borrar `node_modules` y `.next` (si existe): `rm -rf node_modules`
3. Reinstalar: `npm install`
4. Ejecutar de nuevo: `npm run dev`

Si aún hay problemas, revisar los logs del navegador (F12).
