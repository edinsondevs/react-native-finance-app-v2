import { create } from "zustand";
import { supabase } from "../api/lib/supabase";

export type User = {
	id: string;
	email: string;
	displayName?: string;
} | null;

type AuthStore = {
	user: User;
	loading: boolean;
	status: "checking" | "authenticated" | "unauthenticated";
	error: string | null;
	signUp: (
		email: string,
		password: string,
		displayName: string,
	) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	fetchSession: () => Promise<void>;
	initializeAuth: () => void;
};

/**
 * Store de Zustand para manejar la autenticación con Supabase.
 * Proporciona métodos para inicio de sesión, registro y gestión de sesión persistente.
 */
export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	loading: false,
	status: "checking",
	error: null,

	/**
	 * Configura el listener de cambios de autenticación de Supabase.
	 */
	initializeAuth: () => {
		supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				set({
					user: {
						id: session.user.id,
						email: session.user.email!,
						displayName: session.user.user_metadata?.full_name,
					},
					status: "authenticated",
				});
			} else {
				set({ user: null, status: "unauthenticated" });
			}
		});
	},

	/**
	 * Registra un nuevo usuario en Supabase con correo, contraseña y nombre visible.
	 */
	signUp: async (email, password, displayName) => {
		set({ loading: true, error: null });
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: displayName,
				},
			},
		});
		if (error) set({ error: error.message });
		else
			set({
				user: data.user
					? {
							id: data.user.id,
							email: data.user.email!,
							displayName: data.user.user_metadata.full_name,
						}
					: null,
				status: data.user ? "authenticated" : "unauthenticated",
			});
		set({ loading: false });
	},

	/**
	 * Inicia sesión de un usuario existente.
	 */
	signIn: async (email, password) => {
		set({ loading: true, error: null });

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) set({ error: "El correo o la contraseña son incorrectos" });
		else
			set({
				user: data.user
					? {
							id: data.user.id,
							email: data.user.email!,
							displayName: data.user.user_metadata?.full_name,
						}
					: null,
				status: data.user ? "authenticated" : "unauthenticated",
			});
		set({ loading: false });
	},

	/**
	 * Cierra la sesión del usuario actual y limpia el estado.
	 */
	signOut: async () => {
		await supabase.auth.signOut();
		set({ user: null, status: "unauthenticated" });
	},

	/**
	 * Recupera la sesión actual de Supabase si existe (por ejemplo, al recargar la app).
	 */
	fetchSession: async () => {
		const { data } = await supabase.auth.getSession();
		if (data.session) {
			set({
				user: {
					id: data.session.user.id,
					email: data.session.user.email!,
					displayName: data.session.user.user_metadata?.full_name,
				},
				status: "authenticated",
			});
		} else {
			set({ status: "unauthenticated" });
		}
	},
}));
