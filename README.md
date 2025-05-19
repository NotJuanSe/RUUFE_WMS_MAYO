# Sistema de Análisis de Rendimiento de Picking

## Descripción

Este sistema proporciona una interfaz completa para analizar el rendimiento de las operaciones de picking en un entorno de almacén o centro de distribución. Permite visualizar métricas clave, filtrar datos por fecha y cliente, y analizar tendencias de rendimiento a lo largo del tiempo.

## Características Principales

- **Dashboard de Rendimiento**: Visualización de métricas clave como tiempo promedio, órdenes completadas y eficiencia.
- **Filtros Avanzados**: Filtrado por rango de fechas y cliente.
- **Tabla de Detalle**: Vista detallada de todas las órdenes con información de rendimiento.
- **Gráficos de Tendencias**: Visualización de tendencias de rendimiento a lo largo del tiempo.
- **Diseño Responsivo**: Interfaz adaptada para dispositivos móviles, tablets y escritorio.

## Estructura del Proyecto

```
├── app/
│   ├── layout.tsx              # Layout principal de la aplicación
│   ├── page.tsx                # Página principal
│   ├── reportes/
│   │   └── rendimiento/
│   │       └── page.tsx        # Página de análisis de rendimiento
│   └── globals.css             # Estilos globales
├── components/
│   ├── performance-chart.tsx   # Gráfico de tendencias
│   ├── performance-filters.tsx # Filtros de fecha y cliente
│   ├── performance-stats.tsx   # Tarjetas de estadísticas
│   ├── performance-table.tsx   # Tabla de detalle de órdenes
│   └── ui/                     # Componentes de UI reutilizables
├── lib/
│   ├── actions.ts              # Acciones del servidor y funciones de datos
│   ├── prisma.ts               # Cliente de Prisma para la base de datos
│   └── utils.ts                # Utilidades generales
└── prisma/
    └── schema.prisma           # Esquema de la base de datos
```

## Tecnologías Utilizadas

- **Next.js**: Framework de React con soporte para Server Components y Server Actions
- **Prisma**: ORM para interactuar con la base de datos
- **Tailwind CSS**: Framework de CSS para el diseño
- **shadcn/ui**: Componentes de UI reutilizables
- **Recharts**: Biblioteca para visualización de datos
- **date-fns**: Utilidades para manipulación de fechas

## Requisitos Previos

- Node.js 18.0 o superior
- Base de datos (PostgreSQL, MySQL, SQLite)

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/sistema-rendimiento-picking.git
   cd sistema-rendimiento-picking