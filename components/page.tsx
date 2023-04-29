import {useContext, useEffect } from 'react';
import { useSession, useUser, useSupabaseClient} from '@supabase/auth-helpers-react'
import { Layout, Menu, theme, notification } from 'antd';
const { Header, Content} = Layout;
import {ProfileContext} from 'context/profile.tsx';
import Nav from 'components/nav.tsx';


const openError = (error: string) => {
  notification.open({
    message: 'Error',
    description:
      error,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
}

const Page = ({ children, isProtected }: { children: ReactNode, isProtected: bool }) => {
    const supabase = useSupabaseClient();
    const session = useSession();   
    const {token: { colorPrimary, colorInfo }} = theme.useToken();
    const {profile, setProfile} = useContext(ProfileContext);
    const user = useUser()

    useEffect(() => {
      async function getProfile() {
        if(session) {
          try {
            if (!user) throw new Error('No user')
    
            let { data, error, status } = await supabase
              .from('profiles')
              .select(`username, full_name`)
              .eq('id', user.id)
              .single()
    
            if (error && status !== 406) {
              throw error
            }
    
            if (data) {
                setProfile({"username": data.username, "full_name": data.full_name})
            }
          } catch (error) {
              openError(error.message);
          } 
        } 
      }
      getProfile();
    }, [session, user, supabase, setProfile]);

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Nav session={session} profile={profile}/>
            <Content style={{padding: '1rem 2rem'}}>
            {children}
            </Content>
        </Layout>
    );
}

/*
<Nav session={session} profile={profile}/>
*/

export default Page;