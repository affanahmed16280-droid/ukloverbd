'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Phone,
  MessageCircle,
  X,
} from 'lucide-react'
import { getStoreProducts, type Product } from '@/lib/products'
import { PRODUCT_CATEGORIES, productMatchesCategory } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'

// Helper function to construct Cloudinary URLs
const getImageUrl = (imageId: string): string => {
  if (!imageId) return 'https://via.placeholder.com/400?text=No+Image'
  
  // If it's already a full URL, return it
  if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
    return imageId
  }
  
  // Otherwise construct Cloudinary URL
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'qvkox4mr'
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${imageId}`
}

const referenceAsset = (path: string, width = 1920) => `https://ukbrandlover.vercel.app/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=75`

const heroSlides = [
  {
    eyebrow: 'Premium UK Beauty & Lifestyle Finds',
    title: 'UK Brand Lover',
    copy: 'Beauty · Lifestyle · Confidence',
    image: referenceAsset('/_next/static/immutable/media/1.07tqpc9km0xjp.png'),
  },
  {
    eyebrow: 'Premium UK Beauty & Lifestyle Finds',
    title: 'Curated beauty. Direct from the UK.',
    copy: 'Authentic skincare, cosmetics, and lifestyle finds selected with care.',
    image: referenceAsset('/_next/static/immutable/media/2.041jmo1gnnjdo.jpg'),
  },
  {
    eyebrow: 'Premium UK Beauty & Lifestyle Finds',
    title: 'Small luxuries. Big confidence.',
    copy: 'Meet the cult favourites worth making room for.',
    image: referenceAsset('/_next/static/immutable/media/3.3lylvzqbi0xdr.jpg', 3840),
  },
]

