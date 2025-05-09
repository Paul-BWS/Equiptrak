import { supabase } from "@/integrations/supabase/client";

export async function uploadCompanyAsset(file: File, assetType: string, name: string) {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company_assets')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('company_assets')
      .getPublicUrl(fileName);

    // Store metadata in the database
    const { error: dbError } = await supabase
      .from('company_assets')
      .insert({
        name: name,
        file_path: fileName,
        asset_type: assetType
      });

    if (dbError) {
      throw dbError;
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading company asset:', error);
    throw error;
  }
}