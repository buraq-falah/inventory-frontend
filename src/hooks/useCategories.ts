import { useCallback, useState } from 'react'

const categoriesApiPath = '/api/categories'

export type Category = {
  id: number | string
  documentId?: string
  name: string
  description: string | null
}

type StrapiCategory = {
  id: number | string
    documentId?: string
  name?: string
  description?: string
  attributes?: {
    name?: string
    description?: string
  }
}

type CategoriesApiResponse = {
  data?: StrapiCategory[]
}

export const useCategories = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(categoriesApiPath, { cache: 'no-store' })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to load categories')
      }

      const json = (await response.json()) as CategoriesApiResponse

      const categories: Category[] = (json.data ?? []).map(item => ({
        id: item.id,
          documentId: item.documentId,
        name: item.name ?? item.attributes?.name ?? '',
        description: item.description ?? item.attributes?.description ?? ''
      }))

      return categories
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Error loading categories:', message)
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCategory = useCallback(
    async (name: string, description: string): Promise<Category | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(categoriesApiPath, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              name,
              description
            }
          })
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Failed to create category')
        }

        const responseBody = await response.json()
        const createdItem = responseBody.data ?? responseBody

        const category: Category = {
          id: createdItem.id,
          name: createdItem.name ?? createdItem.attributes?.name ?? name,
          description: createdItem.description ?? createdItem.attributes?.description ?? description ?? ''
        }

        return category
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('Error creating category:', message)
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const updateCategory = useCallback(
    async (documentId: string, name: string, description: string): Promise<Category | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${categoriesApiPath}/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              name,
              description
            }
          })
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Failed to update category')
        }

        const responseBody = await response.json()
        const updatedItem = responseBody.data ?? responseBody

        const category: Category = {
          id: updatedItem.id,
          name: updatedItem.name ?? updatedItem.attributes?.name ?? name,
          description: updatedItem.description ?? updatedItem.attributes?.description ?? description ?? ''
        }

        return category
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('Error updating category:', message)
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const deleteCategory = useCallback(async (documentId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${categoriesApiPath}/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to delete category')
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Error deleting category:', message)
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
