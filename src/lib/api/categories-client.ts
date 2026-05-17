/**
 * Categories API Client
 * Handles all HTTP requests to /api/categories endpoint
 */

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
  data?: StrapiCategory | StrapiCategory[]
}

const API_PATH = '/api/categories'

/**
 * Parse Strapi response to Category object
 */
function parseCategory(item: StrapiCategory): Category {
  return {
    id: item.id,
    documentId: item.documentId ?? '',
    name: item.name ?? item.attributes?.name ?? '',
    description: item.description ?? item.attributes?.description ?? ''
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<{ data: Category[]; error: string | null }> {
  try {
    console.log('[API] Fetching categories...')
    const response = await fetch(API_PATH, { cache: 'no-store' })

    if (!response.ok) {
      const message = await response.text()
      const error = `[API] Failed to fetch categories: ${response.status} - ${message}`
      console.error(error)
      return { data: [], error: message || 'Failed to load categories' }
    }

    const json = (await response.json()) as CategoriesApiResponse
    console.log('[API] Raw response:', json)
    
    const categories = (json.data ?? []).map((item: any) => {
      const parsed = parseCategory(item)
      console.log('[API] Parsed category:', parsed)
      return parsed
    })

    console.log('[API] Categories fetched successfully:', categories.length, 'items')
    console.log('[API] Category IDs:', categories.map(c => ({ id: c.id, type: typeof c.id })))
    return { data: categories, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const error = `[API] Error fetching categories: ${message}`
    console.error(error)
    return { data: [], error: message }
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  name: string,
  description: string
): Promise<{ data: Category | null; error: string | null }> {
  try {
    console.log('[API] Creating category:', { name, description })
    const response = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { name, description } })
    })

    if (!response.ok) {
      const message = await response.text()
      const error = `[API] Failed to create category: ${response.status} - ${message}`
      console.error(error)
      return { data: null, error: message || 'Failed to create category' }
    }

    const json = (await response.json()) as CategoriesApiResponse
    console.log('[API] Create response:', json)
    
    const createdItem = (json.data ?? {}) as StrapiCategory
    console.log('[API] Created item ID:', { id: createdItem.id, type: typeof createdItem.id })
    
    const category = parseCategory(createdItem)
    
    console.log('[API] Category created successfully:', category)
    return { data: category, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const error = `[API] Error creating category: ${message}`
    console.error(error)
    return { data: null, error: message }
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  documentId: string,
  name: string,
  description: string
): Promise<{ data: Category | null; error: string | null }> {
  try {
    console.log('[API] updateCategory called with:', {
    documentId,
    name,
    description
    })
    console.log('[API] updateCategory called with:', { documentId, name, description })
    const response = await fetch(`${API_PATH}/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { name, description } })
    })

    console.log('[API] updateCategory response status:', response.status)

    if (!response.ok) {
      const message = await response.text()
      const error = `[API] Failed to update category (${response.status}): ${message}`
      console.error(error)
      return { data: null, error: message || 'Failed to update category' }
    }

    const json = (await response.json()) as CategoriesApiResponse
    const updatedItem = (json.data ?? {}) as StrapiCategory
    const category = parseCategory(updatedItem)

    console.log('[API] Category updated successfully:', category)
    return { data: category, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const error = `[API] Error updating category: ${message}`
    console.error(error)
    return { data: null, error: message }
  }
}
/**
 * Delete a category
 */
export async function deleteCategory(documentId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('[API] Deleting category:', { documentId })
    const response = await fetch(`${API_PATH}/${documentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const message = await response.text()
      const error = `[API] Failed to delete category: ${response.status} - ${message}`
      console.error(error)
      return { success: false, error: message || 'Failed to delete category' }
    }

    console.log('[API] Category deleted successfully:', documentId)
    return { success: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const error = `[API] Error deleting category: ${message}`
    console.error(error)
    return { success: false, error: message }
  }
}
