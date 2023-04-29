import { useState, createContext, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import {ConfigProvider, theme} from 'antd'
import 'antd/dist/reset.css';
import '../styles/globals.css';
import {ProfileContext} from '../context/profile.tsx';


function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session,
}>) {
  const [profile, setProfile] = useState({"username": null, "full_name": null});
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <ConfigProvider theme={{
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        token: {
          "colorPrimary": "#006aff",
        },
      }}>
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
          <ProfileContext.Provider value={{profile, setProfile}}>
            <Component {...pageProps} />
          </ProfileContext.Provider>
        </SessionContextProvider>
    </ConfigProvider> 
  )
}
export default MyApp