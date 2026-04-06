import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RequireAuth from './components/RequireAuth'
import RoleAwareRedirect from './components/RoleAwareRedirect'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Contabilidad from './pages/Contabilidad'
import EstadoDeResultados from './pages/EstadoDeResultados'
import AnalisisDatos from './pages/AnalisisDatos'
import Shopify from './pages/Shopify'
import OrderDetail from './pages/OrderDetail'
import Paises from './pages/Paises'
import Inversionistas from './pages/Inversionistas'
import Catalogo from './pages/Catalogo'
import Empresarios from './pages/Empresarios'
import RutasEntregas from './pages/RutasEntregas'
import Configuracion from './pages/Configuracion'
import MiPanel from './pages/MiPanel'
import VistaPais from './pages/VistaPais'
import TiendaEmpresario from './pages/TiendaEmpresario'
import TiendaEditor from './pages/TiendaEditor'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Tienda publica del empresario: layout propio, sin sidebar */}
          <Route
            path="/mi-tienda"
            element={
              <RequireAuth>
                <ProtectedRoute>
                  <TiendaEmpresario />
                </ProtectedRoute>
              </RequireAuth>
            }
          />
          <Route path="/mi-tienda/editor" element={<TiendaEditor />} />

          <Route
            path="*"
            element={
              <RequireAuth>
                <Layout>
                  <Routes>
                    <Route path="/" element={<RoleAwareRedirect />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                    <Route path="/contabilidad" element={<ProtectedRoute><Contabilidad /></ProtectedRoute>} />
                    <Route path="/estado-resultados" element={<ProtectedRoute><EstadoDeResultados /></ProtectedRoute>} />
                    <Route path="/analisis" element={<ProtectedRoute><AnalisisDatos /></ProtectedRoute>} />
                    <Route path="/shopify" element={<ProtectedRoute><Shopify /></ProtectedRoute>} />
                    <Route path="/paises" element={<ProtectedRoute><Paises /></ProtectedRoute>} />
                    <Route path="/inversionistas" element={<ProtectedRoute><Inversionistas /></ProtectedRoute>} />
                    <Route path="/empresarios" element={<ProtectedRoute><Empresarios /></ProtectedRoute>} />
                    <Route path="/gestion-catalogo" element={<ProtectedRoute><Catalogo /></ProtectedRoute>} />
                    <Route path="/rutas-entregas" element={<ProtectedRoute><RutasEntregas /></ProtectedRoute>} />
                    <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
                    {/* Socio (empresario/inversionista) routes */}
                    <Route path="/mi-panel" element={<ProtectedRoute><MiPanel /></ProtectedRoute>} />
                    <Route path="/catalogo/:paisCodigo" element={<ProtectedRoute><VistaPais /></ProtectedRoute>} />
                    <Route path="/catalogo" element={<Navigate to="/catalogo/EC" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
