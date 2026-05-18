import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTourGuideController } from "rn-tourguide";

import { CustomBarChart, HeaderComponent } from "@/components";
import { useHistorialScreenLogic } from "@/hooks/useHistorialScreenLogic";
import { useToogleVisualization } from "@/store/useToogleVisualization";
import { colors } from "@/styles/constants";
import { styles } from "@/styles/estadisticas.styles";

/**
 * Pantalla de Historial Anual.
 * Muestra una gráfica de barras con los gastos agrupados mes a mes de todos los usuarios.
 */
const HistorialScreen = () => {
	const {
		selectedYear,
		setSelectedYear,
		isLoading,
		refetch,
		dataSets,
		monthLabels,
		userIds,
		chartColors,
		totalYear,
		totalIncomeYear,
		profileMap,
		user,
	} = useHistorialScreenLogic();

	const {toogleVisualization} = useToogleVisualization();

	const balance = totalIncomeYear - totalYear;

	// Inicializar controlador del tour interactivo
	const { start, canStart, TourGuideZone, eventEmitter } = useTourGuideController('historial');

	// Ejecutar tour automáticamente en el primer inicio de sesión
	useEffect(() => {
		const checkAndStartTour = async () => {
			try {
				const hasSeen = await AsyncStorage.getItem('has_seen_tour_historial');
				if (!hasSeen && canStart) {
					setTimeout(() => {
						start();
					}, 800);
				}
			} catch (err) {
				console.error("Error al comprobar estado del tour historial:", err);
			}
		};
		checkAndStartTour();
	}, [canStart]);

	// Guardar estado cuando el tour finaliza o se omite
	useEffect(() => {
		if (!eventEmitter) return;

		const handleTourStop = async () => {
			try {
				await AsyncStorage.setItem('has_seen_tour_historial', 'true');
			} catch (err) {
				console.error("Error al guardar estado del tour historial:", err);
			}
		};

		eventEmitter.on('stop', handleTourStop);

		return () => {
			eventEmitter.off('stop', handleTourStop);
		};
	}, [eventEmitter]);

	// Forzar inicio manual del tour
	const handleForceTourStart = () => {
		start();
	};

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
			{/* Zona 1: Encabezado Principal */}
			<TourGuideZone
				zone={1}
				text="¡Bienvenido al Historial Anual! Aquí podrás auditar y comparar el comportamiento a gran escala de tus ingresos y gastos."
				shape="rectangle"
			>
				<View style={{ borderRadius: 16, overflow: 'hidden' }}>
					<HeaderComponent 
						title='Historial' 
						onPressHelp={handleForceTourStart}
					/>
				</View>
			</TourGuideZone>

			{/* Zona 2: Navegador de Año */}
			<TourGuideZone
				zone={2}
				text="Usa los botones direccionales para avanzar o retroceder de año y analizar el comportamiento histórico de tus finanzas."
				shape="rectangle"
			>
				<View className='flex-row justify-center items-center my-4 bg-white py-2 mx-4 rounded-2xl border border-gray-100 shadow-sm'>
					<TouchableOpacity
						onPress={() => setSelectedYear((prev: number) => prev - 1)}
						className='bg-primary/20 p-2 rounded-full mx-4'>
						<FontAwesome
							name='chevron-left'
							size={20}
							color={colors.primary}
						/>
					</TouchableOpacity>
					<Text className='font-bold text-2xl text-gray-800'>
						{selectedYear}
					</Text>
					<TouchableOpacity
						onPress={() => setSelectedYear((prev: number) => prev + 1)}
						className='bg-primary/20 p-2 rounded-full mx-4'>
						<FontAwesome
							name='chevron-right'
							size={20}
							color={colors.primary}
						/>
					</TouchableOpacity>
				</View>
			</TourGuideZone>

			{/* Zona 3: Resumen Total Anual */}
			<TourGuideZone
				zone={3}
				text="Compara rápidamente tus Ingresos acumulados contra tus Gastos acumulados y comprueba el Balance consolidado anual (verde si es positivo, rojo si es negativo)."
				shape="rectangle"
			>
				<View style={{ borderRadius: 20, overflow: 'hidden', padding: 2 }}>
					{/* Resumen Total: Cards Destacadas */}
					<View className='flex-row gap-3 px-4 mb-4'>
						<View
							style={[
								styles.totalCard,
								{
									flex: 1,
									marginBottom: 0,
									paddingHorizontal: 10,
									minHeight: 100,
								},
							]}>
							<View style={{ height: 40, justifyContent: "center" }}>
								<Text
									style={[styles.totalLabel, { marginBottom: 0 }]}
									numberOfLines={2}>
									Ingresos Anuales
								</Text>
							</View>
							<Text
								style={[
									styles.totalAmount,
									{ color: "#10b981", fontSize: 20 },
								]}
								numberOfLines={1}
								adjustsFontSizeToFit>
								${toogleVisualization ? totalIncomeYear.toLocaleString("es-AR") : "*****"}
							</Text>
						</View>
						<View
							style={[
								styles.totalCard,
								{
									flex: 1,
									marginBottom: 0,
									paddingHorizontal: 10,
									minHeight: 100,
								},
							]}>
							<View style={{ height: 40, justifyContent: "center" }}>
								<Text
									style={[styles.totalLabel, { marginBottom: 0 }]}
									numberOfLines={2}>
									Gastos Anuales
								</Text>
							</View>
							<Text
								style={[
									styles.totalAmount,
									{ color: colors.primary, fontSize: 20 },
								]}
								numberOfLines={1}
								adjustsFontSizeToFit>
								${toogleVisualization ? totalYear.toLocaleString("es-AR") : "*****"}
							</Text>
						</View>
					</View>

					<View style={styles.totalCard}>
						<Text style={styles.totalLabel}>Balance del Año</Text>
						<Text
							style={[
								styles.totalAmount,
								{ color: balance >= 0 ? "#10b981" : "#ef4444" },
							]}>
							${toogleVisualization ? balance.toLocaleString("es-AR") : "*****"}
						</Text>
					</View>
				</View>
			</TourGuideZone>

			{/* Zona 4: Sección de Gráfico Principal */}
			<TourGuideZone
				zone={4}
				text="Este gráfico de barras apiladas te muestra visualmente la proporción de los gastos de cada usuario mes a mes."
				shape="rectangle"
			>
				<View style={{ borderRadius: 20, overflow: 'hidden', padding: 2, marginBottom: 80 }}>
					{dataSets &&
					dataSets.length > 0 &&
					Array.from(userIds).length > 0 ? (
						<View
							style={styles.chartCard}
							className='mb-[100px]'>
							<Text style={styles.chartLabel}>
								Tendencia Mensual de Gastos
							</Text>

							{/* Leyenda Dinámica */}
							<View style={styles.legendContainer}>
								{Array.from(userIds).map((userId, index) => (
									<View
										key={userId}
										style={styles.legendItem}>
										<View
											style={[
												styles.legendDot,
												{
													backgroundColor:
														chartColors[
															index % chartColors.length
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
								))}
							</View>

							{/* Gráfico de Barras con Scroll Horizontal */}
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								scrollEnabled={true}>
								<View
									style={styles.chartContainer}
									className='pb-4 pl-4 pr-10'>
									<CustomBarChart
										mainData={[]}
										dataSets={dataSets}
										monthLabels={monthLabels}
										chartColors={chartColors}
									/>
								</View>
							</ScrollView>
						</View>
					) : (
						<View style={styles.chartCard}>
							<Text className='text-center text-gray-500'>
								No hay datos suficientes para graficar en este año.
							</Text>
						</View>
					)}
				</View>
			</TourGuideZone>
		</ScrollView>
	);
};

export default HistorialScreen;
