import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { demoStorage, STORAGE_KEYS, type TiendaConfig, type ProductoTienda } from '../utils/storage'
import { ArrowLeft, Upload, Save, Lock, User, LogIn } from 'lucide-react'

const PRODUCTOS_DEFAULT: ProductoTienda[] = [
  { sku: 'MON-001', nombre: 'Combo Lazo 6mm', categoria: 'Combos', precio: 90, moneda: 'USD', descripcion: 'Diseño clásico lazo 6mm. Ideal para regalo.', imagen: '/img/COMBO_LAZO_6MM.webp' },
  { sku: 'MON-002', nombre: 'Combo Caracol 4mm', categoria: 'Combos', precio: 240, moneda: 'USD', descripcion: 'Estilo caracol 4mm. Elegancia y versatilidad.', imagen: '/img/COMBOCARACOL4MM_2.webp' },
  { sku: 'MON-003', nombre: 'Combo Cartier 7mm', categoria: 'Combos', precio: 70, moneda: 'USD', descripcion: 'Inspiración Cartier 7mm. Para ocasiones especiales.', imagen: '/img/COMBO_CARTIER_7MM.webp' },
  { sku: 'MON-004', nombre: 'Combo Grabada 6mm', categoria: 'Combos', precio: 170, moneda: 'USD', descripcion: 'Grabado personalizado 6mm. Detalle único.', imagen: '/img/COMBO_GRABADA_6MM_2.webp' },
]

