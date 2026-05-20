import { instance } from "@/api/apiService";

//* Crear un nuevo servicio mensual
export const postServiciosMensualesServices = async (name: string, user_id?: string) => {
	try {
		const response = await instance.post("/servicios_mensuales", {
			name,
			estado: 'Pendiente',
			user_id,
		});
		return response.data;
	} catch (error) {
		console.error("Error al crear servicio mensual:", error);
		throw error;
	}
};
