import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { PAGINATION_LIMIT } from "@/lib/constants";
import { MOCK_HEALTH_CENTERS } from "@/lib/mock-data";
import { createClient } from "@supabase/supabase-js";
import { encodeId } from "@/lib/id-encoder";


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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

   
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const center_type = searchParams.get("center_type") || "";
    const service_category = searchParams.get("service_category") || "";
    const emergency_24h = searchParams.get("emergency_24h") === "true";
    const wheelchair_accessible =
      searchParams.get("wheelchair_accessible") === "true";
    const services = searchParams.get("services")?.split(",") || [];
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(
      searchParams.get("limit") || PAGINATION_LIMIT.toString()
    );
    const noPagination = searchParams.get("noPagination") === "true";
    const sortBy = searchParams.get("sortBy") || "recent";

    const lat = searchParams.get("lat")
      ? parseFloat(searchParams.get("lat")!)
      : null;
    const lng = searchParams.get("lng")
      ? parseFloat(searchParams.get("lng")!)
      : null;
    const radius = parseInt(searchParams.get("radius") || "10000"); 


    const supabaseConfigured = await isSupabaseConfigured();

    if (supabaseConfigured) {
      
      const supabase = createServerClient();
      let queryBuilder = supabase
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
        `,
          { count: "exact" }
        )
        .eq("status", "approved");

  
      switch (sortBy) {
        case "name":
          queryBuilder = queryBuilder.order("name", { ascending: true });
          break;
        case "distance":
          
          break;
        case "recent":
        default:
          queryBuilder = queryBuilder.order("updated_at", { ascending: false, nullsLast: true })
                                   .order("created_at", { ascending: false });
          break;
      }

     
      if (query) {
     
        const searchTerm = `%${query}%`;
        queryBuilder = queryBuilder.or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm},full_address.ilike.${searchTerm}`
        );
      }
      if (city) {
        queryBuilder = queryBuilder.ilike("city", `%${city}%`);
      }
      if (center_type) {
        queryBuilder = queryBuilder.eq("center_type", center_type);
      }
      if (service_category) {
        queryBuilder = queryBuilder.eq("service_category", service_category);
      }
      if (emergency_24h) {
        queryBuilder = queryBuilder.eq("emergency_24h", true);
      }
      if (wheelchair_accessible) {
        queryBuilder = queryBuilder.eq("wheelchair_accessible", true);
      }
     
      const needsServerSideFiltering = services.length > 0;
      
      if (!noPagination && !needsServerSideFiltering) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        queryBuilder = queryBuilder.range(from, to);
      }

      const { data: centers, error, count } = await queryBuilder;

      if (error) {
        
        return NextResponse.json(
          { error: "Error retrieving health centers" },
          { status: 500 }
        );
      }

      
      let filteredCenters = centers || [];
      if (services.length > 0 && filteredCenters.length > 0) {
       
        filteredCenters = filteredCenters.filter((center: any) => {
          if (!Array.isArray(center.services)) return false;
          
          return services.some(searchService => {
            const searchTerm = searchService.toLowerCase().trim();
            return center.services.some((centerService: string) => {
              const centerServiceLower = centerService.toLowerCase();
              
              return centerServiceLower === searchTerm || 
                     centerServiceLower.includes(searchTerm);
            });
          });
        });
        
       
      }


      let centersWithDistance = filteredCenters;
      if (lat && lng && filteredCenters.length > 0) {
        centersWithDistance = filteredCenters.map((center: any) => ({
          ...center,
          distance:
            center.latitude && center.longitude
              ? calculateDistance(lat, lng, center.latitude, center.longitude)
              : null,
        }));
        
     
        if (sortBy === "distance") {
          centersWithDistance.sort((a: any, b: any) => (a.distance || Infinity) - (b.distance || Infinity));
        }
      } else if (sortBy === "distance") {
      
        centersWithDistance.sort((a: any, b: any) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
      }

      let finalCenters = centersWithDistance;
      let totalCount = centersWithDistance.length;
      
      if (!noPagination && needsServerSideFiltering) {
    
        const from = (page - 1) * limit;
        const to = from + limit;
        finalCenters = centersWithDistance.slice(from, to);
      }

     
      const centersWithEncodedIds = finalCenters.map((center: any) => ({
        ...center,
        id: encodeId(center.id),
        real_id: center.id 
      }));

      return NextResponse.json({
        centers: centersWithEncodedIds,
        pagination: {
          page: noPagination ? 1 : page,
          limit: noPagination ? centersWithEncodedIds.length : limit,
          total: needsServerSideFiltering ? totalCount : (count || centersWithEncodedIds.length),
          pages: noPagination ? 1 : Math.ceil((needsServerSideFiltering ? totalCount : (count || centersWithEncodedIds.length)) / limit),
        },
      });
    } else {
   
    
      let filteredCenters = [...MOCK_HEALTH_CENTERS];

      
      if (query) {
        const searchQuery = query.toLowerCase();
        filteredCenters = filteredCenters.filter(
          (center) =>
            center.name.toLowerCase().includes(searchQuery) ||
            center.description?.toLowerCase().includes(searchQuery) ||
            center.full_address.toLowerCase().includes(searchQuery) ||
            center.services.some((service) =>
              service.toLowerCase().includes(searchQuery)
            )
        );
      }

      if (city) {
        filteredCenters = filteredCenters.filter((center) =>
          center.city.toLowerCase().includes(city.toLowerCase())
        );
      }

      if (center_type) {
        filteredCenters = filteredCenters.filter(
          (center) => center.center_type === center_type
        );
      }

      if (service_category) {
        filteredCenters = filteredCenters.filter(
          (center) => center.service_category === service_category
        );
      }

      if (emergency_24h) {
        filteredCenters = filteredCenters.filter(
          (center) => center.emergency_24h === true
        );
      }

      if (wheelchair_accessible) {
        filteredCenters = filteredCenters.filter(
          (center) => center.wheelchair_accessible === true
        );
      }

      if (services.length > 0) {
        filteredCenters = filteredCenters.filter((center) =>
          services.some((service) =>
            center.services.some((centerService) =>
              centerService.toLowerCase().includes(service.toLowerCase().trim())
            )
          )
        );
      }

     
      if (lat && lng) {
        filteredCenters = filteredCenters.map((center: any) => ({
          ...center,
          distance:
            center.latitude && center.longitude
              ? calculateDistance(lat, lng, center.latitude, center.longitude)
              : null,
        }));
      }

     
      switch (sortBy) {
        case "name":
          filteredCenters.sort((a: any, b: any) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
          break;
        case "distance":
          if (lat && lng) {
            filteredCenters.sort((a: any, b: any) => (a.distance || Infinity) - (b.distance || Infinity));
          } else {
          
            filteredCenters.sort((a: any, b: any) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
          }
          break;
        case "recent":
        default:
          filteredCenters.sort((a: any, b: any) => 
            new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
          );
          break;
      }

     
      const total = filteredCenters.length;
      let finalCenters = filteredCenters;
      
      if (!noPagination) {
        const totalPages = Math.ceil(total / limit);
        const from = (page - 1) * limit;
        const to = from + limit;
        finalCenters = filteredCenters.slice(from, to);
      }

      const centersWithEncodedIds = finalCenters.map((center: any) => ({
        ...center,
        id: encodeId(center.id),
        real_id: center.id
      }));

      return NextResponse.json({
        centers: centersWithEncodedIds,
        pagination: {
          page: noPagination ? 1 : page,
          limit: noPagination ? total : limit,
          total,
          pages: noPagination ? 1 : Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
   
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabaseConfigured = await isSupabaseConfigured();

    if (supabaseConfigured) {
      const { data: center, error } = await supabaseAdmin
        .from("health_centers")
        .insert([
          {
            name: body.name,
            center_type: body.center_type,
            service_category: body.service_category || "health",
            status: "pending", 
            full_address: body.full_address,
            city: body.city,
            district: body.district,
            phone: body.phone,
            secondary_phone: body.secondary_phone,
            whatsapp: body.whatsapp,
            email: body.email,
            website: body.website,
            region: body.region || "Madagascar",
            latitude: body.latitude,
            longitude: body.longitude,
            services: body.services,
            specialties: body.specialties,
            emergency_24h: body.emergency_24h || false,
            wheelchair_accessible: body.wheelchair_accessible || false,
            parking_available: body.parking_available || false,
            public_transport: body.public_transport || false,
            description: body.description,
            opening_hours: body.opening_hours,
            photos: body.photos,
            admin_notes: body.admin_notes,
            view_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
      
        return NextResponse.json(
          { error: "Error creating health center", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          center,
          message:
            "Service d'urgence créé avec succès. Il sera examiné par notre équipe.",
        },
        { status: 201 }
      );
    } else {

    
      return NextResponse.json(
        {
          center: { id: "mock-" + Date.now(), ...body },
          message: "Service d'urgence créé avec succès (mode développement)",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
