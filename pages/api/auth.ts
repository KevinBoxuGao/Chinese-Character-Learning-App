// pages/api/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../utils/supabaseClient';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  supabaseClient.auth.api.setAuthCookie(req, res);
};

export default handler;