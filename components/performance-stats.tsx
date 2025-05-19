export function PerformanceStats() {
  return (
    <>
      <div className="card bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-sm font-medium text-gray-500">Tiempo Promedio</div>
        <div className="text-2xl font-bold">25 min</div>
        <div className="text-xs text-gray-500 mt-1">Por orden completada</div>
      </div>

      <div className="card bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-sm font-medium text-gray-500">Órdenes Completadas</div>
        <div className="text-2xl font-bold">24</div>
        <div className="text-xs text-gray-500 mt-1">En el período seleccionado</div>
      </div>

      <div className="card bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-sm font-medium text-gray-500">Eficiencia</div>
        <div className="text-2xl font-bold">0.35</div>
        <div className="text-xs text-gray-500 mt-1">Productos por minuto</div>
      </div>
    </>
  )
}
