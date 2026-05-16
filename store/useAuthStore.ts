import { create } from "zustand";
import { supabase } from "../api/lib/supabase";
import * as SecureStore from "expo-secure-store";

export type User = {
	id: string;
	email: string;
	displayName?: string;
	avatarUrl?: string;
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
	updateAvatar: (url: string) => void;
	enableBiometrics: (password: string) => Promise<void>;
	disableBiometrics: () => Promise<void>;
	checkBiometrics: () => Promise<boolean>;
};

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	loading: false,
	status: "checking",
	error: null,

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
				
				// Cargar el perfil en segundo plano (avatar)
				supabase
					.from("profiles")
					.select("avatar_url")
					.eq("id", session.user.id)
					.single()
					.then(({ data: profile }) => {
						if (profile?.avatar_url) {
							set((state) => ({
								user: state.user ? { ...state.user, avatarUrl: profile.avatar_url } : null
							}));
						}
					});
			} else {
				set({ user: null, status: "unauthenticated" });
			}
		});
	},

	signUp: async (email, password, displayName) => {
		set({ loading: true, error: null });
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { full_name: displayName } },
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

	signOut: async () => {
		await supabase.auth.signOut();
		set({ user: null, status: "unauthenticated" });
	},

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

			// Cargar perfil en segundo plano
			const { data: profile } = await supabase
				.from("profiles")
				.select("avatar_url")
				.eq("id", data.session.user.id)
				.single();
			
			if (profile?.avatar_url) {
				set((state) => ({
					user: state.user ? { ...state.user, avatarUrl: profile.avatar_url } : null
				}));
			}
		} else {
			set({ status: "unauthenticated" });
		}
	},

	updateAvatar: (url: string) => {
		set((state) => ({
			user: state.user ? { ...state.user, avatarUrl: url } : null,
		}));
	},

	/**
	 * Habilita la biometría guardando las credenciales en SecureStore.
	 */
	enableBiometrics: async (password: string) => {
		const { user } = useAuthStore.getState();
		if (!user) return;

		await SecureStore.setItemAsync("user_email", user.email);
		await SecureStore.setItemAsync("user_password", password);
		await SecureStore.setItemAsync("biometrics_enabled", "true");
	},

	/**
	 * Deshabilita la biometría.
	 */
	disableBiometrics: async () => {
		await SecureStore.deleteItemAsync("user_email");
		await SecureStore.deleteItemAsync("user_password");
		await SecureStore.setItemAsync("biometrics_enabled", "false");
	},

	/**
	 * Verifica si la biometría está habilitada en este dispositivo.
	 */
	checkBiometrics: async () => {
		const enabled = await SecureStore.getItemAsync("biometrics_enabled");
		return enabled === "true";
	},
}));
