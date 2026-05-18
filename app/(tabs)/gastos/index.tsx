import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	RefreshControl,
	Text,
	View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTourGuideController } from "rn-tourguide";

import { Category } from "@/api/services/interfaces";
import MovimientosRecientes from "@/app/(tabs)/gastos/MovimientosRecientes";
import {
	CardsComponent,
	CircleButton,
	CustomSelector,
	HeaderComponent,
	MonthSelector,
	TitleOpcionInput,
} from "@/components";
import { DatePickerModal } from "@/components/form-fields";
import { useFormatoMoneda } from "@/hooks";
import { useGastosScreenLogic } from "@/hooks/useGastosScreenLogic";
import { colors } from "@/styles/constants";
import { useToogleVisualization } from "@/store/useToogleVisualization";

/**
 * Pantalla principal de Gestión de Gastos.
 * Lista los movimientos filtrados por mes, categoría y método de pago.
 */
const GastosScreen = () => {
	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const {toogleVisualization} = useToogleVisualization();
	
	// ⚡️ Desacoplamiento de lógica (SOLID - Single Responsibility)
	const {
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
		selectedFecha,
		handleFechaChange,
		gastosTdcTotal,
	} = useGastosScreenLogic();

	// Inicializar controlador del tour interactivo
	const { start, canStart, TourGuideZone, eventEmitter } = useTourGuideController('gastos');

	// Ejecutar tour automáticamente en el primer inicio de sesión
	useEffect(() => {
		const checkAndStartTour = async () => {
			try {
				const hasSeen = await AsyncStorage.getItem('has_seen_tour');
				if (!hasSeen && canStart) {
					// Pequeño delay de 800ms para asegurar renderizado correcto antes de iniciar
					setTimeout(() => {
						start();
					}, 800);
				}
			} catch (error) {
				console.error("Error al comprobar estado del tour:", error);
			}
		};
		checkAndStartTour();
	}, [canStart]);

	// Guardar estado cuando el tour finaliza o se omite
	useEffect(() => {
		if (!eventEmitter) return;

		const handleTourStop = async () => {
			try {
				await AsyncStorage.setItem('has_seen_tour', 'true');
			} catch (error) {
				console.error("Error al guardar estado del tour:", error);
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

	return (
		<View className='flex-1'>
			{/* Lista Principal de Movimientos */}
			<FlatList
				data={gastosFiltrados}
				refreshControl={
					<RefreshControl
						refreshing={isLoadingAllGastos}
						onRefresh={refreshAll}
					/>
				}
				keyExtractor={(item, index) =>
					item.id?.toString()
						? `${item.id}-${index}`
						: Math.random().toString()
				}
				renderItem={({ item }) => (
					<MovimientosRecientes
						item={item}
						categorias={categorias}
					/>
				)}
				ListEmptyComponent={
					isLoadingAllGastos ? (
						<ActivityIndicator
							size='large'
							color={colors.primary}
						/>
					) : (
						<Text className='text-center text-gray-500 mt-10'>
							No hay movimientos
						</Text>
					)
				}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<>
						{/* Zona 1: Saludo dinámico y Cabecera */}
						<TourGuideZone
							zone={1}
							text="¡Bienvenido a tu Dashboard Financiero! Aquí verás tu saludo diario y podrás iniciar este tour cuando quieras tocando el icono de ayuda '?'."
							shape="rectangle"
						>
							<View style={{ borderRadius: 16, overflow: 'hidden' }}>
								<HeaderComponent
									title={`${saludo} ${displayName.split(" ")[0]}`}
									icon
									onPressHelp={handleForceTourStart}
								/>
							</View>
						</TourGuideZone>

						{/* Zona 2: Filtro de mes global */}
						<TourGuideZone
							zone={2}
							text="Desliza para elegir o cambiar el mes actual. Todo el balance y transacciones se actualizarán al periodo elegido."
							shape="rectangle"
						>
							<View style={{ borderRadius: 16, overflow: 'hidden', marginHorizontal: 16, marginTop: 4 }}>
								<MonthSelector />
							</View>
						</TourGuideZone>

						{/* Zona 3: Tarjetas resumen: Ingresos y Gastos filtrados */}
						<TourGuideZone
							zone={3}
							text="Estas tarjetas te muestran los totales acumulados del mes de tus ingresos, gastos comunes y lo pagado con tarjetas de crédito."
							shape="rectangle"
						>
							<View style={{ borderRadius: 20, overflow: 'hidden', padding: 4 }}>
								<View className='w-12/12'>
									<CardsComponent className='gap-1 items-center'>
										<View className='flex flex-row items-center'>
											<MaterialIcons
												name='arrow-upward'
												size={24}
												className='text-secondary bg-secondary/10 p-1 rounded-full mr-4'
											/>
											<Text className='text-lg'>
												Ingresos
											</Text>
										</View>
										<Text className='font-Nunito-Bold text-secondary'>
											{isLoadingResumeIngresos ? (
												<ActivityIndicator />
											) : (
												toogleVisualization ? useFormatoMoneda(resumeIngresos) : "*****"
											)}
										</Text>
									</CardsComponent>
								</View>
								<View className='flex flex-row justify-around '>
									{/* Card de Gastos */}
									<View className='w-6/12'>
										<CardsComponent className='gap-1 items-center'>
											<View className='flex flex-row items-center justify-center w-full'>
												<MaterialIcons
													name='arrow-downward'
													size={24}
													color={colors.alert}
													className='bg-alert/10 p-1 rounded-full mr-4'
												/>
												<Text className='text-lg'>Gastos</Text>
											</View>
											<Text className='font-Nunito-Bold text-alert w-full text-center'>
												{toogleVisualization ? useFormatoMoneda(gastosFiltradosTotal) : "*****"}
											</Text>
										</CardsComponent>
									</View>
									<View className='w-6/12'>
										<CardsComponent className='gap-1 items-center'>
											<View className='flex flex-row items-center'>
												<FontAwesome
													name='credit-card'
													size={24}
													color={colors.alert}
													className='bg-alert/10 p-1 rounded-full mr-4'
												/>
												<Text className='text-lg'>Gastos TC</Text>
											</View>
											<Text className='font-Nunito-Bold text-alert'>
												{toogleVisualization ? useFormatoMoneda(gastosTdcTotal) : "*****"}
											</Text>
										</CardsComponent>
									</View>
								</View>
							</View>
						</TourGuideZone>

						{/* Zona 4: Seccion de Micro-Filtros Rápidos */}
						<TourGuideZone
							zone={4}
							text="Utiliza estos filtros rápidos para encontrar transacciones específicas por su categoría, el método de pago usado o por un día en específico."
							shape="rectangle"
						>
							<View style={{ borderRadius: 20, overflow: 'hidden', padding: 4, marginHorizontal: 4 }}>
								<View className='mx-4 my-3'>
									<Text className='text-base font-Inter-Bold text-text-dark mb-2'>
										Filtros
									</Text>
									<View className='flex-row gap-2'>
										{/* Selector de Categoria */}
										<View className='flex-1'>
											<CustomSelector<Category>
												data={categorias}
												labelKey='name'
												valueKey='id'
												iconKey='icon'
												placeholder='Categoría'
												value={selectedCategoria}
												onSelect={handleCategoriaChange}
											/>
										</View>
										{/* Selector de Metodo de Pago */}
										<View className='flex-1'>
											<CustomSelector
												data={metodosPago}
												labelKey='name'
												valueKey='id'
												iconKey='icon'
												placeholder='Método de Pago'
												value={selectedMetodoPago}
												onSelect={handleMetodoPagoChange}
											/>
										</View>
									</View>

									{/* Selector de Fecha */}
									<View className='flex-row mt-2'>
										<View className='flex-1 justify-center rounded-2xl bg-white border border-border-light overflow-hidden'>
											<Pressable
												className='flex-row items-center justify-between py-2 px-5 h-[52px]'
												onPress={() =>
													setDatePickerVisible(true)
												}>
												<Text
													className={`font-Inter-Medium text-sm ${
														selectedFecha
															? "text-text-dark"
															: "text-gray-400"
													}`}
													numberOfLines={1}>
													{selectedFecha
														? dayjs(selectedFecha).format(
																"DD/MM/YYYY",
															)
														: "Filtrar por Fecha"}
												</Text>
												{!selectedFecha && (
													<FontAwesome
														name='calendar'
														size={16}
														color='#9ca3af'
													/>
												)}
											</Pressable>
											{selectedFecha && (
												<Pressable
													className='absolute right-0 p-4 h-[52px] justify-center items-center'
													onPress={() =>
														handleFechaChange(null)
													}>
													<FontAwesome
														name='times-circle'
														size={20}
														color='#9ca3af'
													/>
												</Pressable>
											)}
										</View>
									</View>
								</View>
							</View>
						</TourGuideZone>

						<DatePickerModal
							visible={datePickerVisible}
							value={selectedFecha || new Date()}
							onClose={() => setDatePickerVisible(false)}
							onSelect={(date) => {
								handleFechaChange(date);
								setDatePickerVisible(false);
							}}
						/>

						{/* Subtítulo de encabezado */}
						<View className='mx-8 mb-2'>
							<TitleOpcionInput title='Movimientos Recientes' />
						</View>
					</>
				}
				contentContainerStyle={{ paddingBottom: 100 }}
			/>

			{/* Zona 5: Acción flotante: Ir a crear nuevo gasto */}
			<View className='bottom-0 right-0 m-3 absolute z-50'>
				<TourGuideZone
					zone={5}
					text="¡Y este es el botón de creación! Tócalo en cualquier momento para agregar un nuevo ingreso o gasto."
					shape="circle"
				>
					<CircleButton
						text='+'
						onPressFunction={() =>
							router.push("/(tabs)/gastos/AgregarGastos")
						}
					/>
				</TourGuideZone>
			</View>
		</View>
	);
};

export default GastosScreen;
