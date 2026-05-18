import { supabase } from "@/api/lib/supabase";

/**
 * Sube una imagen a Supabase Storage y actualiza el perfil del usuario.
 * @param userId ID del usuario actual.
 * @param uri URI de la imagen seleccionada del dispositivo.
 * @param mimeType Tipo MIME de la imagen.
 * @returns La URL pública de la imagen subida.
 */
export const uploadAvatarService = async (
	userId: string,
	uri: string,
	mimeType: string,
): Promise<string | null> => {
	try {
		const fileExt = uri.split(".").pop();
		const fileName = `${userId}-${Math.random()}.${fileExt}`;
		const filePath = `${fileName}`;

		// 1. Subir el archivo a Supabase Storage
		const formData = new FormData();
		formData.append("files", {
			uri,
			name: fileName,
			type: mimeType,
		} as any);

		const { error: uploadError } = await supabase.storage
			.from("avatars")
			.upload(filePath, formData);

		if (uploadError) throw uploadError;

		// 2. Obtener la URL pública
		const { data: urlData } = supabase.storage
			.from("avatars")
			.getPublicUrl(filePath);

		const publicUrl = urlData.publicUrl;

		// 3. Actualizar o crear el registro en la tabla profiles con la nueva URL usando upsert
		const { error: updateError } = await supabase
			.from("profiles")
			.upsert({ 
				id: userId, 
				avatar_url: publicUrl 
			});

		if (updateError) throw updateError;

		return publicUrl;
	} catch (error) {
		console.error("Error al subir el avatar:", error);
		return null;
	}
};