function getDefaultConfig(nombreTienda: string): TiendaConfig {
  return {
    nombreTienda,
    logoUrl: null,
    heroTitulo: 'Bienvenido a tu tienda',
    heroDescripcion: 'Productos seleccionados para tu negocio. Catálogo mayorista y opciones sin inversión.',
    productos: PRODUCTOS_DEFAULT.map((p) => ({ ...p })),
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const EDITOR_SESSION_KEY = 'monarch-tienda-editor-unlocked'

export default function TiendaEditor() {
  const { user, login } = useAuth()
  const defaultName = user?.name ? `${user.name} · Tienda` : 'Monarch Store'
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(EDITOR_SESSION_KEY) === '1'
    } catch {
      return false
    }
  })
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')

  const [config, setConfig] = useState<TiendaConfig>(() => {
    const saved = demoStorage.get<TiendaConfig>(STORAGE_KEYS.TIENDA_EMPRESARIO)
    return saved ?? getDefaultConfig(defaultName)
  })
  const [saved, setSaved] = useState(false)

  const handleEditorLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const result = login('empresario', loginUser.trim(), loginPass)
    if (result.ok) {
      try {
        sessionStorage.setItem(EDITOR_SESSION_KEY, '1')
      } catch {}
      setUnlocked(true)
      return
    }
    setLoginError(result.error ?? 'Usuario o contraseña incorrectos.')
  }

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    fileToDataUrl(file).then((url) => {
      setConfig((c) => ({ ...c, logoUrl: url }))
    })
  }, [])

  const handleProductImageChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    fileToDataUrl(file).then((url) => {
      setConfig((c) => {
        const next = [...c.productos]
        next[index] = { ...next[index], imagen: url }
        return { ...c, productos: next }
      })
    })
  }, [])

  const updateProduct = useCallback((index: number, patch: Partial<ProductoTienda>) => {
    setConfig((c) => {
      const next = [...c.productos]
      next[index] = { ...next[index], ...patch }
      return { ...c, productos: next }
    })
  }, [])

  const save = useCallback(() => {
    demoStorage.set(STORAGE_KEYS.TIENDA_EMPRESARIO, config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [config])

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12 antialiased safe-area-pb">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="px-8 pt-10 pb-2 text-center border-b border-gray-100">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-5">
                <span className="text-2xl font-bold">M</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Monarch</h1>
              <p className="text-sm text-gray-500 mt-1">Sistema de Gestión Internacional</p>
            </div>

            <form onSubmit={handleEditorLogin} className="p-8 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Editar tienda</h2>
              <p className="text-sm text-gray-600 -mt-2">
                Ingresa tu usuario y contraseña de empresario para acceder al editor.
              </p>

              {loginError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {loginError}
                </div>
              )}

              <div>
                <label htmlFor="editor-login-user" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="editor-login-user"
                    type="text"
                    autoComplete="username"
                    value={loginUser}
                    onChange={(e) => { setLoginUser(e.target.value); setLoginError('') }}
                    placeholder="empresario"
                    className="input pl-10 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editor-login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="editor-login-password"
                    type="password"
                    autoComplete="current-password"
                    value={loginPass}
                    onChange={(e) => { setLoginPass(e.target.value); setLoginError('') }}
                    placeholder="••••••••"
                    className="input pl-10 min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center py-3"
              >
                <LogIn size={20} />
                Entrar
              </button>
            </form>

            <div className="px-8 pb-6 pt-0">
              <p className="text-xs text-gray-400 text-center">
                Empresario: usuario <strong>empresario</strong> · contraseña <strong>empresario123</strong>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/empresarios/tienda" className="hover:text-gray-700 underline">
              Volver a la tienda
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 antialiased safe-area-pb">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/98 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-4xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            to="/empresarios/tienda"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 -ml-2 transition-colors sm:min-w-0 sm:justify-start sm:px-3"
          >
            <ArrowLeft size={22} />
            <span className="font-medium hidden sm:inline">Ver tienda</span>
          </Link>
          <button
            type="button"
            onClick={save}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-700 active:scale-[0.98] transition-all sm:px-5"
          >
            <Save size={18} />
            {saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6 lg:py-8">
        <h1 className="text-lg font-bold tracking-tight text-slate-800 mb-6 sm:text-xl sm:mb-8">
          Editar tienda
        </h1>

        {/* Logo */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 mb-5 sm:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 sm:text-sm">
            Logo de la tienda
          </h2>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex justify-center sm:justify-start">
              <div className="h-28 w-28 sm:h-24 sm:w-24 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-4xl font-bold text-slate-400 sm:text-3xl">{config.nombreTienda.charAt(0)}</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label className="flex min-h-[52px] cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-medium text-slate-600 active:bg-slate-100 transition-colors w-full sm:min-h-[48px] sm:text-sm sm:w-auto sm:inline-flex">
                <Upload size={22} className="shrink-0 sm:w-5 sm:h-5" />
                Subir logo (móvil o PC)
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleLogoChange}
                />
              </label>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed sm:mt-2">
                PNG, JPG o WebP. Se verá en cabecera y footer.
              </p>
            </div>
          </div>
        </section>

        {/* Nombre y Hero */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 mb-5 sm:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 sm:text-sm">
            Nombre y portada
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de la tienda</label>
              <input
                type="text"
                value={config.nombreTienda}
                onChange={(e) => setConfig((c) => ({ ...c, nombreTienda: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 min-h-[52px] bg-white sm:min-h-[48px]"
                placeholder="Ej. Mi Tienda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Título del hero</label>
              <input
                type="text"
                value={config.heroTitulo}
                onChange={(e) => setConfig((c) => ({ ...c, heroTitulo: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 min-h-[52px] bg-white sm:min-h-[48px]"
                placeholder="Bienvenido a tu tienda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción del hero</label>
              <textarea
                value={config.heroDescripcion}
                onChange={(e) => setConfig((c) => ({ ...c, heroDescripcion: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 min-h-[100px] bg-white resize-y"
                placeholder="Texto de bienvenida..."
              />
            </div>
          </div>
        </section>

        {/* Productos */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 sm:text-sm">
            Productos
          </h2>
          <div className="space-y-6 sm:space-y-8">
            {config.productos.map((p, index) => (
              <div
                key={p.sku}
                className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
                  <div className="flex flex-col items-center w-full lg:items-start lg:w-auto">
                    <div className="aspect-square w-full max-w-[220px] rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-white sm:max-w-[200px]">
                      {p.imagen ? (
                        <img src={p.imagen} alt={p.nombre} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">Sin imagen</div>
                      )}
                    </div>
                    <label className="mt-3 flex min-h-[48px] w-full max-w-[220px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 active:bg-slate-50 transition-colors sm:max-w-[200px]">
                      <Upload size={18} />
                      Cambiar imagen
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={(e) => handleProductImageChange(index, e)}
                      />
                    </label>
                  </div>
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Nombre</label>
                        <input
                          type="text"
                          value={p.nombre}
                          onChange={(e) => updateProduct(index, { nombre: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 min-h-[48px] focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Categoría</label>
                        <input
                          type="text"
                          value={p.categoria}
                          onChange={(e) => updateProduct(index, { categoria: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 min-h-[48px] focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Descripción</label>
                      <textarea
                        value={p.descripcion}
                        onChange={(e) => updateProduct(index, { descripcion: e.target.value })}
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 min-h-[72px] focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white resize-y sm:text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[120px] max-w-[140px]">
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Precio</label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={p.precio}
                          onChange={(e) => updateProduct(index, { precio: Number(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 min-h-[48px] focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white sm:text-sm"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Moneda</label>
                        <select
                          value={p.moneda}
                          onChange={(e) => updateProduct(index, { moneda: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 min-h-[48px] focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white sm:text-sm"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="COP">COP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 pb-6 sm:mt-8 sm:pb-8">
          <button
            type="button"
            onClick={save}
            className="w-full min-h-[52px] sm:w-auto sm:min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-800/20 hover:bg-slate-700 active:scale-[0.98] transition-all sm:px-6"
          >
            <Save size={20} className="sm:w-[18px] sm:h-[18px]" />
            Guardar cambios
          </button>
        </div>
      </main>
    </div>
  )
}
