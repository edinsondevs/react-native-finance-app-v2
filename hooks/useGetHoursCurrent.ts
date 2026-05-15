// import { useState, useEffect } from 'react';
import dayjs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export function useGetHoursCurrent() {
	let saludo = "";
	dayjs.extend(utc);
	dayjs.extend(timezone);
	// Para que todas las instancias de dayjs usen la zona horaria local por defecto
	// Intenta poner tu zona horaria específica aquí para probar
	const MI_ZONA = "America/Argentina/Buenos_Aires"; // o "America/Argentina/Buenos_Aires"

	const horaActual = dayjs().tz(MI_ZONA).hour();
	if (horaActual >= 6 && horaActual < 12) {
		saludo = "Buenos Días";
	} else if (horaActual >= 12 && horaActual < 19) {
		saludo = "Buenas Tardes";
	} else {
		saludo = "Buenas Noches";
	}

	return { horaActual, saludo };
}
