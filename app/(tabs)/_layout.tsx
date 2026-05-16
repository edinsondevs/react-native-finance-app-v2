import { colors } from "@/styles/constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.primary,
				headerShown: false,
				animation: "shift",
				tabBarStyle: {
					minHeight: 80,
				},
			}}>
			<Tabs.Screen
				name='gastos'
				options={{
					headerTitle: "Gastos",
					headerTitleContainerStyle: {
						flex: 1,
					},
					headerStyle: {
						height: 80,
					},
					title: "Gastos",
					tabBarIcon: ({ color }) => (
						<FontAwesome
							size={28}
							name='money'
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='ingresos'
				options={{
					title: "Ingresos",
					tabBarIcon: ({ color }) => (
						<FontAwesome
							size={28}
							name='dollar'
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='estadisticas'
				options={{
					title: "Estadísticas",
					tabBarIcon: ({ color }) => (
						<FontAwesome
							size={28}
							name='bar-chart'
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='historial'
				options={{
					title: "Historial",
					tabBarIcon: ({ color }) => (
						<FontAwesome
							size={28}
							name='history'
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='ajustes'
				options={{
					title: "Ajustes",
					tabBarIcon: ({ color }) => (
						<FontAwesome
							size={28}
							name='wrench'
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
