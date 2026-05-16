import { ButtomComponent, InputComponent, LinkComponent, ModalsAlerts } from "@/components";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuthStore } from "../../store/useAuthStore";
import { useBiometrics } from "../../hooks/useBiometrics";

import { Colors } from "@/styles/constants";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { signIn, loading, enableBiometrics, checkBiometrics } = useAuthStore();
	const { isAvailable, handleBiometricLogin } = useBiometrics();
	const [biometricsSupported, setBiometricsSupported] = useState(false);

	useEffect(() => {
		const initBiometrics = async () => {
			const available = await isAvailable();
			setBiometricsSupported(available);
			
			// Si está disponible, intentar loguear automáticamente al abrir
			if (available) {
				const success = await handleBiometricLogin();
				if (success) router.replace("/(tabs)/gastos");
			}
		};
		initBiometrics();

		// Lógica de Deep Linking (Recuperación de contraseña)
		const checkDeepLink = async () => {
			const url = await Linking.getInitialURL();
			if (url) handleUrl(url);
		};

		const handleUrl = (url: string) => {
			if (url.includes("access_token") && url.includes("refresh_token")) {
				let accessToken = null;
				let refreshToken = null;
				const safeUrl = url.includes("#") ? url : url.replace("?", "#");
				if (safeUrl.includes("#")) {
					const fragment = safeUrl.split("#")[1];
					const params = new URLSearchParams(fragment);
					accessToken = params.get("access_token");
					refreshToken = params.get("refresh_token");
				}

				if (accessToken && refreshToken) {
					router.replace({
						pathname: "/login/updatePassword",
						params: { access_token: accessToken, refresh_token: refreshToken },
					});
				}
			}
		};

		checkDeepLink();
		const sub = Linking.addEventListener("url", (e) => handleUrl(e.url));
		return () => sub.remove();
	}, []);

	async function onPressFunction() {
		if (!email || !password) {
			Alert.alert("Error", "Por favor ingresa correo y contraseña");
			return;
		}

		await signIn(email, password);
		const { error, user } = useAuthStore.getState();

		if (error) {
			Alert.alert("Error al iniciar sesión", error);
		} else if (user) {
			// Preguntar si quiere habilitar biometría si no lo ha hecho
			const isEnabled = await checkBiometrics();
			if (!isEnabled) {
				Alert.alert(
					"Seguridad",
					"¿Deseas habilitar el inicio de sesión con huella para la próxima vez?",
					[
						{ text: "No", style: "cancel", onPress: () => router.replace("/(tabs)/gastos") },
						{ 
							text: "Sí, activar", 
							onPress: async () => {
								await enableBiometrics(password);
								router.replace("/(tabs)/gastos");
							} 
						}
					]
				);
			} else {
				router.replace("/(tabs)/gastos");
			}
		}
	}

	const onBiometricPress = async () => {
		const success = await handleBiometricLogin();
		if (success) router.replace("/(tabs)/gastos");
	};

	return (
		<View className='flex-1'>
			<ModalsAlerts
				visible={loading}
				color={Colors.primary}
				text='Iniciando Sesión...'
				transparent={false}
			/>
			<KeyboardAwareScrollView
				className='flex-1'
				keyboardShouldPersistTaps='handled'
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: "center",
					alignItems: "center",
					width: "100%",
				}}
				showsVerticalScrollIndicator={false}
				enableOnAndroid={true}>
				<View className='mb-4 max-w-xs  '>
					<Text className='text-4xl text-center font-Nunito-ExtraBold '>
						App de Finanzas Personales
					</Text>
				</View>
				<View className='gap-4 w-full px-6 mt-8'>
					<Text className='text-text-gray font-Inter-ExtraBold'>
						Correo Eléctronico
					</Text>
					<InputComponent
						value={email}
						setValue={setEmail}
						autoComplete='email'
						placeholder='Introduce tu correo electrónico'
						keyboardType='email-address'
					/>
					<Text className='text-text-gray font-Inter-ExtraBold'>
						Contraseña
					</Text>
					<InputComponent
						value={password}
						setValue={setPassword}
						placeholder='Introduce tu contraseña'
						secureTextEntry
					/>

					<LinkComponent
						text='¿Olvidaste tu contraseña?'
						onPress={() => router.push("/login/resetPassword")}
					/>

					<View className='mt-4 flex-row items-center gap-4'>
						<View className="flex-1">
							<ButtomComponent
								disabled={loading || !email || !password}
								color={
									loading || !email || !password
										? "bg-button-disabled"
										: "bg-primary"
								}
								onPressFunction={onPressFunction}
								text={loading ? "Cargando..." : "Iniciar Sesión"}
							/>
						</View>
						
						{biometricsSupported && (
							<Pressable 
								onPress={onBiometricPress}
								className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20"
							>
								<Ionicons name="finger-print" size={32} color={Colors.secondary} />
							</Pressable>
						)}
					</View>
				</View>

				<View className='mt-6 flex-row justify-center items-center gap-2'>
					<Text className='text-text-gray font-Inter-Medium'>
						¿No tienes una cuenta?
					</Text>
					<LinkComponent
						text='Regístrate'
						onPress={() => router.push("/register")}
					/>
				</View>
			</KeyboardAwareScrollView>
		</View>
	);
};

export default LoginScreen;
