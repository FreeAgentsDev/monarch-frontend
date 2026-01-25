import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Accounting from './pages/Accounting'
import Shopify from './pages/Shopify'
import OrderDetail from './pages/OrderDetail'

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
          <Route path="/shopify" element={<Shopify />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
