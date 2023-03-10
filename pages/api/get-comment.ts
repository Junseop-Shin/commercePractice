// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOption } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function getComment(userId: string, orderItemId: number) {
  try {
    const response = await prisma.comment.findUnique({
      where: {
        orderItemId: orderItemId,
      },
    });
    console.log(response);

    if (response?.userId === userId) {
      return response;
    }
    return { message: 'userId is not matched' };
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
  const { orderItemId } = req.query;
  const session = await getServerSession(req, res, authOption);
  if (session == null || !session.user?.name) {
    res.status(200).json({ items: [], message: `No Session` });
    return;
  }
  if (orderItemId == null) {
    res.status(200).json({ items: [], message: `No OrderItemId` });
    return;
  }
  try {
    const wishlist = await getComment(
      String(session.user?.name),
      Number(orderItemId)
    );
    res.status(200).json({ items: wishlist, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
