import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	Text,
	View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTourGuideController } from "rn-tourguide";

import {
	CircleButton,
	HeaderComponent,
	ItemIngreso,
	MonthSelector,
} from "@/components";
import { useIngresosScreenLogic } from "@/hooks/useIngresosScreenLogic";

// Eliminamos HeaderList ya que no es necesario en el nuevo diseño de tarjetas.

/**
 * Pantalla de registro de ingresos mensuales.
 * Muestra el historial de entradas de dinero para el periodo seleccionado.
 */
const IngresosScreen = () => {
	// 🏗️ Lógica externa desacoplada (SOLID)
	const { isLoading, error, refetch, ingresosConSeparadores } =
		useIngresosScreenLogic();

	// Inicializar controlador del tour interactivo
	const { start, canStart, TourGuideZone, eventEmitter } = useTourGuideController('ingresos');

	// Ejecutar tour automáticamente en el primer inicio de sesión
	useEffect(() => {
		const checkAndStartTour = async () => {
			try {
				const hasSeen = await AsyncStorage.getItem('has_seen_tour_ingresos');
				if (!hasSeen && canStart) {
					setTimeout(() => {
						start();
					}, 800);
				}
			} catch (err) {
				console.error("Error al comprobar estado del tour ingresos:", err);
			}
		};
		checkAndStartTour();
	}, [canStart]);

	// Guardar estado cuando el tour finaliza o se omite
	useEffect(() => {
		if (!eventEmitter) return;

		const handleTourStop = async () => {
			try {
				await AsyncStorage.setItem('has_seen_tour_ingresos', 'true');
			} catch (err) {
				console.error("Error al guardar estado del tour ingresos:", err);
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

	// Estado de carga inicial
	if (isLoading) {
		return (
			<View className='flex-1 justify-center items-center bg-gray-50'>
				<ActivityIndicator
					size='large'
					color='#0000ff'
				/>
			</View>
		);
	}

	// Estado de error en la petición
	if (error) {
		return (
			<View className='flex-1 justify-center items-center bg-gray-50'>
				<Text>Error cargando ingresos</Text>
			</View>
		);
	}

	return (
		<View className='flex-1 bg-gray-50'>
			{/* Zona 1: Encabezado Principal */}
			<TourGuideZone
				zone={1}
				text="¡Esta es la pantalla de Ingresos! Aquí podrás visualizar y llevar el control detallado de todas tus entradas de dinero registradas."
				shape="rectangle"
			>
				<View style={{ borderRadius: 16, overflow: 'hidden' }}>
					<HeaderComponent 
						title='Ingresos' 
						onPressHelp={handleForceTourStart}
					/>
				</View>
			</TourGuideZone>

			{/* Zona 2: Selector de Mes */}
			<TourGuideZone
				zone={2}
				text="Usa el selector para cambiar de periodo. Los ingresos se recargarán automáticamente para el mes elegido."
				shape="rectangle"
			>
				<View style={{ borderRadius: 16, overflow: 'hidden', marginHorizontal: 16, marginTop: 4 }}>
					<MonthSelector />
				</View>
			</TourGuideZone>

			{/* Zona 3: Lista de Ingresos */}
			<View className="flex-1 px-4 mt-2">
				<TourGuideZone
					zone={3}
					text="Aquí se listarán todos los ingresos registrados en el mes con su origen, fecha y descripción. Presiona cualquiera de ellos para interactuar."
					shape="rectangle"
				>
					<FlatList
						data={ingresosConSeparadores}
						contentContainerStyle={{ paddingVertical: 8 }}
						refreshControl={
							<RefreshControl
								refreshing={isLoading}
								onRefresh={() => refetch()}
							/>
						}
						renderItem={({ item }: { item: any }) => {
							if (item.type === "separator") {
								return <View className='bg-blue-500 h-1 my-3 mx-4' />;
							}

							return (
								<ItemIngreso
									monto={item.monto}
									fecha={item.fecha}
									origen={item.origen}
									descripcion={item.descripcion}
									id={item.id}
									user_id={item.user_id}
								/>
							);
						}}
						keyExtractor={(item, index) =>
							item.id?.toString()
								? `${item.id}-${index}`
								: Math.random().toString()
						}
						ListEmptyComponent={
							<Text className='text-center mt-5 text-gray-500 font-semibold'>
								No hay ingresos registrados
							</Text>
						}
					/>
				</TourGuideZone>
			</View>

			{/* Zona 4: Acción Flotante: Agregar Ingreso */}
			<View className='bottom-0 right-0 m-6 absolute z-50'>
				<TourGuideZone
					zone={4}
					text="Toca este botón '+' para añadir un nuevo ingreso mensual de manera instantánea."
					shape="circle"
				>
					<CircleButton
						text='+'
						color='bg-secondary'
						onPressFunction={() =>
							router.push("/(tabs)/ingresos/AgregarIngresos")
						}
					/>
				</TourGuideZone>
			</View>
		</View>
	);
};

export default IngresosScreen;
