import { create } from "zustand";

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
 * Se utiliza comúnmente para alternar la visibilidad de información sensible en la aplicación.
 */
export const useToogleVisualization = create<ToogleVisualization>((set) => ({
    // Estado inicial: falso (oculto por defecto)
    toogleVisualization: false,
    // Función para actualizar el estado con el nuevo valor proporcionado
    setToogleVisualization: (toogleVisualization) => set({ toogleVisualization }),
}));