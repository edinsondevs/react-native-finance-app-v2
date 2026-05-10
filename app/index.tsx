import { Redirect } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";

export default function Index() {
	const { status } = useAuthStore();

	// Mientras se comprueba la sesión, no redirigimos para evitar flashes de login
	if (status === "checking") return null;

	// Si hay sesión activa, vamos a la app principal, si no, al login
	return <Redirect href={status === "authenticated" ? "/(tabs)/gastos" : "/login"} />;
}
