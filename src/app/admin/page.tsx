'use client'

import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Edit2, Loader2, LockKeyhole, LogOut, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { isAdmin, signInAsAdmin } from '@/lib/adminAuth'
import { auth, db } from '@/lib/firebase'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import { cloudinaryUrl, productFromFirestore, type Product } from '@/lib/products'
import { uploadProductImage } from '@/lib/productStorage'

interface ProductFormData {
  id?: string
  name: string
  brand: string
  variant: string
  price: string
  category: string
  image: string
  badge: string
}

const emptyProduct = (): ProductFormData => ({
  name: '', brand: 'UK Brand Lover', variant: '', price: '', category: 'Skincare', image: '', badge: '',
})

function draftFromProduct(product: Product): ProductFormData {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    variant: product.variant,
    price: String(product.price),
    category: product.category,
    image: product.image,
    badge: product.badge ?? '',
  }
}

function productNameFromFile(file: File): string {
  return file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'New product'
}

export default function AdminPage() {
  const [authenticationState, setAuthenticationState] = useState<'checking' | 'signed-out' | 'authorized'>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const snapshot = await getDocs(collection(db, 'products'))
      const loadedProducts = snapshot.docs
        .map((document) => productFromFirestore(document.id, document.data()))
        .filter((product): product is Product => product !== null)
        .sort((a, b) => a.name.localeCompare(b.name))
      setProducts(loadedProducts)
    } catch (caughtError) {
      console.error('Unable to load products for administration', caughtError)
      setError('Products could not be loaded. Check that your Firebase rules have been deployed.')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setError(null)
      setNotice(null)

      if (!user) {
        setAuthenticationState('signed-out')
        return
      }

      try {
        if (await isAdmin(user)) {
          setAuthenticationState('authorized')
          void loadProducts()
          return
        }

        await signOut(auth)
        setAuthenticationState('signed-out')
        setError('This account does not have administrator access.')
      } catch (caughtError) {
        console.error('Unable to verify administrator access', caughtError)
        setAuthenticationState('signed-out')
        setError('Administrator access could not be verified. Please try again.')
      }
    })

    return unsubscribe
  }, [loadProducts])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoginLoading(true)
    setError(null)

    try {
      await signInAsAdmin(email, password)
      setPassword('')
      setAuthenticationState('authorized')
      await loadProducts()
    } catch (caughtError) {
      console.error('Admin sign-in failed', caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign in.')
    } finally {
      setLoginLoading(false)
    }
  }

  const closeEditor = () => {
    setEditingProduct(null)
    setImageFile(null)
  }

  const handleBulkUpload = async (files: FileList) => {
    setUploading(true)
    setError(null)
    setNotice(null)

    try {
      let created = 0
      for (const file of Array.from(files)) {
        const imageUrl = await uploadProductImage(file)
        await addDoc(collection(db, 'products'), {
          title: productNameFromFile(file),
          brand: 'UK Brand Lover',
          variant: '',
          price: 0,
          category: 'Skincare',
          image_url: imageUrl,
          badge: 'New',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        created += 1
      }
      await loadProducts()
      setNotice(`${created} product${created === 1 ? '' : 's'} uploaded. Review the details before publishing prices.`)
    } catch (caughtError) {
      console.error('Bulk image upload failed', caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Images could not be uploaded.')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingProduct) return

    const price = Number(editingProduct.price)
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price of zero or greater.')
      return
    }

    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      const imageUrl = imageFile ? await uploadProductImage(imageFile) : editingProduct.image.trim()
      if (!imageUrl) throw new Error('Upload an image or provide an image URL before saving.')

      const productData = {
        title: editingProduct.name.trim(),
        brand: editingProduct.brand.trim() || 'UK Brand Lover',
        variant: editingProduct.variant.trim(),
        price,
        category: editingProduct.category,
        image_url: imageUrl,
        badge: editingProduct.badge.trim(),
        updatedAt: serverTimestamp(),
      }

      if (!productData.title) throw new Error('A product name is required.')

      if (editingProduct.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData)
      } else {
        await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() })
      }

      await loadProducts()
      closeEditor()
      setNotice('Product saved successfully.')
    } catch (caughtError) {
      console.error('Saving product failed', caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Product could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setError(null)
    setNotice(null)

    try {
      await deleteDoc(doc(db, 'products', id))
      await loadProducts()
      setNotice('Product deleted.')
    } catch (caughtError) {
      console.error('Deleting product failed', caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Product could not be deleted.')
    }
  }

  if (authenticationState === 'checking') return <LoadingScreen label="Checking administrator access…" />

  if (authenticationState === 'signed-out') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><LockKeyhole size={30} className="text-primary" /></div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin sign in</h1>
            <p className="text-muted-foreground text-sm">Use the Firebase account that has the administrator claim.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Email"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" autoComplete="email" required /></Field>
            <Field label="Password"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input" autoComplete="current-password" required /></Field>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button type="submit" disabled={loginLoading} className="primary-button w-full">{loginLoading && <Loader2 size={16} className="animate-spin" />}{loginLoading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-4xl font-bold text-foreground">Product management</h1><p className="mt-2 text-muted-foreground">Manage product details and secure product images.</p></div>
          <button onClick={() => void signOut(auth)} className="secondary-button"><LogOut size={16} /> Sign out</button>
        </header>

        {error && <p className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        {notice && <p className="mb-6 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

        <section className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold">Bulk image upload</h2>
          <p className="mt-2 text-sm text-muted-foreground">Images are stored in Firebase Storage. New products are saved with a draft price of ৳0.</p>
          <label className="mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Upload size={42} className="text-primary" />
            <span className="font-medium">{uploading ? 'Uploading…' : 'Choose product images'}</span>
            <span className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF — up to 10 MB each</span>
            <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(event) => event.target.files && void handleBulkUpload(event.target.files)} />
          </label>
        </section>

        <button onClick={() => { setEditingProduct(emptyProduct()); setImageFile(null) }} className="primary-button mb-6"><Plus size={18} /> Add product</button>

        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-semibold">{editingProduct.id ? 'Edit product' : 'Add product'}</h2><button onClick={closeEditor} className="p-2 rounded-full hover:bg-secondary" aria-label="Close editor"><X size={20} /></button></div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Product name"><input value={editingProduct.name} onChange={(event) => setEditingProduct({ ...editingProduct, name: event.target.value })} className="input" required /></Field>
                  <Field label="Brand"><input value={editingProduct.brand} onChange={(event) => setEditingProduct({ ...editingProduct, brand: event.target.value })} className="input" required /></Field>
                  <Field label="Variant"><input value={editingProduct.variant} onChange={(event) => setEditingProduct({ ...editingProduct, variant: event.target.value })} className="input" /></Field>
                  <Field label="Price (৳)"><input type="number" min="0" step="1" value={editingProduct.price} onChange={(event) => setEditingProduct({ ...editingProduct, price: event.target.value })} className="input" required /></Field>
                  <Field label="Category"><select value={editingProduct.category} onChange={(event) => setEditingProduct({ ...editingProduct, category: event.target.value })} className="input">{PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></Field>
                  <Field label="Badge (optional)"><input value={editingProduct.badge} onChange={(event) => setEditingProduct({ ...editingProduct, badge: event.target.value })} className="input" placeholder="New, Sale, Best Seller" /></Field>
                </div>
                <Field label="Image URL"><input type="url" value={editingProduct.image} onChange={(event) => setEditingProduct({ ...editingProduct, image: event.target.value })} className="input" placeholder="https://…" /></Field>
                <Field label="Or upload a replacement"><input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="input file:mr-3 file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-sm" /></Field>
                {editingProduct.image && <img src={cloudinaryUrl(editingProduct.image, 320, 320)} alt="Product preview" className="h-40 w-40 rounded-xl object-cover" />}
                {imageFile && <p className="text-sm text-muted-foreground">Selected image: {imageFile.name}</p>}
                <div className="flex gap-3 pt-3"><button type="submit" disabled={saving} className="primary-button flex-1">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{saving ? 'Saving…' : 'Save product'}</button><button type="button" onClick={closeEditor} className="secondary-button">Cancel</button></div>
              </form>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-5">Inventory ({products.length})</h2>
          {loadingProducts ? <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : products.length === 0 ? <p className="py-12 text-center text-muted-foreground">No products have been added yet.</p> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="rounded-xl border border-border p-4">
                  <img src={cloudinaryUrl(product.image, 400, 400)} alt={product.name} className="mb-3 aspect-square w-full rounded-lg object-cover bg-secondary" />
                  <h3 className="font-semibold text-foreground truncate">{product.name}</h3><p className="text-sm text-muted-foreground">{product.brand}</p><p className="mt-1 font-bold text-primary">{product.price > 0 ? `৳${product.price.toLocaleString()}` : 'Price on request'}</p><p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                  <div className="mt-4 flex gap-2"><button onClick={() => { setEditingProduct(draftFromProduct(product)); setImageFile(null) }} className="secondary-button flex-1"><Edit2 size={15} /> Edit</button><button onClick={() => void handleDeleteProduct(product.id)} className="rounded-lg bg-destructive/10 px-3 text-destructive hover:bg-destructive/20" aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground"><span className="mb-2 block">{label}</span>{children}</label>
}

function LoadingScreen({ label }: { label: string }) {
  return <main className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">{label}</main>
}
