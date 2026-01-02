// ============================================
// BASEROW FILE UPLOAD SERVICE
// ============================================
// Upload de fichiers vers l'API Baserow (User Files)
// Documentation: https://baserow.io/api-docs

import { BASEROW_API_URL, BASEROW_TOKEN } from './config';

export interface BaserowUploadResult {
  url: string;
  thumbnails?: {
    tiny?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
  };
  name: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width?: number;
  image_height?: number;
  uploaded_at: string;
}

/**
 * Upload un fichier vers Baserow via l'API User Files
 * 
 * @param buffer - Buffer du fichier à uploader
 * @param filename - Nom du fichier (avec extension)
 * @returns URL publique du fichier sur Baserow
 * @throws Error si l'upload échoue
 * 
 * @example
 * const url = await uploadFileToBaserow(buffer, 'logo.png');
 * // Returns: "https://baserow.mick-solutions.ch/media/user_files/xxx.png"
 */
export async function uploadFileToBaserow(
  buffer: Buffer, 
  filename: string
): Promise<string> {
  if (!BASEROW_TOKEN) {
    throw new Error('BASEROW_API_TOKEN non configuré');
  }

  // Créer un FormData avec le fichier
  const formData = new FormData();
  
  // Convertir le Buffer en Blob via Uint8Array (compatibilité TypeScript)
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], { type: getMimeType(filename) });
  formData.append('file', blob, filename);

  const response = await fetch(`${BASEROW_API_URL}/user-files/upload-file/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${BASEROW_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Baserow Upload] Error:', response.status, errorText);
    throw new Error(`Erreur upload Baserow: ${response.status} - ${errorText}`);
  }

  const data: BaserowUploadResult = await response.json();
  
  console.log(`✅ [Baserow Upload] File uploaded: ${data.name} → ${data.url}`);
  
  return data.url;
}

/**
 * Upload un fichier et retourne les informations complètes
 */
export async function uploadFileToBaserowFull(
  buffer: Buffer, 
  filename: string
): Promise<BaserowUploadResult> {
  if (!BASEROW_TOKEN) {
    throw new Error('BASEROW_API_TOKEN non configuré');
  }

  const formData = new FormData();
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], { type: getMimeType(filename) });
  formData.append('file', blob, filename);

  const response = await fetch(`${BASEROW_API_URL}/user-files/upload-file/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${BASEROW_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur upload Baserow: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Upload via URL (Baserow télécharge depuis l'URL)
 * @returns URL publique du fichier
 */
export async function uploadFileFromUrl(
  url: string
): Promise<string> {
  if (!BASEROW_TOKEN) {
    throw new Error('BASEROW_API_TOKEN non configuré');
  }

  const response = await fetch(`${BASEROW_API_URL}/user-files/upload-via-url/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur upload via URL: ${response.status} - ${errorText}`);
  }

  const data: BaserowUploadResult = await response.json();
  return data.url;
}

/**
 * Upload via URL et retourne l'objet complet
 * Utile pour récupérer le "name" généré par Baserow
 * @returns Objet complet BaserowUploadResult avec .name, .url, etc.
 */
export async function uploadFileFromUrlFull(
  url: string
): Promise<BaserowUploadResult> {
  if (!BASEROW_TOKEN) {
    throw new Error('BASEROW_API_TOKEN non configuré');
  }

  const response = await fetch(`${BASEROW_API_URL}/user-files/upload-via-url/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Baserow Upload via URL] Error:', response.status, errorText);
    throw new Error(`Erreur upload via URL: ${response.status} - ${errorText}`);
  }

  const data: BaserowUploadResult = await response.json();
  console.log(`✅ [Baserow Upload via URL] Imported: ${url} → ${data.name}`);
  
  return data;
}

/**
 * Détermine le type MIME basé sur l'extension du fichier
 */
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'heic': 'image/heic',
    'avif': 'image/avif',
    'bmp': 'image/bmp',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}

