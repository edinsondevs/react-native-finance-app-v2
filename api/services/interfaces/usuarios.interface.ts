/* 
 * @interface Profile
 * Interfaz para los datos de los perfiles.
 * Coincide con el payload esperado por el endpoint GET /profiles.
 */
export interface Profile {
	id: string;
	display_name: string;
	avatar_url?: string;
}
