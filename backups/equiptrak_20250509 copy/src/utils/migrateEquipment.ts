import { supabase } from "@/integrations/supabase/client";

export async function migrateEquipmentData() {
  try {
    // 1. Fetch data from compressor_records
    const { data: compressorData, error: compressorError } = await supabase
      .from("compressor_records")
      .select("*");
      
    if (compressorError) throw compressorError;
    
    // 2. Fetch data from spot_welder_service_records
    const { data: spotWelderData, error: spotWelderError } = await supabase
      .from("spot_welder_service_records")
      .select("*");
      
    if (spotWelderError) throw spotWelderError;
    
    // 3. Transform and insert compressor data
    for (const item of compressorData || []) {
      const { error } = await supabase.from("equipment").insert({
        company_id: item.company_id,
        equipment_type: "Compressor",
        serial_number: item.serial_number,
        model: item.model,
        manufacturer: item.manufacturer,
        test_date: item.test_date,
        retest_date: item.retest_date,
        status: item.status,
        notes: item.notes,
        specific_attributes: {
          // Add compressor-specific fields here
          pressure: item.pressure,
          // ... other fields
        }
      });
      
      if (error) console.error("Error migrating compressor:", error);
    }
    
    // 4. Transform and insert spot welder data
    for (const item of spotWelderData || []) {
      const { error } = await supabase.from("equipment").insert({
        company_id: item.company_id,
        equipment_type: "Spot Welder",
        serial_number: item.serial_number,
        model: item.model,
        manufacturer: item.manufacturer,
        test_date: item.test_date,
        retest_date: item.retest_date,
        status: item.status,
        notes: item.notes,
        specific_attributes: {
          // Add spot welder-specific fields here
          voltage: item.voltage,
          // ... other fields
        }
      });
      
      if (error) console.error("Error migrating spot welder:", error);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Migration error:", error);
    return { success: false, error };
  }
} 