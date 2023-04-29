import {useEffect, useState} from 'react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useSession, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Typography, Carousel, Card, Space, Image, Col, Row, ConfigProvider, theme } from 'antd';
import Page from 'components/page.tsx';
import { useRouter } from 'next/router'

const Landing = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const user = useUser()
  const router = useRouter()

  useEffect(()=> {
    if(session) {
      router.push('/home')
    }
  }, [session, router])
  
  

  return (
    <Page>
      <Carousel effect="fade" style={{paddingBottom: "40px"}} autoplay>
        <Space align="center">
          <Row align="center">
            <Col>
              <Typography.Title align="center" level={2}>Practice and Learn Chinese Characters</Typography.Title>
              <Typography.Paragraph align="center">  
                Learn Chinese Characters with the help of a spaced repetition algorithm.
              </Typography.Paragraph>
            </Col>
          </Row>
          <Row align="center">
            <Col xs={24} sm={24} md={24} lg={18} xl={12}>
              <Image src="/landing1.gif" alt="gif of user using chinese characters and studying them" preview={false}/>
            </Col>
          </Row>
        </Space>
        <Space align="center">
          <Row align="center">
            <Col>
              <Typography.Title align="center" level={2}>Thousands of Characters</Typography.Title>
              <Typography.Paragraph align="center">  
              Pick from thousands of characters and learn them with the help of a spaced repetition algorithm. 
              </Typography.Paragraph>
            </Col>
          </Row>
          <Row align="center">
            <Col xs={24} sm={24} md={24} lg={18} xl={12}>
              <Image src="/landing2.gif" alt="gif of user using chinese characters and studying them" preview={false}/>
            </Col>
          </Row>
        </Space>
      </Carousel>
    </Page> 
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

export default Landing;