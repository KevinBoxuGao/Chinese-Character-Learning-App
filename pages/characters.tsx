import {useContext, useEffect, useState} from 'react';
import { useSession, useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import Page from 'components/page.tsx';
import { ErrorNotification } from 'components/notifications.tsx';
import SearchCharacter from 'components/searchCharacter.tsx';
import { Input, Space, Typography, Card, AutoComplete, Pagination, Col, Row, Table} from 'antd';
import { useRouter } from 'next/router'
const { Search } = Input;
import Link from 'next/link'
import { convertPinyin, convertEnglish } from 'utils/index.tsx';

const Characters = () => {
    const router = useRouter()
    const supabase = useSupabaseClient();
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [characterCount, setCharacterCount] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [sortingCategory, setSortingCategory] = useState('frequency');
    const [sortingOrder, setSortingOrder] = useState('descending');
    
    useEffect(() => {
        const getTopCharacters = async (currentPage, pageSize, sortingOrder, sortingCategory) => {
            let page = currentPage;
            setSearchLoading(true);
            try {
                let { data, error, status, count } = await supabase
                    .from('characters')
                    .select('*', { count: 'exact', head: true })
                    .order(sortingCategory, { ascending: sortingOrder == "ascending"})
                    .range((page-1)*pageSize, (page-1)*pageSize+pageSize-1)
    
                if (error && status !== 406) {
                    throw error
                }
                setCharacterCount(count)
            } catch (error) {
                ErrorNotification(error.message)
            }
    
            try {
                let { data, error, status, count } = await supabase
                    .from('characters')
                    .select('*')
                    .order(sortingCategory, { ascending: sortingOrder == "ascend"}) 
                    .range((page-1)*pageSize, (page-1)*pageSize+pageSize-1)
    
                if (error && status !== 406) {
                    throw error
                }
                setSearchResults(data)
            } catch (error) {
                ErrorNotification(error.message)
            }
            setSearchLoading(false);
        }
        getTopCharacters(currentPage, pageSize, sortingOrder, sortingCategory)
    }, [currentPage, pageSize, sortingOrder, sortingCategory, supabase ])

    useEffect(() => {
        if(searchResults && searchResults.length > 0) {
            setTableData(searchResults.map((character) => {
                return {
                    frequency: character.character_serial,
                    key: character.character,
                    character: character.character,
                    pinyin: convertPinyin(character.pinyin).join(', '),
                    english_meaning: convertEnglish(character.english_meaning).join(', ')
                }
            }))
        } else {
            setTableData([])
        }
    }, [searchResults])

    const onChange = (pagination, filters, sorter) => {
        setCurrentPage(pagination.current)
        console.log(sorter)
        if(sorter) {
            if(sorter.order) {
                setSortingOrder(sorter.order)
                setSortingCategory(sorter.field)   
            } else {
                setSortingOrder('descending')
                setSortingCategory('frequency')
            }       
        } 
    }

    const onShowSizeChange = (current: int, size: int) => {
        setPageSize(size)
    }

    const columns = [
        {
            title: 'Usage Rank',
            dataIndex: 'frequency',
            key: 'frequency',
            sorter: () => {
            },
            sortDirections: ['descend'],
        },
        {
            title: 'Character',
            dataIndex: 'character',
            key: 'character',
        },
        {
            title: 'Pinyin',
            dataIndex: 'pinyin',
            key: 'pinyin',
            sorter: () => {
            },
            sortDirections: ['ascend'],
        },
        {
            title: 'English',
            dataIndex: 'english_meaning',
            key: 'english_meaning',
            sorter: () => {
            },
            sortDirections: ['ascend'],
        }
    ]   



    return (
        <Page>
            <Space direction="vertical">
                <SearchCharacter/>
                <Space direction="vertical">
                    <Typography.Title level={3}>Top Characters</Typography.Title>
                    <Table 
                        loading={searchLoading} 
                        columns={columns} 
                        dataSource={tableData} 
                        onChange={onChange} 
                        onRow={(record, rowIndex) => {
                            return {
                              onClick: (event) => {
                                router.push('/character/' + record.character)
                              }, // click row
                            };
                        }}
                        pagination={{
                            pageSize: pageSize,
                            total: characterCount,
                            onChange: onChange,
                            onShowSizeChange: (current, size) => onShowSizeChange(current, size),
                            //onChange: (x) => onChange(x),
                            //onShowSizeChange: (x) => onShowSizeChange(x),
                            showQuickJumper: true
                        }}
                    />
                    {/*searchResults && searchResults.map((character) => {
                        return (
                            <Link key={character.character} href={"/character/" + character.character}>
                                <Card>
                                    <Row key={character.character}>
                                        <Col>
                                            <Typography.Title level={3}>{character.character}</Typography.Title>
                                        </Col>
                                    </Row>
                                </Card>
                            </Link>
                        )
                    })*/}
                </Space>
                {/*<Pagination defaultCurrent={1} current={page} onChange={onChange} pageSize={pageSize} total={characterCount} onShowSizeChange={onShowSizeChange} showQuickJumper/>*/}
            </Space>
        </Page>
    )    
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
      
    return {
      props: {
        initialSession: session,
      },
    }
};

export default Characters