const categories = [
  { name: 'Skincare', caption: 'Glow starts here', image: referenceAsset('/_next/static/immutable/media/hero_card_img2.433dc5na4j-n9.png', 1080) },
  { name: 'Cosmetics', caption: 'Make your look', image: referenceAsset('/_next/static/immutable/media/hero_card_img3.1f8mvb3hlzk97.png', 640) },
  { name: 'Haircare', caption: 'Good hair days', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=85' },
  { name: 'Body & Bath', caption: 'Rituals to unwind', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=85' },
]

export default function Page() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [storeProducts, setStoreProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name'>('featured')
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  
  const cartStore = useCartStore()
  const count = cartStore.totalItems()

  const slide = heroSlides[activeSlide]
  
  const filteredProducts = useMemo(() => {
    let filtered = storeProducts.filter((product) =>
      `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query.toLowerCase())
    )
    
    if (selectedCategory !== 'All Products') {
      if (selectedCategory === 'Offers') {
        filtered = filtered.filter(product => product.badge && ['Sale', 'Best Seller', 'New'].includes(product.badge))
      } else {
        filtered = filtered.filter(product => productMatchesCategory(product, selectedCategory))
      }
    }
    
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        const createdAt = (product: Product) => product.createdAt || 0
        return createdAt(b) - createdAt(a)
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name)

      if (sortBy === 'price-asc' || sortBy === 'price-desc') {
        const aPrice = a.price > 0 ? a.price : sortBy === 'price-asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
        const bPrice = b.price > 0 ? b.price : sortBy === 'price-asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
        return sortBy === 'price-asc' ? aPrice - bPrice : bPrice - aPrice
      }

      const rank = (product: Product) => {
        if (product.badge === 'Best Seller') return 0
        if (product.badge === 'Sale') return 1
        if (product.badge === 'New' || product.badge === 'New Arrival') return 2
        return 3
      }
      return rank(a) - rank(b)
    })
  }, [query, selectedCategory, sortBy, storeProducts])

  // Load products from Firestore
  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const firestoreProducts = await getStoreProducts()
        if (active) setStoreProducts(firestoreProducts)
      } catch (error) {
        console.error("Unable to load products from Firestore", error)
        if (active) {
          setProductsError('Products could not be loaded. Please refresh the page and try again.')
        }
      } finally {
        if (active) setProductsLoading(false)
      }
    }

    void loadProducts()

    return () => {
      active = false
    }
  }, [])

  // Listen for category changes from header
  useEffect(() => {
    const handleCategoryChange = (event: CustomEvent) => {
      setSelectedCategory(event.detail)
    }

    const handleSearchChange = (event: CustomEvent) => {
      setQuery(event.detail)
    }

    window.addEventListener('categoryChange', handleCategoryChange as EventListener)
    window.addEventListener('searchChange', handleSearchChange as EventListener)

    return () => {
      window.removeEventListener('categoryChange', handleCategoryChange as EventListener)
      window.removeEventListener('searchChange', handleSearchChange as EventListener)
    }
  }, [])

  const nextSlide = () => setActiveSlide((current) => (current + 1) % heroSlides.length)
  const previousSlide = () => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)

  const selectCategory = (category: string) => {
    setSelectedCategory(category)
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveSlide((current) => (current + 1) % heroSlides.length)
      }
    }, 6500)
    return () => window.clearInterval(timer)
  }, [])

  const handleAddToCart = (product: Product) => {
    if (product.price <= 0) {
      const message = `Hi, please share the current price for ${product.name}.`
      window.open(`https://wa.me/8801959524393?text=${encodeURIComponent(message)}`, '_blank')
      return
    }

    cartStore.addItem({
      id: product.id,
      brand: product.brand,
      name: product.name,
      variant: product.variant,
      price: product.price,
      image: getImageUrl(product.image)
    })
  }

  return (
    <main className="min-h-screen bg-background smooth-scroll">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="mx-auto max-w-[1250px] px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span className="font-medium">01959-524393</span>
            </div>
            <a href="https://wa.me/8801959524393" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
              <MessageCircle size={14} />
              <span>ORDER VIA CALL OR WHATSAPP</span>
            </a>
          </div>
          <div className="font-medium">
            FREE DELIVERY IN DHAKA ON ORDERS OVER 5,000
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1250px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center" aria-label="UK Brand Lover home">
            <img src={referenceAsset('/_next/static/immutable/media/Web Logo.20rlswvxrsbzd.png', 640)} alt="UK Brand Lover Logo" className="h-12 w-auto object-contain" />
          </a>

          <nav className="hidden items-center gap-9 text-sm font-medium text-foreground/80 md:flex" aria-label="Primary navigation">
            <a className="transition-colors hover:text-primary" href="#top">Home</a>
            <a className="transition-colors hover:text-primary" href="#shop">Shop</a>
            <a className="transition-colors hover:text-primary" href="#contact">Contact</a>
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <label className="flex h-9 w-[255px] items-center gap-2 rounded-full border border-border bg-secondary/30 px-4 text-muted-foreground focus-within:border-primary/50">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search beauty products</span>
              <input 
                value={query} 
                onChange={(event) => setQuery(event.target.value)} 
                placeholder="Search Boots, Cetaphil, CeraVe..." 
                className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" 
              />
            </label>
            
            <button 
              type="button" 
              onClick={() => cartStore.openCart()}
              className="flex items-center gap-2 text-sm font-medium" 
              aria-label={`Shopping cart with ${count} item`}
            >
              <ShoppingBag size={19} strokeWidth={1.8} />
              <span>Cart</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{count}</span>
            </button>
          </div>

          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-2 text-primary md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-card/95 px-5 py-5 shadow-lg md:hidden">
            <label className="mb-4 flex h-11 items-center gap-3 rounded-full border border-border bg-secondary/40 px-4 text-muted-foreground focus-within:border-primary/50">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search beauty products</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the edit..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </label>
            <nav className="flex flex-col gap-4 text-sm font-medium" aria-label="Mobile navigation">
              <a href="#top" onClick={() => setMenuOpen(false)}>Home</a>
              <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            </nav>
            <button type="button" onClick={() => { cartStore.openCart(); setMenuOpen(false) }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
              <ShoppingBag size={16} /> View cart {count > 0 ? `(${count})` : ''}
            </button>
          </div>
        )}
      </header>

      <div id="top" className="mx-auto max-w-[1250px] px-5 pb-20 pt-8 lg:px-8 lg:pt-9">
        <section className="relative overflow-hidden rounded-[28px] border border-border bg-secondary shadow-[0_14px_50px_rgba(125,94,154,0.10)]">
          <div className="relative min-h-[390px] overflow-hidden sm:min-h-[500px] lg:min-h-[540px]">
            <img src={slide.image} alt="Premium cosmetics arranged in a soft lilac beauty setting" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#21172a]/90 via-[#21172a]/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex max-w-2xl flex-col justify-center px-7 py-14 text-white sm:px-12 lg:px-16">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-white/75">{slide.eyebrow}</p>
              <h1 className="max-w-xl text-4xl leading-[1.05] tracking-[-0.04em] sm:text-6xl">{slide.title}</h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/80 sm:text-base">{slide.copy}</p>
            </div>
            <div className="sr-only">
              <h1>{slide.title}</h1>
              <p>{slide.eyebrow}. {slide.copy}</p>
            </div>
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((item, index) => <button key={item.title} type="button" aria-label={`Show slide ${index + 1}`} onClick={() => setActiveSlide(index)} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-7 bg-primary' : 'w-1.5 bg-primary/30'}`} />)}
            </div>
            <button type="button" onClick={previousSlide} className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-primary shadow-sm" aria-label="Previous slide"><ChevronLeft size={19} /></button>
            <button type="button" onClick={nextSlide} className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-primary shadow-sm" aria-label="Next slide"><ChevronRight size={19} /></button>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div className="relative flex min-h-[310px] overflow-hidden rounded-[25px] border border-border bg-[#f5edf5] p-7 sm:p-10">
            <div className="relative z-10 max-w-[58%] sm:max-w-[400px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-card/70 px-3 py-1.5 text-[10px] font-semibold text-primary"><Sparkles size={12} className="text-accent" /> 100% Original UK Imports</span>
              <h2 className="mt-5 text-3xl leading-tight text-foreground sm:text-4xl">Curated beauty & skincare.<br /><span className="font-normal text-primary">Direct from the UK.</span></h2>
              <p className="mt-4 max-w-[350px] text-sm leading-6 text-muted-foreground">Discover authentic dermatological skincare, cult cosmetics, and premium haircare imported directly to Bangladesh.</p>
              <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Starts from <strong className="ml-2 text-2xl normal-case tracking-normal text-primary">1,650</strong></p>
            </div>
            <img src={referenceAsset('/_next/static/immutable/media/hero_card_img1.0u_ojkaqn9byt.png', 640)} alt="Woman enjoying her skincare routine" className="absolute bottom-0 right-0 h-[88%] w-[38%] object-cover object-top mix-blend-multiply sm:h-[96%] sm:w-[42%]" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <a href="#shop" className="group flex min-h-[145px] items-center justify-between overflow-hidden rounded-[25px] border border-border bg-card px-6 py-5">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-primary">Top selected</p><h3 className="mt-2 text-2xl">Skincare</h3><span className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary">Shop skincare <ArrowRight size={14} /></span></div>
              <img src={categories[0].image} alt="Skincare products" className="h-28 w-36 object-cover mix-blend-multiply transition-transform group-hover:scale-105" />
            </a>
            <a href="#shop" className="group flex min-h-[145px] items-center justify-between overflow-hidden rounded-[25px] border border-border bg-card px-6 py-5">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-accent">Exclusive deals</p><h3 className="mt-2 text-2xl">Cosmetics</h3><span className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary">Shop cosmetics <ArrowRight size={14} /></span></div>
              <img src={categories[1].image} alt="Cosmetics products" className="h-28 w-36 object-cover mix-blend-multiply transition-transform group-hover:scale-105" />
            </a>
          </div>
        </section>

        <section id="shop" className="mt-20 scroll-mt-28">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Find your ritual</p><h2 className="mt-2 text-4xl text-foreground">Shop by category</h2></div><a href="#products" className="hidden items-center gap-2 text-sm font-semibold text-primary sm:flex">View all <ArrowRight size={15} /></a></div>
          <div className="mt-6 flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${selectedCategory === category ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary/50'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
            {categories.map((category) => <button type="button" onClick={() => selectCategory(category.name)} key={category.name} className="group relative aspect-[0.9] overflow-hidden rounded-[22px] bg-secondary text-left"><img src={category.image} alt={`${category.name} category`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 pt-12 text-primary-foreground"><p className="text-lg font-semibold">{category.name}</p><p className="mt-1 text-xs text-primary-foreground/75">{category.caption}</p></div></button>)}
          </div>
        </section>

        <section id="products" className="mt-20 scroll-mt-28">
          <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">The edit</p>
              <h2 className="mt-2 text-4xl text-foreground">Loved by our community</h2>
              <p className="mt-2 text-sm text-muted-foreground">{filteredProducts.length} beauty finds, curated for your shelf.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"><Star size={14} className="fill-accent text-accent" /> 4.8 average rating</div>
              <label className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm">
                <span className="text-muted-foreground">Sort by</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="cursor-pointer bg-transparent pr-1 outline-none">
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>
          </div>
          
          {productsLoading ? <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading products…</p> : productsError ? <p className="mt-8 rounded-2xl border border-dashed border-destructive/30 p-8 text-center text-sm text-destructive">{productsError}</p> : filteredProducts.length === 0 ? <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No beauty finds match your search yet.</p> : <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">{filteredProducts.map((product) => {
            const imageUrl = getImageUrl(product.image)
            
            return (
              <article key={product.id} className="group">
                <div className="relative aspect-square overflow-hidden rounded-[20px] bg-secondary">
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl, 'Product:', product.name)
                      e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Error'
                    }}
                  />
                  <button type="button" onClick={() => handleAddToCart(product)} className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary shadow-[0_8px_24px_rgba(42,26,52,0.18)] transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground" aria-label={product.price > 0 ? `Add ${product.name} to cart` : `Ask the price for ${product.name} on WhatsApp`}><ShoppingBag size={16} /></button>
                </div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-accent">{product.brand}</p>
                <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between"><p className="text-sm font-semibold text-primary">{product.price > 0 ? `${product.price.toLocaleString()}` : 'Price on request'}</p><span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Star size={12} className="fill-accent text-accent" /> 4.8</span></div>
              </article>
            )
          })}</div>}
        </section>

        <section id="contact" className="mt-20 overflow-hidden rounded-[25px] bg-primary px-7 py-12 text-primary-foreground sm:px-14"><div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">Stay in the know</p><h2 className="mt-3 text-3xl sm:text-4xl">Beauty notes, just for you.</h2><p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/75">Join our little community for new drops, thoughtful beauty advice, and first access to exclusive finds.</p></div><button type="button" className="rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-transform hover:scale-105">Join the community <ArrowRight size={15} className="ml-2 inline" /></button></div></section>
      </div>

      {/* Footer with Contact Information */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-[1250px] px-5 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Contact Us</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-primary" />
                  <a href="tel:+8801959524393" className="hover:text-primary">01959-524393</a>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-primary" />
                  <a href="https://wa.me/8801959524393" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    WhatsApp Order
                  </a>
                </div>
                <p className="flex items-center gap-2">
                  <span className="text-primary">📍</span>
                  <span>Dhaka, Bangladesh</span>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#top" className="block hover:text-primary">Home</a>
                <a href="#shop" className="block hover:text-primary">Shop All Products</a>
                <a href="#products" className="block hover:text-primary">Best Sellers</a>
                <a href="/admin" className="block hover:text-primary">Admin Panel</a>
              </div>
            </div>

            {/* Business Info */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Business Info</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ 100% Original UK Products</p>
                <p>🚚 Free Delivery over 5,000</p>
                <p>💯 Authentic Brands Only</p>
                <p>⏰ Quick Delivery in Dhaka</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
            <p>© 2026 UK Brand Lover. Beauty, lifestyle, confidence.</p>
            <p className="mt-1">Curated with care from the UK.</p>
          </div>
        </div>
      </footer>

    </main>
  )
}
