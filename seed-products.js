import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgugepseqlyffrtfkepo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndWdlcHNlcWx5ZmZydGZrZXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU1NDc0NywiZXhwIjoyMDk1MTMwNzQ3fQ.5Koy1qTW1kg0VPYB2QMq3qIfr74kP-boj4J4a3Ku0co'

const supabase = createClient(supabaseUrl, supabaseKey)

const products = [
  {
    name: 'Laptop Gaming',
    description: 'Laptop de alto rendimiento para gaming',
    price: 1299.99,
    stock: 5,
    image_url: 'https://via.placeholder.com/300x300?text=Gaming+Laptop'
  },
  {
    name: 'Auriculares Inalámbricos',
    description: 'Auriculares con noise cancelling',
    price: 199.99,
    stock: 15,
    image_url: 'https://via.placeholder.com/300x300?text=Auriculares'
  },
  {
    name: 'Monitor 4K',
    description: 'Monitor 4K de 32 pulgadas',
    price: 599.99,
    stock: 8,
    image_url: 'https://via.placeholder.com/300x300?text=Monitor+4K'
  },
  {
    name: 'Teclado Mecánico',
    description: 'Teclado mecánico RGB',
    price: 149.99,
    stock: 20,
    image_url: 'https://via.placeholder.com/300x300?text=Teclado'
  },
  {
    name: 'Mouse Gaming',
    description: 'Mouse con 12,000 DPI',
    price: 79.99,
    stock: 25,
    image_url: 'https://via.placeholder.com/300x300?text=Mouse'
  }
]

async function seedProducts() {
  try {
    console.log('Insertando productos...')
    
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (error) {
      console.error('Error al insertar productos:', error)
      return
    }

    console.log(`✅ ${data.length} productos insertados correctamente`)
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error:', error)
  }
}

seedProducts()
