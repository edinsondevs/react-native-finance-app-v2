import { Image } from "expo-image";
import { Alert, Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

import { InterfaceHeaderComponentProps } from "@/interfaces";
import Ionicons from "@expo/vector-icons/Ionicons"; 
import { useToogleVisualization } from "@/store/useToogleVisualization";
import { usePathname } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadAvatarService } from "@/api/services/usuarios/profile.service";

const HeaderComponent = ({ title, icon = false }: InterfaceHeaderComponentProps) => {
	const { toogleVisualization, setToogleVisualization } = useToogleVisualization();
	const { user, updateAvatar } = useAuthStore();
	const [uploading, setUploading] = useState(false);
	const [previewImage, setPreviewImage] = useState<{ uri: string, mimeType: string } | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const pathname = usePathname();

	const handlePickImage = async () => {
		if (!user) return;

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: false,
			quality: 0.5,
		});

		if (!result.canceled) {
			setPreviewImage({
				uri: result.assets[0].uri,
				mimeType: result.assets[0].mimeType || "image/jpeg"
			});
		}
	};

	const handleUpload = async () => {
		if (!user || !previewImage) return;

		setUploading(true);
		const publicUrl = await uploadAvatarService(
			user.id,
			previewImage.uri,
			previewImage.mimeType
		);

		if (publicUrl) {
			updateAvatar(publicUrl);
			setPreviewImage(null);
			setIsModalVisible(false);
			Alert.alert("Éxito", "Foto de perfil actualizada");
		} else {
			Alert.alert("Error", "No se pudo subir la imagen");
		}
		setUploading(false);
	};

	const currentAvatarUrl = user?.avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

	return (
		<View className='flex flex-row items-center p-4'>
			<View className='flex flex-1 flex-row items-center'>
				{icon && (
					<Pressable onPress={() => setIsModalVisible(true)}>
						<Image
							style={{ width: 45, height: 45, borderRadius: 25, backgroundColor: '#ccc' }}
							source={currentAvatarUrl}
							placeholder='usuario'
							contentFit='cover'
							transition={500}
						/>
					</Pressable>
				)}
				<Text className='text-2xl self-center font-bold mb-6 mt-4 px-4 text-primary'>
					{title}
				</Text>
				{ pathname !== "/ajustes" && <Pressable className="absolute right-6" onPress={() => setToogleVisualization(!toogleVisualization)}>
					<Ionicons
						name={toogleVisualization ? "eye" : "eye-off-sharp"}
						size={24}
						color="blue"
					/>
				</Pressable>}
			</View>

			{/* Modal de Visor / Vista Previa */}
			<Modal
				visible={isModalVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={() => {
					setPreviewImage(null);
					setIsModalVisible(false);
				}}
			>
				<View className="flex-1 justify-center items-center bg-black/80 px-4">
					<View className="bg-white p-6 rounded-3xl items-center w-full max-w-sm">
						<Text className="text-xl font-bold mb-4">
							{previewImage ? "Confirmar Nueva Foto" : "Foto de Perfil"}
						</Text>
						
						<Image
							source={{ uri: previewImage ? previewImage.uri : currentAvatarUrl }}
							style={{ width: 250, height: 250, borderRadius: 125, marginBottom: 20 }}
							contentFit="cover"
						/>

						{previewImage ? (
							<Text className="text-gray-500 text-center mb-6">
								¿Deseas actualizar tu foto con esta nueva imagen?
							</Text>
						) : (
							<Text className="text-gray-500 text-center mb-6">
								Esta es tu imagen actual. Puedes cambiarla seleccionando una nueva.
							</Text>
						)}

						<View className="flex-row gap-4 w-full">
							{previewImage ? (
								<>
									<Pressable 
										onPress={() => setPreviewImage(null)}
										disabled={uploading}
										className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
									>
										<Text className="text-gray-700 font-bold">Atrás</Text>
									</Pressable>
									<Pressable 
										onPress={handleUpload}
										disabled={uploading}
										className="flex-1 bg-primary py-3 rounded-xl items-center flex-row justify-center"
									>
										{uploading ? (
											<ActivityIndicator color="white" size="small" />
										) : (
											<Text className="text-white font-bold">Subir</Text>
										)}
									</Pressable>
								</>
							) : (
								<>
									<Pressable 
										onPress={() => setIsModalVisible(false)}
										className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
									>
										<Text className="text-gray-700 font-bold">Cerrar</Text>
									</Pressable>
									<Pressable 
										onPress={handlePickImage}
										className="flex-1 bg-[#28a745] py-3 rounded-xl items-center"
									>
										<Text className="text-white font-bold">Cambiar</Text>
									</Pressable>
								</>
							)}
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default HeaderComponent;
