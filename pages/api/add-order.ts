// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, OrderItem } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOption } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function addOrder(
  userId: string,
  items: Omit<OrderItem, 'id'>[],
  orderInfo?: { receiver?: string; address?: string; phoneNumber?: string }
) {
  try {
    let orderItemIds = [];

    for (const item of items) {
      const orderItem = await prisma.orderItem.create({
        data: {
          ...item,
        },
      });
      console.log(`Created Id: ${orderItem.id}`);
      orderItemIds.push(orderItem.id);
    }
    console.log(JSON.stringify(orderItemIds));

    const orderItem = await prisma.orders.create({
      data: {
        userId,
        orderItemIds: orderItemIds.join(','),
        ...orderInfo,
        status: 0,
      },
    });
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
  const { items, orderInfo } = JSON.parse(req.body);
  if (session == null) {
    res.status(200).json({ items: [], message: `No Session` });
    return;
  }
  try {
    const wishlist = await addOrder(
      String(session.user?.name),
      items,
      orderInfo
    );
    res.status(200).json({ items: wishlist, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
