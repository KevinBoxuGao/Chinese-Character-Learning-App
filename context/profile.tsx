import { createContext } from 'react'
export const ProfileContext = createContext({
    profile: {
      username: null,
      full_name: null
    },
    updateProfile: (profile) => {}
})