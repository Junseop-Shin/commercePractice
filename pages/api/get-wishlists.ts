// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import { authOption } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function getWishlist(userId: string) {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: userId,
      },
    });

    const productIds = wishlist?.productIds
      .split(',')
      .map((item) => Number(item));
    if (productIds && productIds.length > 0) {
      const response = await prisma.products.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });
      console.log(response);
      return response;
    }
    return [];
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
  const session = await unstable_getServerSession(req, res, authOption);
  if (session == null) {
    res.status(200).json({ items: [], message: `No Session` });
    return;
  }
  try {
    const wishlist = await getWishlist(String(session.id));
    res.status(200).json({ items: wishlist, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
