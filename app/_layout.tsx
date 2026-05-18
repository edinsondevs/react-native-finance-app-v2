import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TourGuideProvider } from "rn-tourguide";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el idioma español
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
	initialWindowMetrics,
	SafeAreaProvider,
	SafeAreaView,
} from "react-native-safe-area-context";
import "../global.css";

import { useAuthStore } from "../store/useAuthStore";

// Configurar dayjs a español globalmente
dayjs.locale("es");

// Mantiene la pantalla de presentación visible hasta que las fuentes estén cargadas.
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
	const initializeAuth = useAuthStore((state) => state.initializeAuth);

	// 1. Llama al hook useFonts y mapea un nombre a la ruta del archivo.
	const [fontsLoaded] = useFonts({
		"Inter_18pt-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
		"Inter_18pt-ExtraBold": require("../assets/fonts/Inter_18pt-ExtraBold.ttf"),
		"Inter_18pt-Medium": require("../assets/fonts/Inter_18pt-Medium.ttf"),
		"Inter_18pt-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
		"Inter_18pt-SemiBold": require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
		"Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
		"Nunito-ExtraBold": require("../assets/fonts/Nunito-ExtraBold.ttf"),
		"Nunito-Medium": require("../assets/fonts/Nunito-Medium.ttf"),
		"Nunito-Regular": require("../assets/fonts/Nunito-Regular.ttf"),
		"Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
		"Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
		"Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
		"Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
		"Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
		"Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
		// Añade aquí todas las variaciones de fuente que planeas usar.
	});

	useEffect(() => {
		initializeAuth();
	}, []);

	useEffect(() => {
		if (fontsLoaded) {
			// 2. Una vez que las fuentes están listas, oculta la pantalla de presentación.
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	// 3. Muestra un cargador o null si las fuentes aún no están listas.
	if (!fontsLoaded) {
		return null; // O un componente de carga si lo prefieres
	}

	return (
		<TourGuideProvider
			verticalOffset={40}
			labels={{
				skip: "Saltar",
				previous: "Atrás",
				next: "Siguiente",
				finish: "Entendido"
			}}
		>
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<QueryClientProvider client={queryClient}>
					<SafeAreaView
						style={{ flex: 1 }}
						edges={["top", "right", "left"]}>
						<Stack>
						<Stack.Screen
							name='index'
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name='login/index'
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name='login/resetPassword'
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name='login/updatePassword'
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name='register/index'
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name='(tabs)'
							options={{
								headerShown: false,
							}}
						/>
					</Stack>
				</SafeAreaView>
			</QueryClientProvider>
		</SafeAreaProvider>
		</TourGuideProvider>
	);
}
