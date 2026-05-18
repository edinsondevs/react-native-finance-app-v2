import { instance } from "@/api/apiService";

//* Eliminar un servicio mensual
export const deleteServiciosMensualesServices = async (id: string | number) => {
	try {
		const response = await instance.delete(`/servicios_mensuales?id=eq.${id}`);
		return response.data;
	} catch (error) {
		console.error("Error al eliminar servicio mensual:", error);
		throw error;
	}
};
