import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { InterfaceHeaderComponentProps } from "@/interfaces";
import Ionicons from "@expo/vector-icons/Ionicons"; 
import { useToogleVisualization } from "@/store/useToogleVisualization";
import { usePathname } from "expo-router";
/*
 * @component HeaderComponent
 * Componente que permite seleccionar una fecha.
 * @param {function} onPressFunction - Función que se ejecuta al cerrar el date picker.
 * @param {string} text - Texto que se muestra en el chip.
 */
const HeaderComponent = ({ title, icon = false }: InterfaceHeaderComponentProps) => {
	const { toogleVisualization, setToogleVisualization } = useToogleVisualization();

	const pathname = usePathname();

	return (
		<View className='flex flex-row items-center p-4'>
			<View className='flex flex-1 flex-row items-center'>
				{icon && (
					<Text>
						<Image
							style={{ width: 40, height: 40, borderRadius: 25 }}
							source={"https://picsum.photos/seed/696/3000/2000"}
							placeholder='usuario logueado'
							contentFit='cover'
							transition={1000}
						/>
					</Text>
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
		</View>
	);
};

export default HeaderComponent;
