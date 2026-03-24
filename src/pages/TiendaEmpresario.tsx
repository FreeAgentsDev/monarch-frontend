import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShoppingBag, Menu, X, Mail, MapPin, Phone, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react'
import { demoStorage, STORAGE_KEYS, type TiendaConfig, type ProductoTienda } from '../utils/storage'

const PRODUCTOS_DEFAULT: ProductoTienda[] = [
  { sku: 'MON-001', nombre: 'Combo Lazo 6mm', categoria: 'Combos', precio: 90, moneda: 'USD', descripcion: 'Diseño clásico lazo 6mm. Ideal para regalo.', imagen: '/img/COMBO_LAZO_6MM.webp' },
  { sku: 'MON-002', nombre: 'Combo Caracol 4mm', categoria: 'Combos', precio: 240, moneda: 'USD', descripcion: 'Estilo caracol 4mm. Elegancia y versatilidad.', imagen: '/img/COMBOCARACOL4MM_2.webp' },
  { sku: 'MON-003', nombre: 'Combo Cartier 7mm', categoria: 'Combos', precio: 70, moneda: 'USD', descripcion: 'Inspiración Cartier 7mm. Para ocasiones especiales.', imagen: '/img/COMBO_CARTIER_7MM.webp' },
  { sku: 'MON-004', nombre: 'Combo Grabada 6mm', categoria: 'Combos', precio: 170, moneda: 'USD', descripcion: 'Grabado personalizado 6mm. Detalle único.', imagen: '/img/COMBO_GRABADA_6MM_2.webp' },
]

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Contacto', href: '#contacto' },
]

type CurrencyCode = 'USD' | 'EUR' | 'COP'

type CartItem = {
  sku: string
  nombre: string
  imagen: string
  precioBaseUSD: number
  cantidad: number
}

const TARGET_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1,
  COP: 4000,
}

const SOURCE_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1,
  COP: 1 / 4000,
}

function toBaseUSD(precio: number, moneda: string): number {
  const rate = SOURCE_TO_USD[moneda] ?? 1
  return precio * rate
}

function convertFromUSD(valueUSD: number, target: CurrencyCode): number {
  return valueUSD * TARGET_RATES[target]
}

function formatMoney(value: number, currency: CurrencyCode): string {
  const localeByCurrency: Record<CurrencyCode, string> = {
    USD: 'en-US',
    EUR: 'es-ES',
    COP: 'es-CO',
  }
  return new Intl.NumberFormat(localeByCurrency[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(value)
}

function getOrderNumber(existing: any[]): string {
  const year = new Date().getFullYear()
  const prefix = `TIENDA-EMP-${year}-`
  const nums = existing
    .map((o) => String(o?.orderNumber ?? '').replace('#', ''))
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.replace(prefix, ''), 10) || 0)
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `#${prefix}${String(next).padStart(3, '0')}`
}

