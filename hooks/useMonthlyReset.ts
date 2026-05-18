import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { resetServiciosMensualesServices } from '@/api/services/servicios_mensuales/update.serviciosMensuales.service';

const LAST_RESET_MONTH_KEY = 'last_reset_month';

export const useMonthlyReset = (refetch: () => void) => {
	const resetMutation = useMutation({
		mutationFn: resetServiciosMensualesServices,
		onSuccess: async () => {
			const currentMonth = dayjs().format('YYYY-MM');
			await AsyncStorage.setItem(LAST_RESET_MONTH_KEY, currentMonth);
			console.log(`✅ Servicios mensuales reiniciados para el mes: ${currentMonth}`);
			refetch();
		},
		onError: (error) => {
			console.error("❌ Error al realizar el reinicio mensual:", error);
		}
	});

	useEffect(() => {
		const checkAndReset = async () => {
			try {
				const lastResetMonth = await AsyncStorage.getItem(LAST_RESET_MONTH_KEY);
				const currentMonth = dayjs().format('YYYY-MM');

				if (lastResetMonth !== currentMonth) {
					console.log(`⏳ Detectado inicio de mes (${currentMonth}). Iniciando reinicio de servicios...`);
					resetMutation.mutate();
				}
			} catch (error) {
				console.error("❌ Error al verificar el reinicio mensual:", error);
			}
		};

		checkAndReset();
	}, []);

	return {
		isResetting: resetMutation.isPending
	};
};
