import { useToogleVisualization } from "@/store/useToogleVisualization";
import { colors } from "@/styles/constants";
import React from "react";
import { Text, View } from "react-native";

const GastosXdia = ({
	gastosPorDiaSummary,
}: {
	gastosPorDiaSummary: Record<string, number>;
}) => {
	const { toogleVisualization } = useToogleVisualization();
	
	return (
		<View className='bg-white rounded-2xl p-4 shadow-sm'>
			<Text className='text-base font-semibold text-gray-500 mb-4'>
				Gastos por Día (Mes Actual)
			</Text>
			{Object.keys(gastosPorDiaSummary).length > 0 ? (
				Object.entries(gastosPorDiaSummary)
					.sort((a, b) => b[0].localeCompare(a[0])) // Ordenar por fecha descendente
					.map(([date, monto], index) => (
						<View
							key={index}
							className='flex-row justify-between items-center py-3 border-b border-gray-100'>
							<Text className='text-base font-medium text-gray-700'>
								{date}
							</Text>
							<Text
								className='text-lg font-bold'
								style={{ color: colors.primary }}>
								${toogleVisualization ? monto.toLocaleString("es-AR") : "*****"}
							</Text>
						</View>
					))
			) : (
				<Text className='text-center text-gray-500 py-10'>
					No hay datos de gastos para este mes.
				</Text>
			)}
		</View>
	);
};

export default GastosXdia;
