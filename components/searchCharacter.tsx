import {useContext, useEffect, useState} from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { ErrorNotification } from 'components/notifications.tsx';
import { Input, AutoComplete, Space} from 'antd';
import { useRouter } from 'next/router'
import { addPinyinAccent } from 'utils/index.tsx';
const { Search } = Input;

const SearchCharacter = () => {
    const router = useRouter()
    const supabase = useSupabaseClient();
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [options, setOptions] = useState<{ value: string }[]>([]);

    const getAutofillResults = async (value: string) => {
        let result = [];
        if(value.length < 1) {
            setOptions([])
            return
        }
        try {
            let { data, error, status } = await supabase
                .from('characters')
                .select('*')
                .eq('character', value)

            if (error && status !== 406) {
                throw error
            }         
            data.map((character) => (
                result.push({
                    value: character.character,
                    label: 
                    (<Space direction="horizontal">
                        <span>{character.character}</span>
                        <span>{addPinyinAccent(character.pinyin)}</span>
                    </Space>)
                })
            )) 
        } catch (error) {
            ErrorNotification(error.message)
            console.log(error)
        } 
        //fetch pinyin that is the same
        try {
            let { data, error, status } = await supabase
                .from('characters')
                .select('*')
                .like('pinyin', `%${value}%`).limit(5)

            if (error && status !== 406) {
                throw error
            }        
            data.map((character) => (
                result.push({
                    value: character.character,
                    label: 
                    (<Space direction="horizontal">
                        <span>{character.character}</span>
                        <span>{addPinyinAccent(character.pinyin)}</span>
                    </Space>)
                })
            )) 
        } catch (error) {
            ErrorNotification(error.message)
            console.log(error)
        } 
        setOptions(result)
    }
    const searchCharacter = async (value: string) => {
        if(value.length > 0) {
            router.push("/character/" + value)
        }
    }

    return (
        <AutoComplete options={options} onSearch={getAutofillResults} onSelect={searchCharacter}>
            <Search placeholder="input search text" enterButton loading={searchLoading} onSearch={searchCharacter}/>
        </AutoComplete>
    )    
}

export default SearchCharacter;