export default function TiendaEmpresario() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD')
  const [selectedProduct, setSelectedProduct] = useState<ProductoTienda | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutMessage, setCheckoutMessage] = useState('')

  const config = useMemo(() => {
    const saved = demoStorage.get<TiendaConfig>(STORAGE_KEYS.TIENDA_EMPRESARIO)
    const nombreTienda = saved?.nombreTienda || (user?.name ? `${user.name} · Tienda` : 'Monarch Store')
    return {
      nombreTienda: saved?.nombreTienda ?? nombreTienda,
      logoUrl: saved?.logoUrl ?? null,
      heroTitulo: saved?.heroTitulo ?? 'Bienvenido a tu tienda',
      heroDescripcion: saved?.heroDescripcion ?? 'Productos seleccionados para tu negocio. Catálogo mayorista y opciones sin inversión.',
      productos: saved?.productos?.length ? saved.productos : PRODUCTOS_DEFAULT,
    }
  }, [user?.name])

  const productsWithBase = useMemo(
    () =>
      config.productos.map((p) => ({
        ...p,
        precioBaseUSD: toBaseUSD(p.precio, p.moneda),
      })),
    [config.productos]
  )

  const cartCount = useMemo(() => cart.reduce((acc, i) => acc + i.cantidad, 0), [cart])
  const cartSubtotalUSD = useMemo(() => cart.reduce((acc, i) => acc + i.precioBaseUSD * i.cantidad, 0), [cart])
  const cartSubtotalDisplay = convertFromUSD(cartSubtotalUSD, selectedCurrency)

  const addToCart = (product: ProductoTienda, quantity = 1) => {
    const qty = Math.max(1, quantity)
    const priceUSD = toBaseUSD(product.precio, product.moneda)
    setCart((prev) => {
      const existing = prev.find((i) => i.sku === product.sku)
      if (existing) {
        return prev.map((i) => (i.sku === product.sku ? { ...i, cantidad: i.cantidad + qty } : i))
      }
      return [
        ...prev,
        {
          sku: product.sku,
          nombre: product.nombre,
          imagen: product.imagen,
          precioBaseUSD: priceUSD,
          cantidad: qty,
        },
      ]
    })
    setCheckoutMessage('')
  }

  const updateQty = (sku: string, next: number) => {
    if (next <= 0) {
      setCart((prev) => prev.filter((i) => i.sku !== sku))
      return
    }
    setCart((prev) => prev.map((i) => (i.sku === sku ? { ...i, cantidad: next } : i)))
  }

  const handleCheckout = () => {
    if (!cart.length) return
    const existingOrders = demoStorage.get<any[]>(STORAGE_KEYS.ORDERS) ?? []
    const now = new Date().toISOString()
    const order = {
      id: `tienda_emp_${Date.now()}`,
      orderNumber: getOrderNumber(existingOrders),
      customerName: user?.name ?? 'Empresario',
      customerEmail: user?.email ?? '',
      status: 'pending',
      currency: selectedCurrency,
      totalAmount: Number(cartSubtotalDisplay.toFixed(selectedCurrency === 'COP' ? 0 : 2)),
      createdAt: now,
      updatedAt: now,
      source: 'tienda-empresario',
      items: cart.map((i) => ({
        sku: i.sku,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: Number(convertFromUSD(i.precioBaseUSD, selectedCurrency).toFixed(selectedCurrency === 'COP' ? 0 : 2)),
      })),
    }
    demoStorage.set(STORAGE_KEYS.ORDERS, [order, ...existingOrders])
    setCart([])
    setCartOpen(false)
    setCheckoutMessage(`Pedido ${order.orderNumber} creado con ${order.items.length} producto(s).`)
  }

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link
            to="/empresarios/tienda"
            className="flex min-h-[44px] min-w-[44px] items-center gap-3 rounded-lg active:opacity-80 sm:min-w-0"
            onClick={() => setMenuOpen(false)}
          >
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="" className="h-9 w-9 rounded-lg object-contain sm:h-10 sm:w-10" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white shadow-sm sm:h-10 sm:w-10">
                <span className="text-base font-bold tracking-tight sm:text-lg">{config.nombreTienda.charAt(0)}</span>
              </div>
            )}
            <span className="hidden text-base font-semibold text-slate-800 sm:inline md:text-lg">
              {config.nombreTienda}
            </span>
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <label className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <span className="text-xs font-semibold text-slate-500">Moneda</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="COP">COP</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              to="/empresarios/panel"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
            >
              <ShoppingBag size={18} className="shrink-0" />
              <span className="hidden sm:inline">Mi panel</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 md:hidden"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <label className="mb-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                Moneda
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                  className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="COP">COP</option>
                </select>
              </label>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="min-h-[48px] rounded-xl px-4 py-3 text-base font-medium text-slate-700 active:bg-slate-100"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/empresarios/panel"
                onClick={() => setMenuOpen(false)}
                className="min-h-[48px] rounded-xl px-4 py-3 text-base font-medium text-slate-700 active:bg-slate-100"
              >
                Mi panel
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setCartOpen(true)
                }}
                className="flex min-h-[48px] items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 active:bg-slate-100"
              >
                Carrito
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">{cartCount}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section
          id="inicio"
          className="relative overflow-hidden border-b border-slate-200 bg-slate-900 text-white"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 via-transparent to-slate-900/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(71,85,105,0.25),transparent)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24">
            <div className="max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {config.heroTitulo}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-300 sm:mt-4 sm:text-lg md:text-xl">
                {config.heroDescripcion}
              </p>
              <div className="mt-4 inline-flex items-center rounded-full border border-slate-500/60 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-200">
                Visualizando precios en {selectedCurrency} (conversion fija demo)
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                <a
                  href="#catalogo"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 transition-all hover:bg-slate-100 active:scale-[0.98]"
                >
                  Ver catálogo
                </a>
                <Link
                  to="/empresarios/vista/EC"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-slate-500/60 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-slate-400 hover:bg-slate-800/50 active:scale-[0.98]"
                >
                  Descargar catálogo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Catálogo */}
        <section id="catalogo" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="text-center sm:mb-14">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl md:text-3xl">
              Catálogo
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Toca la imagen para ver detalle completo y agrega al carrito desde cada tarjeta.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-8">
            {productsWithBase.map((p) => (
              <article
                key={p.sku}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50"
              >
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(p)}
                    className="h-full w-full focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  >
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {p.categoria}
                  </span>
                  <h3 className="mt-1.5 text-base font-semibold text-slate-800 sm:text-lg">
                    {p.nombre}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {p.descripcion}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <span className="text-lg font-bold text-slate-900">
                      {formatMoney(convertFromUSD(p.precioBaseUSD, selectedCurrency), selectedCurrency)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className="min-h-[44px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.98]"
                      >
                        Detalle
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(p, 1)}
                        className="min-h-[44px] rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-700 active:scale-[0.98]"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {checkoutMessage && (
          <section className="mx-auto max-w-6xl px-4 pb-2 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              {checkoutMessage}
            </div>
          </section>
        )}

        {/* Footer: Contacto, Enlaces */}
        <footer id="contacto" className="border-t border-slate-200 bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              <div className="flex items-start gap-4">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-contain bg-slate-700/80" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-700/80">
                    <span className="text-lg font-bold text-white">{config.nombreTienda.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{config.nombreTienda}</p>
                  <p className="mt-1 text-sm text-slate-400">Tu tienda profesional Monarch</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contacto
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Mail size={18} className="shrink-0 text-slate-500" />
                    <a href={`mailto:${user?.email ?? ''}`} className="hover:text-white transition-colors">
                      {user?.email ?? 'contacto@mitienda.com'}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={18} className="shrink-0 text-slate-500" />
                    +1 234 567 890
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin size={18} className="shrink-0 text-slate-500" />
                    Tu ciudad
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Enlaces
                </h4>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link to="/empresarios/panel" className="text-slate-400 transition-colors hover:text-white">
                      Panel del empresario
                    </Link>
                  </li>
                  <li>
                    <Link to="/empresarios/tienda/editor" className="text-slate-400 transition-colors hover:text-white">
                      Editar tienda
                    </Link>
                  </li>
                  <li>
                    <Link to="/empresarios/vista/EC" className="text-slate-400 transition-colors hover:text-white">
                      Descargar catálogo
                    </Link>
                  </li>
                  <li>
                    <Link to="/avance-semana" className="text-slate-400 transition-colors hover:text-white">
                      Avance de la semana
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-700/80 pt-8 text-center text-sm text-slate-500">
              © {new Date().getFullYear()} {config.nombreTienda}. Desarrollado con Monarch.
            </div>
          </div>
        </footer>
      </main>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full max-w-2xl rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Detalle de producto</h3>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img src={selectedProduct.imagen} alt={selectedProduct.nombre} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3">
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {selectedProduct.categoria}
                </span>
                <h4 className="text-xl font-bold text-slate-900">{selectedProduct.nombre}</h4>
                <p className="text-sm leading-relaxed text-slate-600">{selectedProduct.descripcion}</p>
                <p className="text-sm text-slate-500">SKU: {selectedProduct.sku}</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Precio actual</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatMoney(convertFromUSD(toBaseUSD(selectedProduct.precio, selectedProduct.moneda), selectedCurrency), selectedCurrency)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(selectedProduct, 1)
                    setSelectedProduct(null)
                    setCartOpen(true)
                  }}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  <ShoppingCart size={18} />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-end bg-black/45 sm:items-stretch"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="flex h-[85vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-2xl sm:h-full sm:rounded-none sm:rounded-l-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Carrito</h3>
                <p className="text-xs text-slate-500">{cartCount} producto(s)</p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5">
              {!cart.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">Tu carrito esta vacio.</p>
                  <p className="mt-1 text-xs text-slate-500">Agrega productos desde el catalogo.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.sku} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="flex gap-3">
                        <img src={item.imagen} alt={item.nombre} className="h-16 w-16 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{item.nombre}</p>
                          <p className="text-xs text-slate-500">{item.sku}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatMoney(convertFromUSD(item.precioBaseUSD, selectedCurrency), selectedCurrency)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQty(item.sku, 0)}
                          className="self-start rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.sku, item.cantidad - 1)}
                          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-semibold text-slate-900">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.sku, item.cantidad + 1)}
                          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatMoney(cartSubtotalDisplay, selectedCurrency)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!cart.length}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingBag size={18} />
                Realizar pedido
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Demo de conversion fija: 1 USD = 1 EUR = 4,000 COP.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
