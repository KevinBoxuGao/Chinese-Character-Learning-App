import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { Database } from '../utils/database.types'
type Profiles = Database['public']['Tables']['profiles']['Row']

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

const openError = (error) => {
  notification.open({
    message: 'Error',
    description:
      error,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
}

export default function Account({ session, profile, setProfile }) {
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [full_name, setFullName] = useState(profile.full_name)
  const router = useRouter()

  useEffect(() => {
    setUsername(profile.username);
    setFullName(profile.full_name);
  }, [session, profile])

  async function updateProfile({
    username,
    full_name,
  }: {
    username: Profiles['username']
    website: Profiles['full_name']
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
      console.log(error)
    } finally {
      setLoading(false)
      console.log(session);
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
  )
}
    
  

/*
<div>
          <label htmlFor="email">Email</label>
          <input id="email" type="text" value={session.user.email} disabled />
        </div>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input
            id="full_name"
            type="text"
            value={full_name || ''}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
*/