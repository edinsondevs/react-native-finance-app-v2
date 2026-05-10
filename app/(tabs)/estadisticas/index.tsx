import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import {
	CustomBarChart,
	GastosPorCategoria,
	GastosPorTipoPago,
	GastosPorUsuario,
	GastosXdia,
	HeaderComponent,
	MonthSelector,
	PieChartComponent,
	TabSelectorEstadisticas,
} from "@/components";
import useCapitalize from "@/hooks/useCapitalize";
import { useEstadisticasScreenLogic } from "@/hooks/useEstadisticasScreenLogic";
import { colors } from "@/styles/constants";
import { styles } from "@/styles/estadisticas.styles";
import { useToogleVisualization } from "@/store/useToogleVisualization";

/**
 * Pantalla de Análisis Estadístico de Gastos.
 * Despliega gráficos interactivos, tendencias y distribuciones por diversos criterios.
 */
const EstadisticasScreen = () => {
	const { toogleVisualization } = useToogleVisualization();

	// 🔌 Desacoplamiento de lógica (SOLID)
	const {
		activeTab,
		setActiveTab,
		activeChart,
		setActiveChart,
		isLoading,
		refetch,
		gastosData,
		selectedMonth,
		total,
		monthLabels,
		userIds,
		dataSets,
		mainData,
		gastosPorUsuarioData,
		gastosPorMetodoPagoData,
		gastosPorCategoriaData,
		gastosPorDiaSummary,
		chartColors,
		profileMap,
		user,
	} = useEstadisticasScreenLogic();

	const { capitalize } = useCapitalize();

	// Pantalla de carga centralizada
	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator
					size='large'
					color={colors.primary}
				/>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			refreshControl={
				<RefreshControl
					refreshing={isLoading}
					onRefresh={refetch}
				/>
			}
			showsVerticalScrollIndicator={false}>
			{/* Encabezado Principal */}
			<HeaderComponent title='Estadísticas de Gastos' />

			{/* Filtro de Periodo Global */}
			<MonthSelector />

			{/* Resumen Total: Card Destacada */}
			<View style={styles.totalCard}>
				<Text style={styles.totalLabel}>Total del Mes</Text>
				<Text style={[styles.totalAmount, { color: colors.primary }]}>
					{toogleVisualization ? "$" + total.toLocaleString("es-AR") : "*****"}
				</Text>
			</View>

			{/* Controles de Visualización: Switch Gráfico de Líneas vs Torta */}
			{gastosData && gastosData.length > 0 && (
				<View
					style={{
						flexDirection: "row",
						backgroundColor: "#f3f4f6",
						padding: 4,
						borderRadius: 12,
						marginBottom: 12,
					}}>
					<TouchableOpacity
						onPress={() => setActiveChart("line")}
						style={{
							flex: 1,
							paddingVertical: 8,
							borderRadius: 8,
							alignItems: "center",
							backgroundColor:
								activeChart === "line"
									? "white"
									: "transparent",
							shadowColor:
								activeChart === "line" ? "#000" : "transparent",
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.1,
							shadowRadius: 2,
							elevation: activeChart === "line" ? 2 : 0,
						}}>
						<Text
							style={{
								fontSize: 14,
								fontWeight: "600",
								color:
									activeChart === "line"
										? colors.primary
										: "#9ca3af",
							}}>
							Gráfico de Barras
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setActiveChart("pie")}
						style={{
							flex: 1,
							paddingVertical: 8,
							borderRadius: 8,
							alignItems: "center",
							backgroundColor:
								activeChart === "pie" ? "white" : "transparent",
							shadowColor:
								activeChart === "pie" ? "#000" : "transparent",
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.1,
							shadowRadius: 2,
							elevation: activeChart === "pie" ? 2 : 0,
						}}>
						<Text
							style={{
								fontSize: 14,
								fontWeight: "600",
								color:
									activeChart === "pie"
										? colors.primary
										: "#9ca3af",
							}}>
							Gráfico de Torta
						</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Sección de Gráfico Principal */}
			{gastosData && gastosData.length > 0 ? (
				<View style={styles.chartCard}>
					<Text style={styles.chartLabel}>
						{activeChart === "line"
							? "Tendencia de Gastos por Usuario"
							: "Distribución por Categoría"}
					</Text>

					{activeChart === "line" ? (
						<>
							{/* Leyenda Dinámica para el Gráfico de Líneas */}
							<View style={styles.legendContainer}>
								{Array.from(userIds as Set<string>).map(
									(userId, index) => (
										<View
											key={userId}
											style={styles.legendItem}>
											<View
												style={[
													styles.legendDot,
													{
														backgroundColor:
															chartColors[
																index %
																	chartColors.length
															],
													},
												]}
											/>
											<Text style={styles.legendText}>
												{userId === user?.id
													? user?.displayName || "Yo"
													: profileMap[userId] ||
														`User: ${userId.slice(0, 8)}...`}
											</Text>
										</View>
									),
								)}
							</View>

							{/* Gráfico de Líneas con Scroll Horizontal */}
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								scrollEnabled={dataSets.length > 0}>
								<View style={styles.chartContainer}>
									{dataSets.length > 0 && (
										<CustomBarChart
											mainData={mainData}
											dataSets={dataSets}
											monthLabels={monthLabels}
											chartColors={chartColors}
										/>
									)}
								</View>
							</ScrollView>

							{/* Pie de Gráfico: Referencia Temporal */}
							<Text style={styles.monthLabel}>
								Días del mes de{" "}
								{capitalize(
									selectedMonth.locale("es").format("MMMM"),
								)}
							</Text>
						</>
					) : (
						/* Gráfico de Torta Centrado */
						<View style={{ alignItems: "center" }}>
							<PieChartComponent data={gastosPorCategoriaData} />
						</View>
					)}
				</View>
			) : (
				/* Estado Vacío cuando no hay datos en el periodo */
				<View style={styles.chartCard}>
					<Text className='text-center text-gray-500'>
						No hay datos suficientes para graficar
					</Text>
				</View>
			)}

			{/* Selector de Pestañas de Detalle (Tabs) */}
			<TabSelectorEstadisticas
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>

			{/* Panel de Contenido Detallado según Tab Seleccionado */}
			<View style={styles.contentContainer}>
				{activeTab === "diario" && (
					<GastosXdia gastosPorDiaSummary={gastosPorDiaSummary} />
				)}
				{activeTab === "usuario" && (
					<GastosPorUsuario data={gastosPorUsuarioData} />
				)}
				{activeTab === "tipo_pago" && (
					<GastosPorTipoPago data={gastosPorMetodoPagoData} />
				)}
				{activeTab === "categoria" && (
					<GastosPorCategoria data={gastosPorCategoriaData} />
				)}
			</View>
		</ScrollView>
	);
};

export default EstadisticasScreen;
