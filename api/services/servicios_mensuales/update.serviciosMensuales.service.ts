import { instance } from "@/api/apiService";

//* Actualizar el estado y fecha_actualizacion de un servicio mensual
export const updateServiciosMensualesServices = async (
	id: string | number,
	estado: 'Pendiente' | 'Pagado',
	fechaActualizacion: string | null
) => {
	try {
		const response = await instance.patch(
			`/servicios_mensuales?id=eq.${id}`,
			{ 
				estado,
				fecha_actualizacion: fechaActualizacion
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error al actualizar servicio mensual:", error);
		throw error;
	}
};

//* Restablecer todos los servicios mensuales (blanquea fecha_actualizacion y los pasa a Pendiente)
export const resetServiciosMensualesServices = async () => {
	try {
		// En PostgREST, una petición PATCH sin filtros está bloqueada por seguridad.
		// Usamos el filtro id=gt.0 para poder actualizar todas las filas de forma segura.
		const response = await instance.patch(
			"/servicios_mensuales?id=gt.0",
			{
				estado: 'Pendiente',
				fecha_actualizacion: null
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error al restablecer los servicios mensuales del mes:", error);
		throw error;
	}
};
