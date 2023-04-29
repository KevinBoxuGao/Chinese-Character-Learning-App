import {useEffect, useState} from 'react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { theme, Typography, Space, Row, Col, Card, Button, Spin, ConfigProvider} from 'antd';
import Page from '../components/page.tsx';
import Link from 'next/link';

const Home = ({initialSession, user, decks}) => {
  //const session = useSession();
  //const supabase = useSupabaseClient();
  //const [newCards, setNewCards] = useState(0);
  //const [dueCards, setDueCards] = useState(0);
  //const [loadingDeckCounts, setLoadingDeckCounts] = useState(false);

  /*/useEffect(()=> {
    console.log(decks)
  }, [decks])

  //useEffect (() => {
    //updateDeckCounts();
  //}, [session])

  /*const updateDeckCounts = async () => {
    setLoadingDeckCounts(true);
    if(session) {
      let { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
      
      if (error) {
        console.log(error)
        throw error
      }
      let newCards = 0;
      let dueCards = 0;
      data.forEach((card) => {
        if(new Date(card.due_date) <= new Date()) {
          if(card.New) {
            newCards++;
          } else {
            dueCards++;
          }
        }
      })
      setNewCards(newCards);
      setDueCards(dueCards);
    }
    setLoadingDeckCounts(false);
  }*/


  return (
    <Page>
      <Typography.Title>Study Today</Typography.Title>
      {decks.map((deck) => (
        <Card key={deck}>
          <Space direction="vertical">
            <Typography.Title level={3}>Characters</Typography.Title>
            <Space>
              <Typography.Text type="warning">{"New: " + deck.new}</Typography.Text>
              <Typography.Text type="danger">{"Due: " + deck.due}</Typography.Text>
            </Space>
            <Link href={"/deck/characters"}>
              <Button type="primary">Study</Button>
            </Link>
          </Space>
        </Card>
      ))}
    </Page> 
  );
}

export default Home;

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

  let decks = [];
  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('card_type', 'characters')
    .eq('user_id', session.user.id)
    .lte('due_date', 'now()')
  let newCards = 0;
  let dueCards = 0;
  data.forEach((card) => {
    if(new Date(card.due_date) <= new Date()) {
      if(card.New) {
        newCards++;
      } else {
        //console.log(new Date(card.due_date))
        //console.log(new Date())
        dueCards++;
      }
    }
  })


  let deck = {new: newCards, due: dueCards};
  decks.push(deck);
    
  return {
    props: {
      initialSession: session,
      user: session.user,
      decks: decks ?? [],
    },
  }
};