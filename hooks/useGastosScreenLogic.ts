import { getCategoriasServices, getMetodosPagoServices } from "@/api/services";
import { Category } from "@/api/services/interfaces";
import { useDashboardData } from "@/hooks";
import { useGetHoursCurrent } from "@/hooks/useGetHoursCurrent";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";

/**
 * Hook que encapsula la lógica de negocio para la pantalla de Gastos.
 * Separa el manejo de filtros, carga de datos y cálculos del componente de interfaz.
 */
export const useGastosScreenLogic = () => {
	const { saludo } = useGetHoursCurrent();
	const {
		resumeIngresos,
		isLoadingResumeIngresos,
		resumeGastos,
		isLoadingResumeGastos,
		allGastos,
		isLoadingAllGastos,
		gastosTarjetaCredito,
		isLoadingGastosTarjetaCredito,
		refreshAll,
	} = useDashboardData();

	const { user } = useAuthStore();
	const displayName = user?.displayName || "Usuario";

	// Estado para filtros
	const [selectedCategoria, setSelectedCategoria] = useState<Category | null>(
		null,
	);
	const [selectedMetodoPago, setSelectedMetodoPago] = useState<any>(null);
	const [selectedFecha, setSelectedFecha] = useState<Date | null>(null);

	// Obtener categorías mediante React Query
	const { data: categorias = [] } = useQuery({
		queryKey: ["categorias"],
		queryFn: getCategoriasServices,
	});

	// Obtener métodos de pago mediante React Query
	const { data: metodosPago = [] } = useQuery({
		queryKey: ["metodos-pago"],
		queryFn: getMetodosPagoServices,
	});

	/**
	 * Maneja la selección de una categoría con funcionalidad de 'toggle'
	 */
	const handleCategoriaChange = (categoria: Category) => {
		if (selectedCategoria?.id === categoria.id) {
			setSelectedCategoria(null);
		} else {
			setSelectedCategoria(categoria);
		}
	};

	/**
	 * Maneja la selección de un método de pago con funcionalidad de 'toggle'
	 */
	const handleMetodoPagoChange = (metodo: any) => {
		if (selectedMetodoPago?.id === metodo.id) {
			setSelectedMetodoPago(null);
		} else {
			setSelectedMetodoPago(metodo);
		}
	};

	/**
	 * Maneja la selección de la fecha
	 */
	const handleFechaChange = (fecha: Date | null) => {
		setSelectedFecha(fecha);
	};

	/**
	 * Lista de gastos ya filtrada según las selecciones del usuario
	 */
	const gastosFiltrados =
		allGastos?.filter((gasto) => {
			const porCategoria =
				!selectedCategoria ||
				gasto.categoria_id === selectedCategoria.id;
			const porMetodoPago =
				!selectedMetodoPago ||
				gasto.metodo_pago_id === selectedMetodoPago.id;
			const porFecha =
				!selectedFecha ||
				(gasto.fecha &&
					dayjs(gasto.fecha.split("T")[0]).format("YYYY-MM-DD") ===
						dayjs(selectedFecha).format("YYYY-MM-DD"));
			return porCategoria && porMetodoPago && porFecha;
		}) || [];

	/**
	 * Sumatoria total de los gastos que están visibles actualmente
	 */
	const gastosFiltradosTotal = gastosFiltrados.reduce(
		(sum, gasto) => sum + (gasto.monto || 0),
		0,
	);

	/**
	 * Sumatoria total de los gastos que están visibles actualmente
	 */
	const gastosTdcTotal = gastosTarjetaCredito;

	return {
		saludo,
		displayName,
		resumeIngresos,
		isLoadingResumeIngresos,
		gastosFiltrados,
		isLoadingAllGastos,
		refreshAll,
		categorias,
		metodosPago,
		selectedCategoria,
		selectedMetodoPago,
		handleCategoriaChange,
		handleMetodoPagoChange,
		gastosFiltradosTotal,
		gastosTdcTotal,
		selectedFecha,
		handleFechaChange,
	};
};
