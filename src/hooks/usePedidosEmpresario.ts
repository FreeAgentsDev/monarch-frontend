import { useState, useEffect, useCallback, useMemo } from 'react'
import { demoStorage, STORAGE_KEYS, type PedidoEmpresario } from '../utils/storage'

function uid() {
  return `ped_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

const DEMO: PedidoEmpresario[] = [
  { id: 'pd1', empresarioId: 'e1', fecha: '2025-01-06', cliente: 'Samuel Isaac Carrera Trivino', telefono: '0981238828', noPedido: '1/ene 06', noGuia: 'LC49930275', estado: 'entregado', ventaJoyas: 49, comisionEnvio: 2.94, devolucion: 0, costoProducto: 13.30, costoEnvio: 4.50, moneda: 'USD', notas: '', createdAt: '2025-01-06T10:00:00Z' },
  { id: 'pd2', empresarioId: 'e1', fecha: '2025-01-06', cliente: 'Carolina Cueto Carranza', telefono: '593999803438', noPedido: '2/ene 06', noGuia: 'LC49937294', estado: 'entregado', ventaJoyas: 29, comisionEnvio: 1.74, devolucion: 0, costoProducto: 8.40, costoEnvio: 6.50, moneda: 'USD', notas: '', createdAt: '2025-01-06T11:00:00Z' },
  { id: 'pd3', empresarioId: 'e1', fecha: '2025-01-07', cliente: 'Juan Carlos Zaquinaula Camacho', telefono: '0979622697', noPedido: '1/ene 7', noGuia: '183227284', estado: 'entregado', ventaJoyas: 160, comisionEnvio: 9.60, devolucion: 0, costoProducto: 74.90, costoEnvio: 4.50, moneda: 'USD', notas: '', createdAt: '2025-01-07T09:00:00Z' },
  { id: 'pd4', empresarioId: 'e1', fecha: '2025-01-08', cliente: 'Patricio Manuel Ajila Quizhpe', telefono: '0984557418', noPedido: '1/ene 8', noGuia: 'LC49949242', estado: 'enviado', ventaJoyas: 89, comisionEnvio: 5.34, devolucion: 0, costoProducto: 32.90, costoEnvio: 4.50, moneda: 'USD', notas: '', createdAt: '2025-01-08T08:00:00Z' },
  { id: 'pd5', empresarioId: 'e1', fecha: '2025-01-08', cliente: 'Washington Maximiliano Ponce Velez', telefono: '593990769392', noPedido: '2/ene 8', noGuia: 'LC49949309', estado: 'pendiente', ventaJoyas: 89, comisionEnvio: 5.34, devolucion: 0, costoProducto: 32.90, costoEnvio: 4.50, moneda: 'USD', notas: '', createdAt: '2025-01-08T14:00:00Z' },
  { id: 'pd6', empresarioId: 'e2', fecha: '2025-01-09', cliente: 'Andrea Martinez', telefono: '0991234567', noPedido: '1/ene 9', noGuia: 'SRV-001122', estado: 'entregado', ventaJoyas: 120, comisionEnvio: 7.20, devolucion: 0, costoProducto: 45, costoEnvio: 5, moneda: 'USD', notas: '', createdAt: '2025-01-09T10:00:00Z' },
  { id: 'pd7', empresarioId: 'e2', fecha: '2025-01-10', cliente: 'Roberto Flores', telefono: '0997654321', noPedido: '2/ene 10', noGuia: 'SRV-001123', estado: 'confirmado', ventaJoyas: 65, comisionEnvio: 3.90, devolucion: 0, costoProducto: 22, costoEnvio: 4.50, moneda: 'USD', notas: '', createdAt: '2025-01-10T09:00:00Z' },
]

export function usePedidosEmpresario() {
  const [pedidos, setPedidos] = useState<PedidoEmpresario[]>(() => {
    return demoStorage.get<PedidoEmpresario[]>(STORAGE_KEYS.PEDIDOS_EMPRESARIO) ?? DEMO
  })

  useEffect(() => {
    demoStorage.set(STORAGE_KEYS.PEDIDOS_EMPRESARIO, pedidos)
  }, [pedidos])

  const add = useCallback((input: Omit<PedidoEmpresario, 'id' | 'createdAt'>) => {
    const nuevo: PedidoEmpresario = { ...input, id: uid(), createdAt: new Date().toISOString() }
    setPedidos((prev) => [nuevo, ...prev])
    return nuevo
  }, [])

  const update = useCallback((id: string, patch: Partial<PedidoEmpresario>) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const remove = useCallback((id: string) => {
    setPedidos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const getByEmpresario = useCallback((empresarioId: string) => {
    return pedidos.filter((p) => p.empresarioId === empresarioId)
  }, [pedidos])

  const totales = useMemo(() => {
    return (list: PedidoEmpresario[]) => ({
      ventaJoyas: list.reduce((s, p) => s + p.ventaJoyas, 0),
      comisionEnvio: list.reduce((s, p) => s + p.comisionEnvio, 0),
      devolucion: list.reduce((s, p) => s + p.devolucion, 0),
      costoProducto: list.reduce((s, p) => s + p.costoProducto, 0),
      costoEnvio: list.reduce((s, p) => s + p.costoEnvio, 0),
      utilidad: list.reduce((s, p) => s + (p.ventaJoyas - p.comisionEnvio - p.devolucion - p.costoProducto - p.costoEnvio), 0),
      count: list.length,
    })
  }, [])

  return { pedidos, add, update, remove, getByEmpresario, totales }
}
