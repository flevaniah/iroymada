import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);


export const dynamic = "force-dynamic";


const VIEW_COOLDOWN_MINUTES = 5;
const IP_VIEW_STORAGE = new Map<string, Map<string, number>>();


function canCountView(ip: string, centerId: string): boolean {
  const now = Date.now();
  const cooldownMs = VIEW_COOLDOWN_MINUTES * 60 * 1000;
  
  if (!IP_VIEW_STORAGE.has(ip)) {
    IP_VIEW_STORAGE.set(ip, new Map());
  }
  
  const ipViews = IP_VIEW_STORAGE.get(ip)!;
  const lastViewTime = ipViews.get(centerId);
  
  if (!lastViewTime || (now - lastViewTime) >= cooldownMs) {
    ipViews.set(centerId, now);
    return true;
  }
  
  return false;
}

setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  IP_VIEW_STORAGE.forEach((views, ip) => {
    views.forEach((timestamp, centerId) => {
      if (timestamp < oneHourAgo) {
        views.delete(centerId);
      }
    });
    if (views.size === 0) {
      IP_VIEW_STORAGE.delete(ip);
    }
  });
}, 60 * 60 * 1000); 

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let { id } = params;
    
   
    const forwarded = request.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get("x-real-ip") ||
                     request.ip ||
                     "unknown";
    
   
    if (!canCountView(clientIp, id)) {
      return NextResponse.json(
        { message: "View already counted recently", counted: false },
        { status: 200 }
      );
    }

    const supabase = createServerClient();
    
    try {
     
      const { data: center, error: fetchError } = await supabase
        .from("health_centers")
        .select("id, view_count")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (fetchError || !center) {
        return NextResponse.json(
          { error: "Centre non trouvé" },
          { status: 404 }
        );
      }

 
      const { error: updateError } = await supabaseAdmin
        .from("health_centers")
        .update({ view_count: (center.view_count || 0) + 1 })
        .eq("id", center.id);

      if (updateError) {
      
        return NextResponse.json(
          { error: "Erreur lors de la mise à jour" },
          { status: 500 }
        );
      }


      return NextResponse.json({ 
        message: "Vue comptée avec succès", 
        counted: true,
        newCount: (center.view_count || 0) + 1
      });

    } catch (error) {
   
      return NextResponse.json(
        { error: "Erreur de base de données" },
        { status: 500 }
      );
    }

  } catch (error) {
    
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}