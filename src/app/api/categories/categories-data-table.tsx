'use client'

import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from 'react'

import { MoreHorizontal, SearchIcon } from 'lucide-react'

import type { Column, ColumnDef, ColumnFiltersState, PaginationState, RowData, SortingState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCategories, type Category } from '@/hooks/useCategories'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const DataTableWithColumnFilterDemo = () => {
  const { isLoading, error: hookError, fetchCategories: fetchCategoriesHook, createCategory, updateCategory, deleteCategory } = useCategories()
  const [items, setItems] = useState<Category[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryDescription, setEditCategoryDescription] = useState('')
  const [isEditingSaving, setIsEditingSaving] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false
    }
  ])

  const loadCategories = useCallback(async () => {
    const categories = await fetchCategoriesHook()
    setItems(categories)
  }, [fetchCategoriesHook])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setEditCategoryName(category.name)
    setEditCategoryDescription(category.description ?? '')
    setEditSheetOpen(true)
  }

  const handleDelete = async (category: Category) => {
    const success = await deleteCategory(category.documentId)
    if (success) {
      setItems(prevItems => prevItems.filter(item => item.documentId !== category.documentId))
    }
  }

  const columns: ColumnDef<Category>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      )
    },
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => <span>{row.original.name}</span>
    },
    {
      header: 'Description',
      accessorKey: 'description',
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.description ?? '-'}</span>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' type='button' className='flex items-center gap-2'>
              Actions
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-36'>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive' onClick={() => handleDelete(row.original)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false
    }
  ]

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    enableSortingRemoval: false
  })

  return (
    <div className='w-full'>
      <div className='rounded-md border'>
        <div className='px-6 py-4 border-b'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Categories</h2>
              <p className='text-sm text-muted-foreground'>List of categories</p>
            </div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className='h-10' type='button'>
                  New category
                </Button>
              </SheetTrigger>
              <SheetContent side='right'>
                <SheetHeader>
                  <SheetTitle>Create new category</SheetTitle>
                </SheetHeader>
                <form
                  className='flex flex-col gap-4 p-4'
                  onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault()
                    setIsSaving(true)

                    const newCategory = await createCategory(newCategoryName, newCategoryDescription)

                    if (newCategory) {
                      setItems(prevItems => [newCategory, ...prevItems])
                      setPagination(old => ({ ...old, pageIndex: 0 }))
                      setNewCategoryName('')
                      setNewCategoryDescription('')
                      setSheetOpen(false)
                    }

                    setIsSaving(false)
                  }}
                >
                  <div className='grid gap-2'>
                    <Label htmlFor='category-name'>Name</Label>
                    <Input
                      id='category-name'
                      value={newCategoryName}
                      onChange={event => setNewCategoryName(event.target.value)}
                      placeholder='Category name'
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='category-description'>Description</Label>
                    <textarea
                      id='category-description'
                      value={newCategoryDescription}
                      onChange={event => setNewCategoryDescription(event.target.value)}
                      placeholder='Category description'
                      className='min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button variant='secondary' type='button' onClick={() => setSheetOpen(false)}>
                      Cancel
                    </Button>
                    <Button type='submit' disabled={isSaving || !newCategoryName.trim()}>
                      {isSaving ? 'Saving...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
            
            <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
              <SheetContent side='right'>
                <SheetHeader>
                  <SheetTitle>Edit category</SheetTitle>
                </SheetHeader>
                <form
                  className='flex flex-col gap-4 p-4'
                  onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault()
                    if (!editingCategory) return

                    console.log('[Component] Editing category:', { editingCategory, newName: editCategoryName, newDescription: editCategoryDescription })
                    setIsEditingSaving(true)

                    const updatedCategory = await updateCategory(editingCategory.documentId, editCategoryName, editCategoryDescription)

                    if (updatedCategory) {
                      setItems(prevItems =>
                        prevItems.map(item =>
                          item.documentId === editingCategory.documentId
                            ? {
                                ...item,
                                name: editCategoryName,
                                description: editCategoryDescription
                              }
                            : item
                        )
                      )
                      setEditingCategory(null)
                      setEditCategoryName('')
                      setEditCategoryDescription('')
                      setEditSheetOpen(false)
                    }

                    setIsEditingSaving(false)
                  }}
                >
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-category-name'>Name</Label>
                    <Input
                      id='edit-category-name'
                      value={editCategoryName}
                      onChange={event => setEditCategoryName(event.target.value)}
                      placeholder='Category name'
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-category-description'>Description</Label>
                    <textarea
                      id='edit-category-description'
                      value={editCategoryDescription}
                      onChange={event => setEditCategoryDescription(event.target.value)}
                      placeholder='Category description'
                      className='min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button variant='secondary' type='button' onClick={() => {
                      setEditSheetOpen(false)
                      setEditingCategory(null)
                    }}>
                      Cancel
                    </Button>
                    <Button type='submit' disabled={isEditingSaving || !editCategoryName.trim()}>
                      {isEditingSaving ? 'Saving...' : 'Update'}
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className='flex flex-wrap gap-3 px-2 py-6'>
          <div className='w-44'>
            <Filter column={table.getColumn('name')!} />
          </div>
          <div className='w-72'>
            <Filter column={table.getColumn('description')!} />
          </div>
        </div>
        {hookError ? (
          <div className='px-6 py-4 text-sm text-destructive'>
            {hookError}
          </div>
        ) : null}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='bg-muted/50'>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} className='relative h-10 border-t select-none'>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='text-sm text-muted-foreground'>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className='flex items-center gap-2'>
            <label htmlFor='page-size' className='text-sm text-muted-foreground'>
              Rows per page:
            </label>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={value => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger id='page-size' className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map(pageSize => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <p className='text-muted-foreground mt-4 text-center text-sm'>Data table with column filter and pagination</p>
    </div>
  )
}

