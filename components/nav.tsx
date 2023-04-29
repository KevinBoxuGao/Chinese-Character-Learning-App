import { useState, useEffect, useContext } from 'react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {Avatar, Layout, theme, Typography, Menu, Modal, Button, Dropdown, Space} from 'antd';
const { Header } = Layout;
const { Title } = Typography;

import {ProfileContext} from 'context/profile.tsx';

export default function Nav({ session, profile }: { session: Session, profile: object }) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<string>(router.pathname);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const {token: { colorPrimary, colorInfo}} = theme.useToken();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.log('Error logging out:', error.message)
    } else {
      router.push('/')
    }
  } 

  const items: MenuProps['items'] = [
    {
      type: 'group',
      key: '1',
      label: (
        <>
          { profile.full_name ? (
            <>
              <Typography.Title level={3}>{profile.full_name == '' ? 'No Full Name' : profile.full_name}</Typography.Title>
              <Typography.Text>{user && user.email ? user.email : 'no email'}</Typography.Text>
            </>
          ) : 
            (<div>loading</div>)
          }
        </>
      )
    },
    {
      key: 'div1',
      type: 'divider',
    },
    {
      key: '3',
      label: (
        <Link href="/settings">Settings</Link>
      ),
    },
    {
      key: 'div2',
      type: 'divider',
    },
    {
      key: '4',
      label: (
        <div href="/logout" onClick={signOut}>Logout</div>
      ),
    },
  ];

  if(session) {
    return (
    <Header style={{paddingInline: '0%' }}>
      <Menu style={{padding: "0 2em"}} onClick={e =>setCurrentPage(e.key)} selectedKeys={[currentPage]} mode="horizontal">
        <Menu.Item key="/">
          <Link href="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/characters">
          <Link href="/characters">Characters</Link>
        </Menu.Item>
        <Menu.Item key="profile" style={{marginLeft: "auto"}}>
          {!session ? (
              <>
                <Button onClick={()=>setIsLoginOpen(true)} type="primary">Login</Button>
                <Modal title="Login" open={isLoginOpen} onOk={()=>setIsLoginOpen(false)} onCancel={()=>setIsLoginOpen(false)} maskClosable={false} footer={null}>
                  <Auth supabaseClient={supabase} 
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
                  theme="dark" />
                </Modal>
              </>
            ) : (
              <>
                { !user.email ? (<div>loading</div>) : 
                  (<Dropdown menu={{ items }} placement="bottomRight">  
                    <Avatar size="large" style={{ backgroundColor: colorPrimary }}>{profile.full_name && profile.full_name != '' ? profile.full_name[0] : user.email[0].toUpperCase()}</Avatar>
                  </Dropdown>)
                }
              </>
          )}
        </Menu.Item>
      </Menu>
    </Header>)
  } 

  return (
    <Header style={{paddingInline: '0%' }}>
      <Menu style={{padding: "0 2em"}} mode="horizontal">
        <Menu.Item key="/">
          <Link href="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="profile" style={{marginLeft: "auto"}}>
          <Button onClick={()=>router.push("/login")} type="primary">Login</Button>
        </Menu.Item>
      </Menu>
    </Header>
  );
}


