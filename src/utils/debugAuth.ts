// Debug utilities for authentication issues
import { supabase } from '@/integrations/supabase/client';

export const debugUserSession = async () => {
  try {
    console.log('=== DEBUG SESSION ===');
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session Error:', sessionError);
    console.log('Session Data:', session);
    
    if (session?.user) {
      console.log('User ID:', session.user.id);
      console.log('User Email:', session.user.email);
      console.log('User Metadata:', session.user.user_metadata);
      console.log('App Metadata:', session.user.app_metadata);
      
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      console.log('Profile Error:', profileError);
      console.log('Profile Data:', profile);
      
      // Test a simple query to check RLS
      const { data: testClients, error: clientsError } = await supabase
        .from('clients')
        .select('count(*)')
        .eq('userId', session.user.id);
        
      console.log('Clients Query Error:', clientsError);
      console.log('Clients Count:', testClients);
      
      // Check if there are any policies blocking access
      const { data: allClients, error: allClientsError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);
        
      console.log('All Clients Error:', allClientsError);
      console.log('All Clients (first):', allClients);
    }
    
    console.log('=== END DEBUG SESSION ===');
  } catch (error) {
    console.error('Debug error:', error);
  }
};

export const compareUserSessions = async () => {
  // Store session info to compare between accounts
  const sessionInfo = {
    timestamp: new Date().toISOString(),
    userId: null as string | null,
    email: null as string | null,
    metadata: null as any,
    profileData: null as any,
    dataCount: {
      clients: 0,
      cases: 0,
      tasks: 0,
      attachments: 0,
      judicialProcesses: 0,
      petitions: 0
    }
  };
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      sessionInfo.userId = session.user.id;
      sessionInfo.email = session.user.email;
      sessionInfo.metadata = session.user.user_metadata;
      
      // Get profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      sessionInfo.profileData = profile;
      
      // Get data counts
      const clientsResult = await supabase.from('clients').select('id').eq('userId', session.user.id);
      const casesResult = await supabase.from('cases').select('id').eq('userId', session.user.id);
      const tasksResult = await supabase.from('tasks').select('id').eq('userId', session.user.id);
      const attachmentsResult = await supabase.from('attachments').select('id').eq('userId', session.user.id);
      const judicialProcessesResult = await supabase.from('judicial_processes').select('id').eq('userId', session.user.id);
      const petitionsResult = await supabase.from('petitions').select('id').eq('userId', session.user.id);
      
      sessionInfo.dataCount = {
        clients: clientsResult.data?.length || 0,
        cases: casesResult.data?.length || 0,
        tasks: tasksResult.data?.length || 0,
        attachments: attachmentsResult.data?.length || 0,
        judicialProcesses: judicialProcessesResult.data?.length || 0,
        petitions: petitionsResult.data?.length || 0
      };
    }
    
    console.log('=== SESSION COMPARISON ===');
    console.log(JSON.stringify(sessionInfo, null, 2));
    
    // Store in localStorage for comparison
    const previousSessions = JSON.parse(localStorage.getItem('praxis-debug-sessions') || '[]');
    previousSessions.push(sessionInfo);
    localStorage.setItem('praxis-debug-sessions', JSON.stringify(previousSessions.slice(-5))); // Keep last 5
    
    console.log('Previous sessions:', previousSessions);
    
  } catch (error) {
    console.error('Error in session comparison:', error);
  }
};