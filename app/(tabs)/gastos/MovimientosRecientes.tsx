import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { FnGastos } from "@/helpers/functions/gastos";
import { useFormatoMoneda, useGastosMutations } from "@/hooks";
import { InterfaceMovimientosRecientesProps } from "@/interfaces";
import { useAuthStore } from "@/store/useAuthStore";
import ModalEdicionMovimiento from "./ModalEdicionMovimiento";
import { useToogleVisualization } from "@/store/useToogleVisualization";

dayjs.locale("es");

/**
 * @component MovimientosRecientes
 * Representa una tarjeta de gasto individual en la lista de movimientos.
 *
 * Funcionalidad:
 * - Muestra el icono de la categoría, descripción, fecha formateada y monto negativo.
 * - Detecta si el gasto pertenece al usuario actual para permitir la edición.
 * - Abre el modal 'ModalEdicionMovimiento' para actualizar o borrar el registro.
 * - Sincroniza estados locales con props mediante useEffect para reflejar cambios tras mutaciones.
 *
 * @param item - Objeto con los datos del gasto (InterfaceMovimientosRecientesProps).
 */
const MovimientosRecientes = ({
	item,
	categorias,
}: InterfaceMovimientosRecientesProps) => {
	const { id, monto, descripcion, icon, user_id, categoria_id, fecha } = item;
	const [modalVisible, setModalVisible] = useState(false);
	const [newMonto, setNewMonto] = useState(monto.toString());
	const [newDescripcion, setNewDescripcion] = useState(descripcion);
	const [newFecha, setNewFecha] = useState<Date>(
		fecha ? dayjs(fecha).toDate() : new Date(),
	);
	const [newCategoriaId, setNewCategoriaId] = useState<string>(
		categoria_id ? categoria_id.toString() : "",
	);
	const { user } = useAuthStore();
	const { toogleVisualization } = useToogleVisualization();
	// Usar el custom hook para las mutaciones
	const { updateMutation, deleteMutation } = useGastosMutations({
		id,
		onSuccessCallback: () => setModalVisible(false),
	});

	// Validar si el movimiento es del usuario actual
	const bgColorAvailable =
		user_id === user?.id ? "bg-white" : "bg-button-disabled";

	// Actualizar el estado local cuando cambian los props (tras el refetch de React Query)
	useEffect(() => {
		setNewMonto(monto.toString());
		setNewDescripcion(descripcion);
		if (fecha) setNewFecha(dayjs(fecha).toDate());
		if (categoria_id) setNewCategoriaId(categoria_id.toString());
	}, [monto, descripcion, fecha, categoria_id]);

	return (
		<View>
			<Pressable
				onPress={() => setModalVisible(true)}
				disabled={user_id !== user?.id}>
				<View
					className={`flex mx-4 my-2 p-4 border border-border-light rounded-2xl ${bgColorAvailable} shadow-sm`}>
					<View className='flex flex-row items-center gap-4'>
						{/* Icono de Gasto */}
						<View className='size-12 rounded-full bg-red-100 items-center justify-center'>
							<FontAwesome
								name={icon || "shopping-cart"}
								size={20}
								color='#ef4444'
							/>
						</View>

						{/* Información Central */}
						<View className='flex-1'>
							<Text className='font-Inter-Bold text-base text-text-dark'>
								{descripcion}
							</Text>
							<Text className='font-Inter-Regular text-xs text-text-muted'>
								{item.fecha
									? dayjs(item.fecha).format(
											"DD [de] MMMM, YYYY",
										)
									: "Hoy"}
							</Text>
						</View>

						{/* Monto y Acción */}
						<View className='items-end gap-1'>
							<Text className='font-Inter-Bold text-xl text-red-600'>
								{toogleVisualization ? "- " + useFormatoMoneda(monto) : "*****"}
							</Text>
							<FontAwesome
								name='chevron-right'
								size={14}
								color='#d1d5db'
							/>
						</View>
					</View>
				</View>
			</Pressable>

			<ModalEdicionMovimiento
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
				newMonto={newMonto}
				setNewMonto={setNewMonto}
				newDescripcion={newDescripcion}
				setNewDescripcion={setNewDescripcion}
				newFecha={newFecha}
				setNewFecha={setNewFecha}
				newCategoriaId={newCategoriaId}
				setNewCategoriaId={setNewCategoriaId}
				categoriasData={categorias}
				mutation={updateMutation}
				deleteMutation={deleteMutation}
				handleUpdate={() =>
					FnGastos.handleUpdate(
						{ id, updateMutation, user_id: user?.id },
						newMonto,
						newDescripcion,
						newFecha,
						newCategoriaId,
					)
				}
				handleDelete={() =>
					FnGastos.handleDelete({ id, deleteMutation })
				}
			/>
		</View>
	);
};

export default MovimientosRecientes;
