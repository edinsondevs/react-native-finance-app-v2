import { router, usePathname } from "expo-router";
import { Alert, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import Constants from "expo-constants";
import { FontAwesome } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTourGuideController } from "rn-tourguide";

import { useCapitalize, useSettingsMutations } from "@/hooks";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { ButtomComponent, HeaderComponent, IconPickerModal, IconTrigger, InputComponent, ModalsAlerts } from "@/components";
import { useAuthStore } from "@/store/useAuthStore";
import { getServiciosMensualesServices } from "@/api/services/servicios_mensuales/get.serviciosMensuales.service";
import { deleteServiciosMensualesServices } from "@/api/services/servicios_mensuales/delete.serviciosMensuales.service";

import ThemedView from "@/presentation/ThemedView";
import { Colors } from "@/styles/constants";

const TitleEditScreen = ({ title, icon, origen }: { title: string; icon: React.ComponentProps<typeof FontAwesome>["name"]; origen: string }) => {
	return (
		<View className='flex-row justify-between items-center mb-3'>
			<View className="flex-row items-center gap-2">
				<View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
					<FontAwesome name={icon} size={16} color={Colors.primary} />
				</View>
				<Text className="text-lg font-Inter-Bold text-gray-800">{title}</Text>
			</View>
			<TouchableOpacity 
				onPress={() =>
					router.push({
						pathname: "/ajustes/settings",
						params: { origen },
					})
				}
				className="bg-gray-100 p-2 rounded-xl border border-gray-200"
			>
				<FontAwesome
					name='edit'
					size={18}
					color='#555'
				/>
			</TouchableOpacity>
		</View>
	);
};

