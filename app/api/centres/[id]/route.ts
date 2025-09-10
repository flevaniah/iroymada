import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { MOCK_HEALTH_CENTERS } from "@/lib/mock-data";
import { createClient } from "@supabase/supabase-js";
import { decodeIdToSearchTerm, encodeId } from "@/lib/id-encoder";
import { ImageManager } from "@/lib/image-manager";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);


export const dynamic = "force-dynamic";


async function isSupabaseConfigured() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("health_centers")
      .select("id")
      .limit(1);
    return !error;
  } catch (error) {
   
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

   
    const supabaseConfigured = await isSupabaseConfigured();

    if (supabaseConfigured) {
    
      const supabase = createServerClient();
      
    
      if (id.length === 36 && id.includes('-')) {
 
        const { data: center, error } = await supabase
          .from("health_centers")
          .select(
            `
            id,
            name,
            center_type,
            service_category,
            status,
            full_address,
            city,
            district,
            postal_code,
            region,
            phone,
            secondary_phone,
            whatsapp,
            email,
            website,
            services,
            specialties,
            opening_hours,
            emergency_24h,
            wheelchair_accessible,
            parking_available,
            public_transport,
            photos,
            logo_url,
            latitude,
            longitude,
            description,
            view_count,
            created_at,
            updated_at
          `
          )
          .eq("id", id)
          .eq("status", "approved")
          .single();

        if (error) {
        
          if (error.code === 'PGRST116') {
            return NextResponse.json(
              { error: "Centre non trouvé" },
              { status: 404 }
            );
          }
          return NextResponse.json(
            { error: "Error retrieving health center" },
            { status: 500 }
          );
        }

        
        const centerWithEncodedId = {
          ...center,
          id: encodeId(center.id),
          real_id: center.id
        };

        return NextResponse.json({ center: centerWithEncodedId });

      } else {
  
        try {
          const searchTerm = decodeIdToSearchTerm(id);
          
          const { data: allCenters, error: fetchError } = await supabase
            .from("health_centers")
            .select(
              `
              id,
              name,
              center_type,
              service_category,
              status,
              full_address,
              city,
              district,
              postal_code,
              region,
              phone,
              secondary_phone,
              whatsapp,
              email,
              website,
              services,
              specialties,
              opening_hours,
              emergency_24h,
              wheelchair_accessible,
              parking_available,
              public_transport,
              photos,
              logo_url,
              latitude,
              longitude,
              description,
              view_count,
              created_at,
              updated_at
            `
            )
            .eq("status", "approved");

          if (fetchError) {
           
            return NextResponse.json(
              { error: "Error retrieving health centers" },
              { status: 500 }
            );
          }

      
          const center = allCenters?.find((c: any) => 
            c.id.replace(/-/g, '').toLowerCase().startsWith(searchTerm.toLowerCase())
          );

          if (!center) {
            return NextResponse.json(
              { error: "Centre non trouvé" },
              { status: 404 }
            );
          }

          const centerWithEncodedId = {
            ...center,
            id: encodeId(center.id),
            real_id: center.id
          };

          return NextResponse.json({ center: centerWithEncodedId });

        } catch (error) {
          return NextResponse.json(
            { error: "ID invalide" },
            { status: 400 }
          );
        }
      }
    } else {
      
     
      
      
      let center = MOCK_HEALTH_CENTERS.find((c) => c.id === id);
      
      
      if (!center) {
        center = MOCK_HEALTH_CENTERS.find((c) => encodeId(c.id) === id);
      }

      if (!center) {
        return NextResponse.json(
          { error: "Centre non trouvé" },
          { status: 404 }
        );
      }

      const centerWithEncodedId = {
        ...center,
        id: encodeId(center.id),
        real_id: center.id
      };

      return NextResponse.json({ center: centerWithEncodedId });
    }
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const supabaseConfigured = await isSupabaseConfigured();

    if (supabaseConfigured) {
      const { data: oldCenter } = await supabaseAdmin
        .from("health_centers")
        .select("photos")
        .eq("id", id)
        .single();

      const oldPhotos = oldCenter?.photos || [];
      const newPhotos = body.photos || [];

   
      const { data: center, error } = await supabaseAdmin
        .from("health_centers")
        .update({
          name: body.name,
          center_type: body.center_type,
          service_category: body.service_category,
          status: body.status,
          full_address: body.full_address,
          city: body.city,
          district: body.district,
          postal_code: body.postal_code,
          region: body.region,
          phone: body.phone,
          secondary_phone: body.secondary_phone,
          whatsapp: body.whatsapp,
          email: body.email,
          website: body.website,
          services: body.services,
          specialties: body.specialties,
          opening_hours: body.opening_hours,
          emergency_24h: body.emergency_24h,
          wheelchair_accessible: body.wheelchair_accessible,
          parking_available: body.parking_available,
          public_transport: body.public_transport,
          photos: body.photos,
          logo_url: body.logo_url,
          latitude: body.latitude,
          longitude: body.longitude,
          description: body.description,
          admin_notes: body.admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

     
      if (Array.isArray(oldPhotos) && Array.isArray(newPhotos)) {
        ImageManager.cleanupImages(oldPhotos, newPhotos).catch(error => {
          
        });
      }

      if (error) {
       
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: "Centre non trouvé" },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { error: "Error updating health center", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        center,
        message: "Centre de santé mis à jour avec succès",
      });
    } else {
   
      return NextResponse.json({
        center: { id, ...body },
        message: "Centre de santé mis à jour avec succès (mode développement)",
      });
    }
  } catch (error) {
   
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

   
    const supabaseConfigured = await isSupabaseConfigured();

    if (supabaseConfigured) {
      
      const { data: centerToDelete } = await supabaseAdmin
        .from("health_centers")
        .select("photos")
        .eq("id", id)
        .single();

      const { error } = await supabaseAdmin
        .from("health_centers")
        .delete()
        .eq("id", id);

      if (error) {
    
        return NextResponse.json(
          { error: "Error deleting health center", details: error.message },
          { status: 500 }
        );
      }

   
      if (centerToDelete?.photos && Array.isArray(centerToDelete.photos)) {
        ImageManager.deleteImages(centerToDelete.photos).catch(error => {
          
        });
      }

      return NextResponse.json({
        message: "Centre de santé supprimé avec succès",
      });
    } else {
      // Mock mode - just return success
    
      return NextResponse.json({
        message: "Centre de santé supprimé avec succès (mode développement)",
      });
    }
  } catch (error) {
   
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}