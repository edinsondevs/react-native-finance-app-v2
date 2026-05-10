import { useToogleVisualization } from "@/store/useToogleVisualization";
import { colors } from "@/styles/constants";
import React from "react";
import { Text, View } from "react-native";

interface GastosPorUsuarioProps {
	data: {
		userId: string;
		displayName: string;
		monto: number;
		color: string;
	}[];
}

const GastosPorUsuario = ({ data }: GastosPorUsuarioProps) => {
	const { toogleVisualization } = useToogleVisualization();
	return (
		<View className='bg-white rounded-2xl p-4 shadow-sm'>
			<Text className='text-base font-semibold text-gray-500 mb-4'>
				Gastos por Usuario (Mes Actual)
			</Text>
			{data && data.length > 0 ? (
				[...data]
					.sort((a, b) => (b.monto || 0) - (a.monto || 0))
					.map((item, index) => (
						<View
							key={index}
							className='flex-row justify-between items-center py-3 border-b border-gray-100'>
							<View className='flex-row items-center'>
								<View
									className='w-2 h-2 rounded-full mr-2'
									style={{ backgroundColor: item.color }}
								/>
								<Text className='text-base font-medium text-gray-700'>
									{item.displayName}
								</Text>
							</View>
							<Text
								className='text-lg font-bold'
								style={{ color: colors.primary }}>
								${toogleVisualization ? (item.monto || 0).toLocaleString("es-AR") : "*****"}
							</Text>
						</View>
					))
			) : (
				<Text className='text-center text-gray-500 py-10'>
					No hay datos de gastos por usuario.
				</Text>
			)}
		</View>
	);
};

export default GastosPorUsuario;
