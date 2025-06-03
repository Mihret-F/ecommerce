'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem)

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
        <Link href={`/product/${product.id}`}>
          <div className="relative h-64 w-full">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain object-center group-hover:opacity-75 transition-opacity duration-300"
              priority={false}
              quality={75}
            />
          </div>
        </Link>
      </div>
      <div className="p-4">
        <h3 className="text-sm text-gray-700 line-clamp-2">
          <Link href={`/product/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
        <div className="mt-4">
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
} 