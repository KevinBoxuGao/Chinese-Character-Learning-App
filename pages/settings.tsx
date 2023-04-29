import {useContext, useState, useEffect} from 'react';
import { useUser, useSupabaseClient, Session, useSession } from '@supabase/auth-helpers-react'
import Page from 'components/page.tsx';
import {ProfileContext} from 'context/profile.tsx';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import {Typography, Input, theme, Card, Button, Space, notification} from 'antd';
import { useRouter } from 'next/router'


const openNotification = () => {
  notification.open({
    message: 'Profile Updated',
    description:
      'Your profile has been updated successfully!',
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

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

const Profile = () => {
  const session = useSession()
  const {profile, setProfile} = useContext(ProfileContext);
  const supabase = useSupabaseClient()
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [full_name, setFullName] = useState(profile.full_name)
  const router = useRouter()

  useEffect(() => {
    setUsername(profile.username);
    setFullName(profile.full_name);
  }, [profile])

  async function updateProfile({
    username,
    full_name,
  }: {
    username
    website
  }) {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        username,
        full_name,
        updated_at: new Date().toISOString(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      openNotification();
      setProfile({"username": username, "full_name": full_name});
    } catch (error) {
      openError('Error updating the data!')
    } finally {
      setLoading(false)

    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.log('Error logging out:', error.message)
    } else {
      router.push('/')
    }
  }
  
  return (
    <Page> 
      <Card>
        {session ? (
          <Space direction="vertical">
            <Typography.Title level={3}>Profile Information</Typography.Title>
            <Space direction="vertical">
              <Input addonBefore="Email" value={session.user.email} disabled></Input>
              <Input addonBefore="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading}></Input>
              <Input addonBefore="Full Name" value={full_name} onChange={(e) => setFullName(e.target.value)} disabled={loading}></Input>
            </Space>
            <Space>
              <Button type="primary"
                onClick={() => updateProfile({ username, full_name })}
                disabled={loading}
                loading={loading}>
                {loading ? 'Loading' : 'Update'}
              </Button>
              <Button className="button block" onClick={signOut}>
                Sign Out
              </Button>
            </Space>
          </Space>
        ) : (
          <div>loading</div>
        )}
      </Card>
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