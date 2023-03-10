// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOption } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function getWishlist(userId: string) {
  try {
    const response = await prisma.wishlist.findUnique({
      where: {
        userId: userId,
      },
    });
    console.log(response);
    return response?.productIds.split(',');
  } catch (error) {
    console.error(error);
  }
}
type Data = {
  items?: any;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerSession(req, res, authOption);
  if (session == null) {
    res.status(200).json({ items: [], message: `No Session` });
    return;
  }
  try {
    const wishlist = await getWishlist(String(session.user?.name));
    res.status(200).json({ items: wishlist, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
