import {
	getAllGastosServices,
	getResumeGastosServices,
	getResumeGastosTdcServices,
	getResumeIngresosServices,
} from "@/api/services/dashboard/get.alls.services";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook personalizado para centralizar la obtención de datos del Dashboard.
 *
 * Responsabilidades:
 * - Observa el 'selectedMonth' del store global de finanzas.
 * - Orquestra las consultas de React Query para ingresos, gastos y lista completa.
 * - Proporciona un método 'refreshAll' para invalidar y re-ejecutar todas las consultas.
 *
 * @returns Un objeto con los datos, estados de carga y función de refresco.
 */
export const useDashboardData = () => {
	const selectedMonth = useFinanceStore((state) => state.selectedMonth);

	const {
		data: resumeIngresos,
		isLoading: isLoadingResumeIngresos,
		refetch: refetchResumeIngresos,
	} = useQuery({
		queryKey: ["resumeIngresos", selectedMonth.format("YYYY-MM")],
		queryFn: () => getResumeIngresosServices(selectedMonth),
	});

	const {
		data: resumeGastos,
		isLoading: isLoadingResumeGastos,
		refetch: refetchResumeGastos,
	} = useQuery({
		queryKey: ["resumeGastos", selectedMonth.format("YYYY-MM")],
		queryFn: () => getResumeGastosServices(selectedMonth),
	});

	const {
		data: allGastos,
		isLoading: isLoadingAllGastos,
		refetch: refetchAllGastos,
	} = useQuery({
		queryKey: ["gastos", "all", selectedMonth.format("YYYY-MM")],
		queryFn: () => getAllGastosServices(selectedMonth),
	});

	const {
		data: gastosTarjetaCredito,
		isLoading: isLoadingGastosTarjetaCredito,
		refetch: refetchGastosTarjetaCredito,
	} = useQuery({
		queryKey: ["gastosTarjetaCredito", selectedMonth.format("YYYY-MM")],
		queryFn: () => getResumeGastosTdcServices(selectedMonth),
	});

	const refreshAll = () => {
		refetchAllGastos();
		refetchResumeGastos();
		refetchResumeIngresos();
		refetchGastosTarjetaCredito();
	};

	return {
		resumeIngresos,
		isLoadingResumeIngresos,
		resumeGastos,
		isLoadingResumeGastos,
		allGastos,
		isLoadingAllGastos,
		gastosTarjetaCredito,
		isLoadingGastosTarjetaCredito,
		refreshAll,
	};
};
