/* Supabase Client Configuration & Sync Utility */

// Replace these placeholders with your actual Supabase project credentials
const SUPABASE_CONFIG = {
  url: 'https://mhrmeioajptosgjiqjaz.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

const SupabaseService = (() => {
  let supabaseClient = null;

  // Load Supabase script from CDN dynamically if not already loaded
  const initClient = () => {
    return new Promise((resolve) => {
      // Check if credentials are set (not defaults)
      const isConfigured = SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
                           SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
      
      if (!isConfigured) {
        // Fallback to Settings store if user entered it in UI
        try {
          const settings = JSON.parse(localStorage.getItem('settings') || '{}');
          if (settings.supabaseUrl && settings.supabaseKey) {
            SUPABASE_CONFIG.url = settings.supabaseUrl;
            SUPABASE_CONFIG.anonKey = settings.supabaseKey;
          } else {
            resolve(null);
            return;
          }
        } catch (e) {
          resolve(null);
          return;
        }
      }

      if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        resolve(supabaseClient);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => {
        if (window.supabase) {
          supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
          resolve(supabaseClient);
        } else {
          resolve(null);
        }
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  };

  // Convert js camelCase key to Postgres snake_case key
  const toSnakeCase = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    
    const result = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
    }
    return result;
  };

  // Convert Postgres snake_case key back to camelCase
  const toCamelCase = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    
    const result = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
      result[camelKey] = toCamelCase(obj[key]);
    }
    return result;
  };

  return {
    getClient: async () => {
      if (supabaseClient) return supabaseClient;
      return await initClient();
    },

    isReady: () => {
      return supabaseClient !== null;
    },

    // Background push sync to Supabase (Upserts)
    syncTable: async (tableName, jsDataList) => {
      try {
        const client = await SupabaseService.getClient();
        if (!client) return;

        // Map js properties to database columns (camelCase -> snake_case)
        const dbRows = jsDataList.map(item => {
          const snakeRow = toSnakeCase(item);
          // Handle specific renames / formatting
          if (tableName === 'emails' && snakeRow.to) {
            snakeRow.to_email = snakeRow.to;
            delete snakeRow.to;
          }
          return snakeRow;
        });

        // Perform bulk upsert
        const { error } = await client.from(tableName).upsert(dbRows);
        if (error) console.error(`Supabase sync error on table ${tableName}:`, error);
      } catch (e) {
        console.error(`Sync fail:`, e);
      }
    },

    // Retrieve database rows and update local storage cache
    pullTable: async (tableName) => {
      try {
        const client = await SupabaseService.getClient();
        if (!client) return null;

        const { data, error } = await client.from(tableName).select('*');
        if (error) {
          console.error(`Supabase fetch error for ${tableName}:`, error);
          return null;
        }

        if (data) {
          // Convert database snake_case back to camelCase
          const camelRows = data.map(row => {
            const jsRow = toCamelCase(row);
            if (tableName === 'emails' && jsRow.toEmail) {
              jsRow.to = jsRow.toEmail;
              delete jsRow.toEmail;
            }
            return jsRow;
          });
          return camelRows;
        }
      } catch (e) {
        console.error(`Pull fail:`, e);
      }
      return null;
    }
  };
})();
