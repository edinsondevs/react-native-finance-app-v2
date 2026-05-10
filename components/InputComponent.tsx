import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome"; 

import { formatCurrency, handleChangeText } from "@/helpers";
import { InterfaceInputComponentProps } from "@/interfaces";

/*
 * @component InputComponent
 * Componente que permite ingresar texto.
 * @param {function} setValue - Función que se ejecuta al cambiar el valor.
 * @param {string} value - Valor del input.
 * @param {string} className - Clase CSS del input.
 * @param {boolean} iconDollar - Indica si el input tiene un icono de dólar.
 * @param {boolean} secureTextEntry - Indica si el input es seguro.
 * @param {boolean} showCounter - Indica si el input muestra un contador.
 * @param {number} maxLength - Longitud máxima del input.
 */

const InputComponent = ({
	value,
	setValue,
	className,
	iconDollar = false,
	secureTextEntry = false,
	showCounter = true,
	maxLength,
	...props
}: InterfaceInputComponentProps) => {
	const [isSecure, setIsSecure] = useState(secureTextEntry);
	const pl = iconDollar ? "pl-8" : "pl-4";

	// Usar valor formateado solo si iconDollar está activo
	const displayValue = iconDollar ? formatCurrency(value) : value;

	return (
		<View className='relative'>
			<TextInput
				className={`w-full rounded-lg border border-border-light bg-white h-14 ${pl} pr-4 text-xl font-semibold text-text-dark ${className}`}
				value={displayValue}
				onChangeText={
					iconDollar
						? (text) => handleChangeText(text, setValue)
						: setValue
				}
				keyboardType={iconDollar ? "decimal-pad" : props.keyboardType}
				secureTextEntry={isSecure}
				maxLength={maxLength}
				{...props}
			/>
			{iconDollar && (
				<Text className='absolute left-3 top-3.5 text-xl font-semibold text-text-dark'>
					$
				</Text>
			)}
			{secureTextEntry && (
				<Pressable onPress={() => setIsSecure(!isSecure)}>
					<Text className='absolute right-4 bottom-3.5 text-xl font-semibold text-text-dark'>
						{isSecure ? (
							<FontAwesome
								name='eye'
								size={24}
								color='black'
							/>
						) : (
							<FontAwesome
								name='eye-slash'
								size={24}
								color='black'
							/>
						)}
					</Text>
				</Pressable>
			)}

			{showCounter && maxLength && (
				<Text
					className={`absolute right-2 bottom-1 text-[10px] ${
						(value || "").length >= maxLength
							? "text-red-500"
							: "text-text-muted"
					} opacity-70`}>
					{(value || "").length}/{maxLength}
				</Text>
			)}
		</View>
	);
};

export default InputComponent;
