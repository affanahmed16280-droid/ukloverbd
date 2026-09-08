'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Product } from '@/lib/products'
import { Upload, X, Edit2, Trash2, Save, Plus, Lock } from 'lucide-react'

// Helper function to construct Cloudinary URLs
const getImageUrl = (imageId: string): string => {
  if (!imageId || imageId === 'undefined' || imageId === 'null') {
    return 'https://via.placeholder.com/400?text=No+Image'
  }
  
  // If it's already a full URL, return it
  if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
    return imageId
  }
  
  // Otherwise construct Cloudinary URL
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'qvkox4mr'
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${imageId}`
}

interface ProductFormData {
  id?: string
  name: string
  brand: string
  variant: string
  price: string
  category: string
  image: string
  badge?: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const categories = ['Skincare', 'Body Care', 'Haircare', 'Cosmetics', 'Baby Care', 'Jewelry']
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'products'), orderBy('name'))
      const snapshot = await getDocs(q)
      const loadedProducts = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      } as Product))
      setProducts(loadedProducts)
    } catch (error) {
      console.error('Error loading products:', error)
      alert('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const initializeAdmin = async () => {
      await Promise.resolve()
      if (!active) return
      if (sessionStorage.getItem('adminAuth') === 'true') {
        setIsAuthenticated(true)
        void loadProducts()
      } else {
        setLoading(false)
      }
    }
    void initializeAdmin()
    return () => {
      active = false
    }
  }, [loadProducts])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ADMIN_PASSWORD) {
      setAuthError('Admin access is not configured. Add NEXT_PUBLIC_ADMIN_PASSWORD to the environment.')
      return
    }

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      loadProducts()
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setPassword('')
  }

  const handleImageUpload = async (files: FileList) => {
    setUploading(true)
    const uploadedProducts: Product[] = []

    try {
      console.log('Starting bulk upload for', files.length, 'files')
      
      for (const file of Array.from(files)) {
        console.log('Processing file:', file.name)
        const imagePublicId = await uploadToCloudinary(file)
        console.log('Image uploaded successfully:', imagePublicId)
        
        // Extract basic info from filename
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        const parts = fileName.split(/[-_]/)
        
        const newProduct: Product = {
          id: Date.now().toString() + Math.random(),
          name: parts[0] || 'New Product',
          brand: parts[1] || 'UK Brand',
          variant: parts.slice(2).join(' ') || 'Standard',
          price: 1500, // Default price
          category: 'Skincare',
          image: imagePublicId, // Store public_id, construct URL when displaying
          badge: 'New'
        }
        
        uploadedProducts.push(newProduct)
        console.log('Product created:', newProduct)
      }

      console.log('Adding products to Firestore...')
      // Add all to Firestore
      for (const product of uploadedProducts) {
        await addDoc(collection(db, 'products'), {
          name: product.name,
          brand: product.brand,
          variant: product.variant,
          price: product.price,
          category: product.category,
          image: product.image,
          badge: product.badge
        })
      }

      console.log('Loading products from Firestore...')
      await loadProducts()
      alert(`Successfully uploaded ${uploadedProducts.length} products!`)
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        variant: formData.variant,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
        badge: formData.badge
      }

      if (formData.id) {
        // Update existing
        await updateDoc(doc(db, 'products', formData.id), productData)
      } else {
        // Add new
        await addDoc(collection(db, 'products'), productData)
      }

      await loadProducts()
      setEditingProduct(null)
      setIsAddingNew(false)
      alert('Product saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await deleteDoc(doc(db, 'products', id))
      await loadProducts()
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete product')
    }
  }

  const startEditing = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      brand: product.brand,
      variant: product.variant,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      badge: product.badge
    })
  }

  const startAddingNew = () => {
    setEditingProduct({
      name: '',
      brand: '',
      variant: '',
      price: '',
      category: 'Skincare',
      image: ''
    })
    setIsAddingNew(true)
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Login</h1>
            <p className="text-muted-foreground text-sm">Enter password to access product management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter admin password"
                required
              />
            </div>

            {authError && (
              <div className="text-destructive text-sm">{authError}</div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Login to Admin Panel
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Admin access is configured privately through the deployment environment.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Product Management</h1>
            <p className="text-muted-foreground">Upload and manage your product inventory</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Bulk Upload Section */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Bulk Image Upload</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Upload multiple product images at once. Products will be created with default information that you can edit below.
          </p>
          
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              disabled={uploading}
              className="hidden"
              id="bulk-upload"
            />
            <label
              htmlFor="bulk-upload"
              className="cursor-pointer inline-flex flex-col items-center gap-2"
            >
              <Upload size={48} className="text-primary" />
              <span className="text-sm font-medium">
                {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB each
              </span>
            </label>
          </div>
        </div>

        {/* Add New Product Button */}
        <div className="mb-6">
          <button
            onClick={startAddingNew}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>

        {/* Edit/Add Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {isAddingNew ? 'Add New Product' : 'Edit Product'}
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setIsAddingNew(false)
                  }}
                  className="p-2 hover:bg-secondary rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveProduct(editingProduct)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Variant</label>
                  <input
                    type="text"
                    value={editingProduct.variant}
                    onChange={(e) => setEditingProduct({ ...editingProduct, variant: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="text"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Paste a Cloudinary public ID or full image URL.</p>
                  {editingProduct.image && (
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Badge (optional)</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    placeholder="e.g., New, Sale, Best Seller"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null)
                      setIsAddingNew(false)
                    }}
                    className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Product Inventory ({products.length})</h2>
          
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products yet. Upload images or add a new product to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="aspect-square bg-secondary rounded-lg mb-3 overflow-hidden">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', product.image, 'Product:', product.name)
                        console.log('Product data:', product)
                        e.currentTarget.src = 'https://via.placeholder.com/400?text=Fix+Image+URL'
                      }}
                    />
                  </div>
                  
                  <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <p className="text-lg font-bold text-primary mt-1">৳{product.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                  
                  {product.badge && (
                    <span className="inline-block mt-2 px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                      {product.badge}
                    </span>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startEditing(product)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => product.id && handleDeleteProduct(product.id)}
                      className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
