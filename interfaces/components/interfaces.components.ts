import { FontAwesome } from "@expo/vector-icons";
import { Control, FieldValues, Path, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ModalProps, TextInputProps, ViewProps } from "react-native";

import { DateType } from "react-native-ui-datepicker";
import { PressableProps } from "react-native/Libraries/Components/Pressable/Pressable";

/*
 * @interface ButtomComponentProps
 * Propiedades para el componente ButtomComponent.
 * Contiene la información del botón que se va a crear.
 */
export interface ButtomComponentProps extends PressableProps {
    onPressFunction: () => void;
    text: string;
    color?:
        | "bg-primary"
        | "bg-secondary"
        | "bg-google-red"
        | "bg-github-dark"
        | "bg-button-disabled"
        | "bg-red-500"
        | "transparent";
    width?:
        | "w-auto"
        | "w-24"
        | "w-32"
        | "w-40"
        | "w-48"
        | "w-64"
        | "w-80"
        | "w-96"
        | "w-full";
    circular?: boolean;
    textColor?: "text-text-white" | "text-text-black";
    className?: string;
    disabled?: boolean;
}

/*
 * @interface CardsComponentProps
 * Propiedades para el componente CardsComponent.
 * Contiene la información de la tarjeta que se va a crear.
 */
export interface CardsComponentProps extends ViewProps {
	children: React.ReactNode;
}

/*
 * @interface ChipComponentProps
 * Propiedades para el componente ChipComponent.
 * Contiene la información del chip que se va a crear.
 */
export interface ChipComponentProps {
	onPressFunction: () => void;
	text: string;
}

/*
 * @interface ButtonProps
 * Propiedades para el componente Button.
 * Contiene la información del botón que se va a crear.
 */
export interface InterfaceButtonProps extends PressableProps {
	onPressFunction: () => void;
	text: string;
	// Usamos 'bg-primary' como un ejemplo de clase de Tailwind para el color
	color?: "bg-primary" | "bg-secondary" | "bg-google-red";
	textColor?: "text-text-dark" | "text-text-light";
	className?: string;
	classNameText?: string;
}

/*
 * @interface CustomSelectorProps
 * Propiedades para el componente CustomSelector.
 * @template T - El tipo de objeto que representa cada opción.
 */
export interface InterfaceCustomSelectorProps<T> {
    /** Array de opciones a mostrar */
    data?: T[];
    /** Callback que se ejecuta al seleccionar una opción */
    onSelect?: (item: T) => void;
    /** Texto a mostrar cuando no hay ninguna opción seleccionada */
    placeholder?: string;
    /** Nombre de la propiedad del objeto a usar como etiqueta (display) */
    labelKey?: keyof T;
    /** Nombre de la propiedad del objeto a usar como valor único (id) */
    valueKey?: keyof T;
    /** Nombre de la propiedad del objeto que contiene el nombre del icono */
    iconKey?: keyof T;
    /** Indica si se están cargando los datos */
    isLoading?: boolean;
    /** Mensaje de error a mostrar */
    error?: string | null;
    /** Valor actualmente seleccionado (controlado externamente) */
    value?: T | null;
}

/*
 * @interface DateTimePickerComponentProps
 * Propiedades para el componente DateTimePickerComponent.
 * Contiene la información del date picker que se va a crear.
 */
export interface InterfaceDateTimePickerComponentProps {
	onRequestClose: (date: DateType) => void;
	cancelRequestClose: () => void;
	value?: DateType;
	maximumDate?: Date;
	minimumDate?: Date;
}

/*
 * @interface HeaderComponentProps
 * Propiedades para el componente HeaderComponent.
 * Contiene la información del header que se va a crear.
 */
export interface InterfaceHeaderComponentProps {
	title: string;
	icon?: boolean;
	onPressHelp?: () => void;
}

/*
 * @interface IconPickerProps
 * Propiedades para el componente IconPicker.
 * Contiene la información del icono que se va a crear.
 */
