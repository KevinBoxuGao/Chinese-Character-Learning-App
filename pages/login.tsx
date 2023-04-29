import {useEffect, useState} from 'react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Page from '../components/page.tsx';
import { useRouter } from 'next/router'
import {Avatar, Layout, theme, Typography, Menu, Modal, Button, Dropdown, Space} from 'antd';
const { Header, Content} = Layout;
import Link from 'next/link'

const Login = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter()

  useEffect(()=> {
    if(session) {
      router.push('/home')
    }
  }, [session])

  return (
    <Layout style={{minHeight: '100vh'}}>
        <Header style={{paddingInline: '0%' }}>
            <Menu mode="horizontal"  style={{padding: "0 2em"}}>
                <Menu.Item key="/">
                    <Link href="/">Home</Link>
                </Menu.Item>
            </Menu>
        </Header>
        <Content style={{padding: '1rem 2rem'}}>
          <Auth 
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
                default: {
                colors: {
                    brand: '#006aff',
                    brandAccent: '#006aff',
                },
                },
                fonts: {
                bodyFontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                'Noto Color Emoji'`,
                buttonFontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                'Noto Color Emoji'`,
                inputFontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                'Noto Color Emoji'`,
                labelFontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                'Noto Color Emoji'`,
                },
            },
          }}
          theme="dark" 
          /> 
        </Content>
    </Layout>
  );
}

export const getServerSideProps = async (context) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(context)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session)
    return {
      redirect: {
        destination: '/home',
        permanent: false,
      },
  } 

  return {
    props: {
      initialSession: session,
    },
  }
};

export default Login;