const AjustesScreen = () => {
	const { capitalizeWords } = useCapitalize();
	const pathName = usePathname();
	const title = capitalizeWords(pathName.split("/").pop() || "");
	const queryClient = useQueryClient();

	const {
		form,
		showIconPicker,
		activeIconField,
		isPending,
		handleChange,
		openIconPicker,
		closeIconPicker,
		handleCreate,
	} = useSettingsMutations();

	const { signOut } = useAuthStore();

	// Cargar servicios mensuales para el listado de eliminar
	const [selectedServiceId, setSelectedServiceId] = useState<string | number | null>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const { data: servicios = [], refetch: refetchServicios, isLoading: isLoadingServicios } = useQuery<any[]>({
		queryKey: ['servicios_mensuales_dropdown'],
		queryFn: getServiciosMensualesServices,
	});

	// Inicializar controlador del tour interactivo
	const { start, canStart, TourGuideZone, eventEmitter } = useTourGuideController('ajustes');

	// Ejecutar tour automáticamente en el primer inicio de sesión
	useEffect(() => {
		const checkAndStartTour = async () => {
			try {
				const hasSeen = await AsyncStorage.getItem('has_seen_tour_ajustes');
				if (!hasSeen && canStart) {
					setTimeout(() => {
						start();
					}, 800);
				}
			} catch (err) {
				console.error("Error al comprobar estado del tour ajustes:", err);
			}
		};
		checkAndStartTour();
	}, [canStart]);

	// Guardar estado cuando el tour finaliza o se omite
	useEffect(() => {
		if (!eventEmitter) return;

		const handleTourStop = async () => {
			try {
				await AsyncStorage.setItem('has_seen_tour_ajustes', 'true');
			} catch (err) {
				console.error("Error al guardar estado del tour ajustes:", err);
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

	const deleteServiceMutation = useMutation({
		mutationFn: deleteServiciosMensualesServices,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['servicios_mensuales'] });
			refetchServicios();
			setSelectedServiceId(null);
			setIsDropdownOpen(false);
			Alert.alert("Éxito", "El servicio mensual ha sido eliminado correctamente.");
		},
		onError: (err) => {
			console.error("Error al eliminar servicio:", err);
			Alert.alert("Error", "No se pudo eliminar el servicio mensual.");
		}
	});

	const handleDeleteService = () => {
		if (!selectedServiceId) {
			Alert.alert("Error", "Por favor selecciona un servicio de la lista.");
			return;
		}

		const selectedService = servicios.find(s => s.id === selectedServiceId);
		Alert.alert(
			"Eliminar Servicio",
			`¿Estás seguro de que deseas eliminar el servicio "${selectedService?.name}"? Esta acción no se puede deshacer.`,
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: () => deleteServiceMutation.mutate(selectedServiceId)
				}
			]
		);
	};

	const handleLogout = async () => {
		Alert.alert(
			"Cerrar Sesión",
			"¿Estás seguro de que quieres cerrar sesión?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Salir",
					style: "destructive",
					onPress: async () => {
						await signOut();
						router.replace("/login");
					},
				},
			]
		);
	};

	const selectedServiceName = selectedServiceId
		? servicios.find(s => s.id === selectedServiceId)?.name
		: "Selecciona un servicio...";

	return (
		<KeyboardAwareScrollView
			keyboardShouldPersistTaps='handled'
			contentContainerStyle={{ paddingTop: 0, paddingBottom: 50 }}
			showsVerticalScrollIndicator={false}
			extraScrollHeight={170}
			enableOnAndroid={true}
			className="bg-gray-50 flex-1"
		>
			{/* Zona 1: Encabezado */}
			<TourGuideZone
				zone={1}
				text="¡Panel de Ajustes! Configura tus catálogos del sistema, métodos de pago y servicios desde un solo lugar."
				shape="rectangle"
			>
				<View style={{ borderRadius: 16, overflow: 'hidden' }}>
					<HeaderComponent 
						title={title} 
						onPressHelp={handleForceTourStart}
					/>
				</View>
			</TourGuideZone>

			<ModalsAlerts
				visible={isPending}
				color={Colors.primary}
				text='Creando...'
				transparent={true}
			/>

			<ThemedView
				margin
				className='gap-5 mt-6 px-4'
			>
				{/* Zona 2: SECCIÓN 1: CATEGORÍAS */}
				<TourGuideZone
					zone={2}
					text="Crea nuevas categorías personalizadas para tus movimientos financieros o edita las existentes presionando el botón superior derecho."
					shape="rectangle"
				>
					<View className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm gap-4">
						<TitleEditScreen
							title='Categorías de Movimientos'
							icon="tags"
							origen='categorias'
						/>
						<Text className="text-gray-400 text-xs font-Inter-Regular -mt-3">
							Crea categorías personalizadas para organizar tus ingresos y gastos.
						</Text>
						
						<InputComponent
							value={form.categoria}
							setValue={(text) => handleChange("categoria", text)}
							placeholder='Agrega nueva categoría'
							editable
							autoCapitalize='words'
						/>

						{/* Selector de icono */}
						<IconTrigger
							icon={form.categoriaIcon}
							onPress={() => openIconPicker("categoriaIcon")}
						/>

						<ButtomComponent
							onPressFunction={() =>
								handleCreate("categorias", form.categoria)
							}
							text={
								isPending ? "Creando..." : "Crear Nueva Categoría"
							}
							color='bg-primary'
							disabled={isPending || !form.categoria.trim() || !form.categoriaIcon}
						/>
					</View>
				</TourGuideZone>

				{/* Zona 3: SECCIÓN 2: MÉTODOS DE PAGO */}
				<TourGuideZone
					zone={3}
					text="Registra las tarjetas de crédito, débito o efectivo que utilices para pagar o ingresar dinero y edítalas libremente."
					shape="rectangle"
				>
					<View className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm gap-4">
						<TitleEditScreen
							title='Métodos de Pago'
							icon="credit-card"
							origen='metodos_pago'
						/>
						<Text className="text-gray-400 text-xs font-Inter-Regular -mt-3">
							Registra las cuentas o tarjetas que utilizas habitualmente.
						</Text>
						
						<InputComponent
							value={form.metodoPago}
							autoCapitalize='words'
							setValue={(text) => handleChange("metodoPago", text)}
							placeholder='Agrega nuevo método de pago'
							editable
						/>
						<IconTrigger
							icon={form.metodoPagoIcon}
							onPress={() => openIconPicker("metodoPagoIcon")}
						/>
						<ButtomComponent
							onPressFunction={() =>
								handleCreate("metodos_pago", form.metodoPago)
							}
							text={isPending ? "Creando..." : "Crear Método de Pago"}
							color='bg-primary'
							disabled={isPending || !form.metodoPago.trim() || !form.metodoPagoIcon}
						/>
					</View>
				</TourGuideZone>

				{/* Zona 4: SECCIÓN 3: ELIMINAR SERVICIOS MENSUALES (GASTOS FIJOS) */}
				<TourGuideZone
					zone={4}
					text="Elimina de forma permanente servicios fijos activos seleccionándolos en el menú desplegable."
					shape="rectangle"
				>
					<View className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm gap-4 z-50">
						<View className='flex-row items-center gap-2 mb-1'>
							<View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
								<FontAwesome name="trash" size={16} color="#ef4444" />
							</View>
							<Text className="text-lg font-Inter-Bold text-gray-800">Eliminar Gastos Fijos</Text>
						</View>
						
						<Text className="text-gray-400 text-xs font-Inter-Regular -mt-3">
							Selecciona un servicio mensual (Gasto Fijo) activo para eliminarlo permanentemente.
						</Text>

						{/* Custom Dropdown Selector */}
						<View className="relative">
							<TouchableOpacity
								onPress={() => setIsDropdownOpen(!isDropdownOpen)}
								className="flex-row justify-between items-center bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4"
							>
								<Text className={`text-base font-semibold ${selectedServiceId ? 'text-gray-800' : 'text-gray-400'}`}>
									{selectedServiceName}
								</Text>
								{isLoadingServicios ? (
									<ActivityIndicator size="small" color={Colors.primary} />
								) : (
									<FontAwesome name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={14} color="#666" />
								)}
							</TouchableOpacity>

							{isDropdownOpen && servicios.length > 0 && (
								<View className="bg-white border border-gray-200 rounded-2xl mt-2 overflow-hidden shadow-lg max-h-40 z-50">
									<KeyboardAwareScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
										{servicios.map((item: any) => (
											<TouchableOpacity
												key={item.id.toString()}
												onPress={() => {
													setSelectedServiceId(item.id);
													setIsDropdownOpen(false);
												}}
												className={`p-4 border-b border-gray-100 ${selectedServiceId === item.id ? 'bg-primary/10' : 'active:bg-gray-50'}`}
											>
												<Text className={`text-base font-semibold ${selectedServiceId === item.id ? 'text-primary' : 'text-gray-700'}`}>
													{item.name}
												</Text>
											</TouchableOpacity>
										))}
									</KeyboardAwareScrollView>
								</View>
							)}

							{isDropdownOpen && servicios.length === 0 && (
								<View className="bg-white border border-gray-200 rounded-2xl mt-2 p-4 shadow-lg z-50">
									<Text className="text-center text-gray-500 font-semibold text-sm">
										No hay servicios registrados
									</Text>
								</View>
							)}
						</View>

						<ButtomComponent
							onPressFunction={handleDeleteService}
							text={deleteServiceMutation.isPending ? "Eliminando..." : "Eliminar Servicio"}
							color='bg-red-500'
							disabled={deleteServiceMutation.isPending || !selectedServiceId}
						/>
					</View>
				</TourGuideZone>

				{/* SECCIÓN 4: CUENTA Y SISTEMA */}
				<View className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm gap-4">
					<View className='flex-row items-center gap-2 mb-1'>
						<View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
							<FontAwesome name="user-circle" size={16} color="#666" />
						</View>
						<Text className="text-lg font-Inter-Bold text-gray-800">Cuenta y Sistema</Text>
					</View>

					<ButtomComponent
						onPressFunction={handleLogout}
						text='Cerrar Sesión'
						color='bg-google-red'
					/>
				</View>

				{/* Version Info */}
				<View className='mt-4 mb-4 items-center'>
					<Text className='text-gray-400 text-xs font-Inter-Regular'>
						Versión {Constants.expoConfig?.version || "1.0.0"}
					</Text>
				</View>
			</ThemedView>

			{/* Modal para el IconPicker */}
			<IconPickerModal
				visible={showIconPicker}
				onClose={closeIconPicker}
				selectedIcon={activeIconField ? form[activeIconField] : ""}
				onSelectIcon={(icon) => {
					if (activeIconField) {
						handleChange(activeIconField, icon);
					}
					closeIconPicker();
				}}
			/>
		</KeyboardAwareScrollView>
	);
};

export default AjustesScreen;