export interface InterfaceIconPickerProps {
	onSelectIcon: (iconName: string) => void;
	selectedIcon?: string;
}


/*
 * @interface IconPickerModalProps
 * Propiedades para el componente IconPickerModal.
 * Contiene la información del icono que se va a crear.
 */
export interface InterfaceIconPickerModalProps {
	visible: boolean;
	onClose: () => void;
	selectedIcon: string;
	onSelectIcon: (icon: string) => void;
}

/*
 * @interface IconTriggerProps
 * Propiedades para el componente IconTrigger.
 * Contiene la información del icono que se va a crear.
 */
export interface InterfaceIconTriggerProps {
	icon: string;
	onPress: () => void;
}


/*
 * @interface InputComponentProps
 * Propiedades para el componente InputComponent.
 * Contiene la información del input que se va a crear.
 */
export interface InterfaceInputComponentProps extends TextInputProps {
	value: string;
	setValue: (value: string) => void;
	className?: string;
	iconDollar?: boolean;
	showCounter?: boolean;
}

/*
 * @interface ItemMovimientosCardsProps
 * Interfaz que define las propiedades para el componente ItemMovimientosCards.
 * Define la estructura de datos que representa una tarjeta de movimiento financiero.
 */
export interface InterfaceItemMovimientosCardsProps {
	description: string;
	amount: number; // Por ejemplo: 45.50
	icon: keyof typeof FontAwesome.glyphMap; // Nombre del icono de FontAwesome (ej: 'shopping-cart')
}

/*
 * @interface LinkComponentProps
 * Propiedades para el componente LinkComponent.
 * Contiene la información del link que se va a crear.
 */
export interface InterfaceLinkComponentProps {
    text: string;
    onPress: () => void;
}

/*
 * @interface ModalComponentProps
 * Propiedades para el componente ModalComponent.
 * Contiene la información del modal que se va a crear.
 */
export interface InterfaceModalComponentProps extends ModalProps {
	children: React.ReactNode;
}

/*
 * @interface DatePickerModalProps
 * Propiedades para el componente DatePickerModal.
 * Contiene la información del date picker que se va a crear.
 */
export interface InterfaceDatePickerModalProps {
	visible: boolean;
	value: Date;
	onClose: () => void;
	onSelect: (date: Date) => void;
	maximumDate?: Date;
	minimumDate?: Date;
}

/*
 * @interface DescripcionFieldProps
 * Propiedades para el componente DescripcionField.
 * Contiene la información del campo de descripción que se va a crear.
 */
export interface InterfaceDescripcionFieldProps<TFieldValues extends FieldValues = FieldValues> {
    control: Control<TFieldValues>;
    name?: Path<TFieldValues>;
    title?: string;
    placeholder?: string;
    maxLength?: number;
}

/*
 * @interface FechaFieldProps
 * Propiedades para el componente FechaField.
 * Contiene la información del campo de fecha que se va a crear.
 */
export interface InterfaceFechaFieldProps<TFieldValues extends FieldValues = FieldValues> {
	control: Control<TFieldValues>;
	watch: UseFormWatch<TFieldValues>;
	setValue: UseFormSetValue<TFieldValues>;
	name?: Path<TFieldValues>;
	title?: string;
	defaultValue?: Date;
}

/*
 * @interface MontoFieldProps
 * Propiedades para el componente MontoField.
 * Contiene la información del campo de monto que se va a crear.
 */
export interface InterfaceMontoFieldProps<TFieldValues extends FieldValues = FieldValues> {
	control: Control<TFieldValues>;
	name?: Path<TFieldValues>;
	title?: string;
}

/*
 * @interface TabButtonProps
 * Propiedades para el componente TabButton.
 * Contiene la información del tab que se va a crear.
 */
export interface InterfaceTabButtonProps {
	label: string;
	value: string;
	isSelected: boolean;
	onPress: (value: string) => void;
}
