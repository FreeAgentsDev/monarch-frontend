import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
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
import GestionPaises from './pages/GestionPaises'
import GestionInversionistas from './pages/GestionInversionistas'
import RutasEntregas from './pages/RutasEntregas'
import Configuracion from './pages/Configuracion'

function App() {
  return (
    <Router>
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
          <Route path="/gestion-inversionistas" element={<GestionInversionistas />} />
          <Route path="/rutas-entregas" element={<RutasEntregas />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
