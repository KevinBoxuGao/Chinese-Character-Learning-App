import {useContext, useEffect, useState} from 'react';
import { useSession, useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { Typography, Space, Input, Button } from 'antd';
const { Search } = Input;
import Page from '../../components/Page'
import { processWords } from '../../utils/index.tsx'
import { ErrorNotification, SuccessNotification } from '../../components/notifications.tsx'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import SearchCharacter from '../../components/searchCharacter.tsx';

const Character = ({initialSession, cardAddedDefault, meanings, searchResults}) => {
  const router = useRouter()
  const { id } = router.query
  //const user = useUser()
  const supabase = useSupabaseClient();
  const [searchLoading, setSearchLoading] = useState(false);
  //const [searchResults, setSearchResults] = useState(null);
  //const [meanings, setMeanings] = useState([]);
  const [cardAdded, setCardAdded] = useState(cardAddedDefault);

  /*useEffect (() => {
    if (id) {
      searchCharacter(id)
    }
  }, [id])*/

  /*useEffect (() => {
    if (searchResults && searchResults.length > 0) {
      let result = processWords(searchResults[0].pinyin, searchResults[0].english_meaning)
      setMeanings(result)
    }
  }, [searchResults])*/

  /*const searchCharacter = async (value: string) => {
    setSearchLoading(true);
    try {
        let { data, error, status } = await supabase
            .from('characters')
            .select('*')
            .eq('character', value)

        if (error && status !== 406) {
            throw error
        }         
        setSearchResults(data);
        if(data && data.length > 0) {
          let card = await supabase
          .from('cards')
          .select(`character_serial, user_id, card_type`)
          .eq('user_id', user.id)
          .eq('card_type', 'characters')
          .eq('character_serial', data[0].character_serial)
          if (card.error && card.status !== 406) {
            throw card.error
          }  
          if(card.data && card.data.length > 0) {
            setCardAdded(true)
          } else {
            setCardAdded(false)
          }
        }
    } catch (error) {
        ErrorNotification(error.message)
    } 

    setSearchLoading(false);
  }*/

  const searchHandler = (value: string) => {
    if(value.length > 0) {
      router.push(`/character/${value}`)
    }
  }

  const addCard = () => { 
    //console.log(searchResults[0])
    supabase
      .from('cards')
      .upsert({ "character_serial" : searchResults[0].character_serial, "card_type" : "characters", "user_id" : initialSession.user.id}, {onConflict: 'character_serial, user_id' })
      .select()
      .then(({ data, error }) => {
        //console.log(data, error)
        SuccessNotification("Card added successfully")
        setCardAdded(true)
      })
  }

  return (
    <Page>
      <Space direction="vertical">
        <SearchCharacter />
        {searchResults && searchResults.length > 0 && <Typography.Title level={3}>{searchResults[0].character}</Typography.Title>}
        <Typography.Title level={3}>Meanings</Typography.Title>
        {searchResults && searchResults.length == 0 && <Typography.Title level={3}>No results</Typography.Title>}
        {meanings.map((meaning) => {
          return (
            <Space key={meaning.pinyin} direction="vertical">
              <Typography.Title level={4}>{meaning.pinyin}</Typography.Title>
              <Space key={meaning.pinyin} direction="vertical">
                {meaning.english.map((english) => {
                  return (
                    <Typography key={english}>{english}</Typography>
                  )
                })}
              </Space>
            </Space>
          )
        })}
        {searchResults && searchResults.length != 0 && (<Button disabled={cardAdded} onClick={addCard}>Add Character</Button>)}
      </Space>
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

  if (!session)
    return {
      redirect: {
        destination: '/login',
        permanent: true,
      },
  }
  
  let cardAdded = false;
  let searchResults = [];
  let character = context.params.id;
  let user = session.user;

  try {
    let { data, error, status } = await supabase
        .from('characters')
        .select('*')
        .eq('character', character)
    if (error && status !== 406) {
        throw error
    }   
    if(data && data.length > 0) {
      let card = await supabase
      .from('cards')
      .select(`character_serial, user_id, card_type`)
      .eq('user_id', user.id)
      .eq('card_type', 'characters')
      .eq('character_serial', data[0].character_serial)
      if (card.error && card.status !== 406) {
        throw card.error
      }  
      if(card.data && card.data.length > 0) {
        cardAdded = true;
      }
    }
    searchResults = data;
  } catch (error) {
    ErrorNotification(error.message)
  } 

  let meanings = searchResults && searchResults.length > 0 ? processWords(searchResults[0].pinyin, searchResults[0].english_meaning) : [];
  console.log(processWords(searchResults[0].pinyin, searchResults[0].english_meaning))
  return {
    props: {
      initialSession: session,
      cardAddedDefault: cardAdded,
      meanings: meanings,
      searchResults: searchResults
    },
  }
};


/*

<Space direction="vertical">
        <Search placeholder="input search text" onSearch={searchHandler} enterButton={true} loading={searchLoading}/>
        {searchResults && searchResults.length == 0 && <Typography.Title level={3}>No results</Typography.Title>}
        <Space direction="vertical">
          <Typography.Title level={3}>Meanings</Typography.Title>
          {meanings.map((meaning)=> {
            <Space key={meaning} direction="vertical">
              <Typography.Title level={4}>{meaning.pinyin}</Typography.Title>
              {meaning.english.map((english) => {
                <Typography key={english}>english</Typography>
              })}
            </Space>
          })}
        </Space>
        {searchResults && searchResults.length != 0 && (<Button onClick={addCard}>Add Character</Button>)}
      </Space>
           
*/ 

export default Character

