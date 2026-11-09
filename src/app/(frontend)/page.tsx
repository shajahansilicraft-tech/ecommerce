import React from 'react'
import { StorefrontClient } from '@/components/StorefrontClient'
import { getCachedStorefrontData } from '@/lib/storefront'

export default async function HomePage() {
  const { categories, products, heroMain, heroMaterials, storyFeature } =
    await getCachedStorefrontData()

  return (
    <StorefrontClient
      categories={categories}
      products={products}
      heroMain={heroMain}
      heroMaterials={heroMaterials}
      storyFeature={storyFeature}
    />
  )
}
