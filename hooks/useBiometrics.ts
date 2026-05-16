import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../store/useAuthStore";
import { Alert } from "react-native";

export const useBiometrics = () => {
	const { signIn, checkBiometrics } = useAuthStore();

	/**
	 * Verifica si el dispositivo soporta biometría y si el usuario la tiene habilitada.
	 */
	const isAvailable = async () => {
		const hasHardware = await LocalAuthentication.hasHardwareAsync();
		const isEnrolled = await LocalAuthentication.isEnrolledAsync();
		const isEnabled = await checkBiometrics();
		return hasHardware && isEnrolled && isEnabled;
	};

	/**
	 * Ejecuta el proceso de autenticación por huella/rostro e inicia sesión.
	 */
	const handleBiometricLogin = async () => {
		try {
			const available = await isAvailable();
			if (!available) return false;

			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: "Inicia sesión con tu huella",
				fallbackLabel: "Usar contraseña",
				disableDeviceFallback: false,
			});

			if (result.success) {
				const email = await SecureStore.getItemAsync("user_email");
				const password = await SecureStore.getItemAsync("user_password");

				if (email && password) {
					await signIn(email, password);
					return true;
				}
			}
			return false;
		} catch (error) {
			console.error("Error en autenticación biométrica:", error);
			Alert.alert("Error", "No se pudo autenticar con biometría");
			return false;
		}
	};

	return {
		isAvailable,
		handleBiometricLogin,
	};
};
