import { supabase } from '@/lib/supabase';

// Configuration du gestionnaire d'authentification
const AUTH_CONFIG = {
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2 heures en millisecondes
  WARNING_TIME: 10 * 60 * 1000, // Avertir 10 minutes avant expiration
  CHECK_INTERVAL: 60 * 1000, // Vérifier toutes les minutes
  ADMIN_ROUTES: ['/admin'],
};

class AuthManager {
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private checkTimer: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private isWarningShown: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    
    supabase.auth.onAuthStateChange((event, session) => {

      
      if (event === 'SIGNED_IN' && session) {
        this.startSessionManager();
      } else if (event === 'SIGNED_OUT') {
        this.stopSessionManager();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        
        this.resetTimers();
      }
    });

    
    this.setupActivityListeners();
  }

  private setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      if (this.isWarningShown) {
        this.hideWarning();
        this.resetTimers();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  private startSessionManager() {
    this.stopSessionManager(); 
    this.lastActivity = Date.now();
    this.isWarningShown = false;

   
    this.checkTimer = setInterval(() => {
      this.checkSession();
    }, AUTH_CONFIG.CHECK_INTERVAL);

  
  }

  private stopSessionManager() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    
    this.hideWarning();
 
  }

  private async checkSession() {
    const now = Date.now();
    const inactiveTime = now - this.lastActivity;

    if (inactiveTime >= AUTH_CONFIG.SESSION_TIMEOUT) {
      
      await this.logout('Session expirée due à l\'inactivité');
      return;
    }

  
    const timeUntilExpiry = AUTH_CONFIG.SESSION_TIMEOUT - inactiveTime;
    if (timeUntilExpiry <= AUTH_CONFIG.WARNING_TIME && !this.isWarningShown) {
      this.showExpirationWarning(Math.ceil(timeUntilExpiry / 60000)); // Minutes restantes
    }


    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
     
        await this.logout('Session invalide');
      }
    } catch (error) {
      
    }
  }

  private showExpirationWarning(minutesLeft: number) {
    this.isWarningShown = true;
    

    const warningDiv = document.createElement('div');
    warningDiv.id = 'session-warning';
    warningDiv.className = 'fixed top-4 right-4 z-[10000] bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm';
    warningDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">
            Session bientôt expirée
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>Votre session expirera dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}. Bougez la souris pour rester connecté.</p>
          </div>
          <div class="mt-3">
            <button onclick="document.getElementById('session-warning').remove();" 
                    class="bg-yellow-100 text-yellow-800 rounded-md px-3 py-1 text-sm font-medium hover:bg-yellow-200">
              Compris
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(warningDiv);

    // Auto-remove après 10 secondes
    setTimeout(() => {
      this.hideWarning();
    }, 10000);
  }

  private hideWarning() {
    const warning = document.getElementById('session-warning');
    if (warning) {
      warning.remove();
    }
    this.isWarningShown = false;
  }

  private resetTimers() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
    
    this.lastActivity = Date.now();
    this.isWarningShown = false;
    this.hideWarning();
  }

  private async logout(reason: string) {
 
    
    try {
      await supabase.auth.signOut();
      
      
      const logoutDiv = document.createElement('div');
      logoutDiv.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50';
      logoutDiv.innerHTML = `
        <div class="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.93L13.732 4.242a2 2 0 00-3.464 0L3.34 16.07c-.77 1.263.192 2.93 1.732 2.93z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Session expirée</h3>
            <p class="text-sm text-gray-500 mb-4">${reason}</p>
            <button onclick="window.location.href='/login?redirectTo=' + encodeURIComponent(window.location.pathname)" 
                    class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90">
              Se reconnecter
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(logoutDiv);
   
      setTimeout(() => {
        window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
      }, 3000);
      
    } catch (error) {
      
     
      window.location.href = '/login';
    }
  }

  
  public extendSession() {
    this.lastActivity = Date.now();
    this.resetTimers();
  }

  public async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      return !!(profile && ['admin', 'super_admin', 'moderator'].includes(profile.role));
    } catch (error) {
     
      return false;
    }
  }
}


export const authManager = typeof window !== 'undefined' ? new AuthManager() : null;


export function useAuthManager() {
  return {
    extendSession: () => authManager?.extendSession(),
    checkAdminAccess: () => authManager?.checkAdminAccess() ?? Promise.resolve(false),
  };
}