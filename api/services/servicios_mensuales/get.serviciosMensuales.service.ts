import { instance } from "@/api/apiService";

export const getServiciosMensualesServices = async () => {
	const response = await instance.get("/servicios_mensuales?order=estado.desc,name.asc");
	return response.data;
};