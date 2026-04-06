import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RequireAuth from './components/RequireAuth'
import RoleAwareRedirect from './components/RoleAwareRedirect'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Accounting from './pages/Accounting'
import ContabilidadHub from './pages/ContabilidadHub'
import EstadoDeResultados from './pages/EstadoDeResultados'
import AnalisisDatos from './pages/AnalisisDatos'
import Shopify from './pages/Shopify'
import OrderDetail from './pages/OrderDetail'
import Paises from './pages/Paises'
import Inversionistas from './pages/Inversionistas'
import VistaInversionista from './pages/VistaInversionista'
import PanelInversionista from './pages/PanelInversionista'
import GestionPaises from './pages/GestionPaises'
import GestionInversionistas from './pages/GestionInversionistas'
import GestionUsuarios from './pages/GestionUsuarios'
import GestionEmpresarios from './pages/GestionEmpresarios'
import RutasEntregas from './pages/RutasEntregas'
import Configuracion from './pages/Configuracion'
import EmpresariosPedidos from './pages/EmpresariosPedidos'
import PanelEmpresario from './pages/PanelEmpresario'
import VistaEmpresario from './pages/VistaEmpresario'
import TiendaEmpresario from './pages/TiendaEmpresario'
import TiendaEditor from './pages/TiendaEditor'
import AvanceSemana from './pages/AvanceSemana'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Tienda pública del empresario: layout propio, sin sidebar */}
          <Route
            path="/empresarios/tienda"
            element={
              <RequireAuth>
                <ProtectedRoute>
                  <TiendaEmpresario />
                </ProtectedRoute>
              </RequireAuth>
            }
          />
          {/* Editor con login interno */}
          <Route path="/empresarios/tienda/editor" element={<TiendaEditor />} />

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
                    <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
                    <Route path="/contabilidad" element={<ProtectedRoute><ContabilidadHub /></ProtectedRoute>} />
                    <Route path="/estado-resultados" element={<ProtectedRoute><EstadoDeResultados /></ProtectedRoute>} />
                    <Route path="/analisis" element={<ProtectedRoute><AnalisisDatos /></ProtectedRoute>} />
                    <Route path="/shopify" element={<ProtectedRoute><Shopify /></ProtectedRoute>} />
                    <Route path="/paises" element={<ProtectedRoute><Paises /></ProtectedRoute>} />
                    <Route path="/gestion-paises" element={<ProtectedRoute><GestionPaises /></ProtectedRoute>} />
                    <Route path="/inversionistas" element={<ProtectedRoute><Inversionistas /></ProtectedRoute>} />
                    <Route path="/inversionistas/vista/:paisCodigo" element={<ProtectedRoute><VistaInversionista /></ProtectedRoute>} />
                    <Route path="/inversionistas/vista" element={<Navigate to="/inversionistas/vista/EC" replace />} />
                    <Route path="/inversionistas/panel" element={<ProtectedRoute><PanelInversionista /></ProtectedRoute>} />
                    <Route path="/gestion-inversionistas" element={<ProtectedRoute><GestionInversionistas /></ProtectedRoute>} />
                    <Route path="/gestion-usuarios" element={<ProtectedRoute><GestionUsuarios /></ProtectedRoute>} />
                    <Route path="/gestion-empresarios" element={<ProtectedRoute><GestionEmpresarios /></ProtectedRoute>} />
                    <Route path="/empresarios/pedidos" element={<ProtectedRoute><EmpresariosPedidos /></ProtectedRoute>} />
                    <Route path="/empresarios/panel" element={<ProtectedRoute><PanelEmpresario /></ProtectedRoute>} />
                    <Route path="/empresarios/vista/:paisCodigo" element={<ProtectedRoute><VistaEmpresario /></ProtectedRoute>} />
                    <Route path="/empresarios/vista" element={<Navigate to="/empresarios/vista/EC" replace />} />
                    <Route path="/avance-semana" element={<ProtectedRoute><AvanceSemana /></ProtectedRoute>} />
                    <Route path="/rutas-entregas" element={<ProtectedRoute><RutasEntregas /></ProtectedRoute>} />
                    <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
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
