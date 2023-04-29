import {useContext, useEffect, useState, useCallback} from 'react';
import { useSession, useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/router'
import { Card, Typography, Button, Space, Spin, ConfigProvider } from 'antd';
import Page from '../../components/Page'  
import {ErrorNotification} from '../../components/notifications.tsx'
import {processWords} from '../../utils/index.tsx'
import Canvas from '../../components/canvas.tsx'

const Deck = () => {
  const router = useRouter()
  const { deck_id } = router.query
  const supabase = useSupabaseClient();
  const [searchLoading, setSearchLoading] = useState(false);
  const [reviewCards, setReviewCards] = useState([]);
  const [reviewCardMeanings, setReviewCardMeanings] = useState([]);
  const [isReviewed, setIsReviewed] = useState(false);

  const [againTime, setAgainTime] = useState("");
  const [hardTime, setHardTime] = useState("");
  const [goodTime, setGoodTime] = useState("");
  const [easyTime, setEasyTime] = useState("");
  const user = useUser()

  const getCharacterReviewCards = useCallback(async () => {
    setSearchLoading(true);
    try {
        let { data, error, status } = await supabase
        .from('cards')
        .select(`
        card_id,
        character_serial, 
        difficulty, 
        due_date, 
        date_last_reviewed,
        characters (
          character_serial,
          character,
          pinyin,
          english_meaning
        )
        `)
        .eq('user_id', user.id)
        .eq('card_type', 'characters')
        .lte('due_date', 'now()')
        .order('due_date', {ascending: true})

        if (error && status !== 406) {
            throw error
        }         
        setReviewCards(data)
    } catch (error) {
        ErrorNotification(error.message)
    } 
    
    setSearchLoading(false); 
  }, [user, supabase]);

  const getCardReviewTime = (card, response) => {
    let performance = 0;
    switch(response) {
      case "again":
        performance = 0;
        break;
      case "hard":
        performance = 0.5;
        break;
      case "good":
        performance = 0.7;
        break;
      case "easy":
        performance = 1;
        break;
    }
    let difficulty = card.difficulty;
    let isCorrect = performance >= 0.5;
    let daysBetweenReviews = (new Date(card.due_date).getTime() - new Date(card.date_last_reviewed).getTime()) / (1000 * 3600 * 24);
    let daysBetween = (Date.now() - new Date(card.date_last_reviewed).getTime()) / (1000 * 3600 * 24)
    let percentOverdue = isCorrect ? Math.min(2, daysBetween / daysBetweenReviews) : 1;
    difficulty += percentOverdue * 1/17 * (8-9*performance);
    difficulty = Math.min(Math.max(difficulty, 0), 1)
    let difficultyWeight = 3 - 1.7 * difficulty;
    daysBetweenReviews *= (isCorrect ? 1 + (difficultyWeight-1)*percentOverdue : 1/(1+3*difficulty))
    if(response == "again") {
      daysBetweenReviews = 1/86400;
    } else {
      daysBetweenReviews = daysBetweenReviews.toFixed(2)
    }
    if(daysBetweenReviews < 1) {
      daysBetweenReviews = 1
    }

    return {daysBetweenReviews: daysBetweenReviews, difficulty: difficulty.toFixed(2)};
  }


  const updateCard = async (card, response) => {
    let {daysBetweenReviews, difficulty} = getCardReviewTime(card, response)
    let date_last_reviewed = new Date()
    if(response == "again") {
      date_last_reviewed = card.date_last_reviewed
      daysBetweenReviews = 1/86400;
    }
    try {
      let { data, error, status } = await supabase
        .from('cards')
        .update({
          difficulty: difficulty,
          due_date: new Date(Date.now() + daysBetweenReviews * 24 * 60 * 60 * 1000),
          date_last_reviewed: date_last_reviewed, 
          New: false
        })
        .eq('card_id', card.card_id)
      if (error && status !== 406) {
        throw error
      }
      getCharacterReviewCards()
    } catch (error) {
      ErrorNotification(error.message)
    }
    setIsReviewed(false)
  }

  useEffect (() => {
    if (deck_id) {
      getCharacterReviewCards()
    }
  }, [deck_id, getCharacterReviewCards])

  useEffect (() => {
    const updateCardReviewTimes = async (card) => {
      setAgainTime(getCardReviewTime(card, "again").daysBetweenReviews)
      setEasyTime(getCardReviewTime(card, "easy").daysBetweenReviews)
      setGoodTime(getCardReviewTime(card, "good").daysBetweenReviews)
      setHardTime(getCardReviewTime(card, "hard").daysBetweenReviews)
    }
    if (reviewCards.length > 0) {
      updateCardReviewTimes(reviewCards[0])
      setReviewCardMeanings(processWords(reviewCards[0].characters.pinyin, reviewCards[0].characters.english_meaning))
    }
  }, [reviewCards, , setReviewCardMeanings])

  return (
    <Page>
      {searchLoading && <Spin size="large" />}

      {!searchLoading && 
      <>
        {!reviewCards || reviewCards.length === 0 && <Typography.Title level={3}>No cards to study</Typography.Title>}
        {reviewCards && reviewCards.length > 0 && 
          <Card>
            <Space direction="vertical">
            <Space direction="vertical">
              {reviewCardMeanings.map((meaning) => {
                return (
                  <Space key={meaning.pinyin} direction="vertical">
                    <Typography.Title level={3}>{meaning.pinyin}</Typography.Title>
                    <Space key={meaning.pinyin}>
                      {meaning.english.map((english) => {
                        return (
                          <Typography.Title level={4} key={english}>{english + ", "}</Typography.Title>
                        )
                      })}
                    </Space>
                  </Space>
                )
              })}
            </Space>
            <Canvas></Canvas>
            <Space direction="vertical">
              { isReviewed ? 
              <>
                {reviewCards && reviewCards.length > 0 && <Typography.Title level={3}>{reviewCards[0].characters.character}</Typography.Title>}
                <Space>
                  <Space direction="vertical">
                    <Typography.Title level={4} type="danger">{1 + " minute"}</Typography.Title> 
                    <Button danger type="primary" onClick={()=> updateCard(reviewCards[0], "again")}>Again</Button>  
                  </Space>
                  <Space direction="vertical">
                    <Typography.Title level={4} type="warning">{hardTime + " days"}</Typography.Title>
                    <ConfigProvider
                      theme={{
                        token: {
                          colorPrimary: '#faad14',
                        },
                      }}
                    >
                      <Button type="primary" onClick={() =>updateCard(reviewCards[0], "hard")}>Hard</Button>
                    </ConfigProvider>
                  </Space>
                  <Space direction="vertical">
                    <Typography.Title level={4} type="success">{goodTime + " days"}</Typography.Title>
                    <ConfigProvider
                      theme={{
                        token: {
                          colorPrimary: '#52c41a',
                        },
                      }}
                    >
                    <Button type="primary" onClick={()=> updateCard(reviewCards[0], "good")}>Good</Button>
                    </ConfigProvider>
                  </Space>
                  <Space direction="vertical">
                    <Typography.Title level={4}>{easyTime + " days"}</Typography.Title>
                    <Button onClick={()=> updateCard(reviewCards[0], "easy")}>Easy</Button>
                  </Space>
                </Space>
              </> :
                <Button onClick={() => setIsReviewed(true)}>Flip</Button>
              }
            </Space>
            </Space>
          </Card>     
        }
      </>
      }
    </Page>
  );
}

export default Deck

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
      initialSession: session,
    },
  }
};