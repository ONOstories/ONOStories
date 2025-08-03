import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BookOpen} from 'lucide-react';

export function EmailConfirmed() {
  // optional: avoid leaving a session in this pop-up tab
  useEffect(() => {
    supabase.auth.signOut({ scope: 'local' });
  }, []);

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ONOSTORIES
          </h1>
        </div>
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Your e-mail is verified!
      </h1>

      <p className="text-gray-700 mb-8 max-w-md text-center">
        You can now close this tab and sign in with your credentials.
      </p>

    </div>
  );
}