function Filter({ column }: { column: Column<Category, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range') return []

    const values = Array.from(column.getFacetedUniqueValues().keys())

    const flattenedValues = values.reduce((acc: string[], curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr]
      }

      return [...acc, curr]
    }, [])

    return Array.from(new Set(flattenedValues)).sort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'range') {
    return (
      <div className='*:not-first:mt-2'>
        <Label>{columnHeader}</Label>
        <div className='flex'>
          <Input
            id={`${id}-range-1`}
            className='flex-1 rounded-r-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'
            value={(columnFilterValue as [number, number])?.[0] ?? ''}
            onChange={e =>
              column.setFilterValue((old: [number, number]) => [
                e.target.value ? Number(e.target.value) : undefined,
                old?.[1]
              ])
            }
            placeholder='Min'
            type='number'
            aria-label={`${columnHeader} min`}
          />
          <Input
            id={`${id}-range-2`}
            className='-ms-px flex-1 rounded-l-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'
            value={(columnFilterValue as [number, number])?.[1] ?? ''}
            onChange={e =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                e.target.value ? Number(e.target.value) : undefined
              ])
            }
            placeholder='Max'
            type='number'
            aria-label={`${columnHeader} max`}
          />
        </div>
      </div>
    )
  }

  if (filterVariant === 'select') {
    return (
      <div className='*:not-first:mt-2'>
        <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
        <Select
          value={columnFilterValue?.toString() ?? 'all'}
          onValueChange={value => {
            column.setFilterValue(value === 'all' ? undefined : value)
          }}
        >
          <SelectTrigger id={`${id}-select`} className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            {sortedUniqueValues.map(value => (
              <SelectItem key={String(value)} value={String(value)}>
                {String(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className='*:not-first:mt-2'>
      <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
      <div className='relative'>
        <Input
          id={`${id}-input`}
          className='peer pl-9'
          value={(columnFilterValue ?? '') as string}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={`Search ${columnHeader.toLowerCase()}`}
          type='text'
        />
        <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  )
}

export default DataTableWithColumnFilterDemo
