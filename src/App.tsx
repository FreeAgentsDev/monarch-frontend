import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
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
import PanelInversionista from './pages/PanelInversionista'
import VistaInversionista from './pages/VistaInversionista'
import GestionPaises from './pages/GestionPaises'
import GestionInversionistas from './pages/GestionInversionistas'
import RutasEntregas from './pages/RutasEntregas'
import Configuracion from './pages/Configuracion'
import EmpresariosPedidos from './pages/EmpresariosPedidos'
import AvanceSemana from './pages/AvanceSemana'

function AppContent() {
  const { user } = useAuth()
  if (!user) return <Login />
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/contabilidad" element={<ContabilidadHub />} />
        <Route path="/estado-resultados" element={<EstadoDeResultados />} />
        <Route path="/analisis" element={<AnalisisDatos />} />
        <Route path="/shopify" element={<Shopify />} />
        <Route path="/paises" element={<Paises />} />
        <Route path="/gestion-paises" element={<GestionPaises />} />
        <Route path="/inversionistas" element={<Inversionistas />} />
        <Route path="/inversionistas/panel" element={<PanelInversionista />} />
        <Route path="/inversionistas/vista/:paisCodigo" element={<VistaInversionista />} />
        <Route path="/inversionistas/vista" element={<Navigate to="/inversionistas/vista/EC" replace />} />
        <Route path="/gestion-inversionistas" element={<GestionInversionistas />} />
        <Route path="/empresarios/pedidos" element={<EmpresariosPedidos />} />
        <Route path="/avance-semana" element={<AvanceSemana />} />
        <Route path="/rutas-entregas" element={<RutasEntregas />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
