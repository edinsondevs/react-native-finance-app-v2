import { ButtomComponent, InputComponent, LinkComponent, ModalsAlerts } from "@/components";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LinearGradient } from "expo-linear-gradient";
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
		<LinearGradient
			colors={["#f8fafc", "#eef2ff", "#e0e7ff"]}
			style={{ flex: 1 }}
			className="flex-1"
		>
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
					paddingVertical: 40,
				}}
				showsVerticalScrollIndicator={false}
				enableOnAndroid={true}>
				
				{/* Encabezado Principal con Icono */}
				<View className='mb-6 items-center'>
					<View className="w-16 h-16 rounded-3xl bg-primary/10 items-center justify-center mb-4 shadow-sm">
						<Ionicons name="wallet-outline" size={36} color={Colors.primary} />
					</View>
					<Text className='text-3xl text-center font-Nunito-ExtraBold text-slate-800 px-4'>
						Finanzas Personales
					</Text>
					<Text className='text-sm text-center font-Inter-Medium text-slate-500 mt-1 px-4'>
						Gestiona tus ingresos y gastos de forma inteligente
					</Text>
				</View>

				{/* Tarjeta del Formulario Premium */}
				<View 
					className='bg-white/85 border border-white/60 p-6 rounded-3xl w-[90%] shadow-lg gap-4'
					style={{
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.05,
						shadowRadius: 12,
						elevation: 3,
					}}
				>
					<Text className='text-slate-600 font-Inter-ExtraBold text-xs uppercase tracking-wider mb-[-4px]'>
						Correo Electrónico
					</Text>
					<InputComponent
						value={email}
						setValue={setEmail}
						autoComplete='email'
						placeholder='Introduce tu correo electrónico'
						keyboardType='email-address'
					/>
					
					<Text className='text-slate-600 font-Inter-ExtraBold text-xs uppercase tracking-wider mb-[-4px]'>
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

					<View className='mt-2 flex-row items-center gap-3'>
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
								className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20 active:bg-secondary/20"
							>
								<Ionicons name="finger-print" size={32} color={Colors.secondary} />
							</Pressable>
						)}
					</View>
				</View>

				{/* Footer de Registro */}
				<View className='mt-8 flex-row justify-center items-center gap-2 bg-white/60 py-2.5 px-6 rounded-full border border-white/40 shadow-sm'>
					<Text className='text-slate-500 font-Inter-Medium text-sm'>
						¿No tienes una cuenta?
					</Text>
					<LinkComponent
						text='Regístrate'
						onPress={() => router.push("/register")}
					/>
				</View>
			</KeyboardAwareScrollView>
		</LinearGradient>
	);
};

export default LoginScreen;
