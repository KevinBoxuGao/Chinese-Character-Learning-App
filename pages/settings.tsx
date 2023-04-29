import {useContext} from 'react';
import { useSession } from '@supabase/auth-helpers-react'
import Page from '../components/page.tsx';
import Account from '../components/account.tsx';
import {ProfileContext} from '../context/profile.tsx';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

const Profile = () => {
  const session = useSession()
  const {profile, setProfile} = useContext(ProfileContext);
  
  return (
    <Page> 
      <Account session={session} profile={profile} setProfile={setProfile}/>
    </Page> 
  )
}

export const getServerSideProps = async (context) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(context)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
  } 
  return {
    props: {
      initialSession: session
    }
  }
};

export default Profile