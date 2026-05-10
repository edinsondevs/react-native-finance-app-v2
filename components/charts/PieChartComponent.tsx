import { useToogleVisualization } from "@/store/useToogleVisualization";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface PieChartComponentProps {
	data: {
		name: string;
		monto: number;
		color: string;
	}[];
}

const screenWidth = Dimensions.get("window").width;

const PieChartComponent = ({ data }: PieChartComponentProps) => {

	const { toogleVisualization } = useToogleVisualization();

	const total = data.reduce((acc, item) => acc + item.monto, 0);

	const pieData = data.map((item) => ({
		value: item.monto,
		color: item.color,
		text: `${((item.monto / total) * 100).toFixed(1)}%`,
		label: item.name,
	}));

	return (
		<View
			style={{
				alignItems: "center",
				justifyContent: "center",
				width: screenWidth - 64,
			}}>
			<PieChart
				data={pieData}
				donut
				showGradient
				sectionAutoFocus
				radius={100}
				innerRadius={65}
				innerCircleColor={"white"}
				centerLabelComponent={() => {
					return (
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
							}}>
							<Text
								style={{
									fontSize: 14,
									color: "black",
									fontWeight: "bold",
								}}>
								${toogleVisualization ? total.toLocaleString("es-AR") : "*****"}
							</Text>
							<Text style={{ fontSize: 12, color: "gray" }}>
								Total
							</Text>
						</View>
					);
				}}
			/>

			<View style={{ marginTop: 20, width: "100%" }}>
				{data.map((item, index) => (
					<View
						key={index}
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 8,
						}}>
						<View
							style={{
								width: 12,
								height: 12,
								borderRadius: 6,
								backgroundColor: item.color,
								marginRight: 10,
							}}
						/>
						<Text
							style={{ flex: 1, fontSize: 14, color: "#4b5563" }}>
							{item.name}{" "}
							<Text style={{ fontSize: 12, color: "#9ca3af" }}>
								({((item.monto / total) * 100).toFixed(1)}%)
							</Text>
						</Text>
						<Text
							style={{
								fontSize: 14,
								fontWeight: "bold",
								color: "#1f2937",
							}}>
							${toogleVisualization ? item.monto.toLocaleString("es-AR") : "*****"}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
};

export default PieChartComponent;
