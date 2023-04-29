import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    try {
    const { data: characters, error } = await supabase
        .from('characters')
        .select('*')
        .order('frequency', {ascending: false})
        .limit(10);

    if (error) {
        throw error;
    }

    res.status(200).json(characters);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
    }
};

export default handler;