import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Interfaz que define la estructura del estado de visualización.
 * - toogleVisualization: booleano que indica si se deben mostrar u ocultar ciertos elementos (ej. saldos).
 * - setToogleVisualization: función para actualizar dicho estado.
 */
interface ToogleVisualization {
    toogleVisualization: boolean;
    setToogleVisualization: (toogleVisualization: boolean) => void;
}

/**
 * Hook personalizado (Store de Zustand) para gestionar el estado global de visualización.
 * Utiliza persistencia con AsyncStorage para que el estado del ojo (toogleVisualization)
 * se mantenga guardado de forma permanente incluso al cerrar la aplicación.
 */
export const useToogleVisualization = create<ToogleVisualization>()(
    persist(
        (set) => ({
            // Estado inicial: falso (oculto por defecto si es la primera vez)
            toogleVisualization: false,
            // Función para actualizar el estado
            setToogleVisualization: (toogleVisualization) => set({ toogleVisualization }),
        }),
        {
            name: "toogle-visualization-storage", // Clave única para persistencia
            storage: createJSONStorage(() => AsyncStorage), // Motor de almacenamiento en React Native
        }
    )
);