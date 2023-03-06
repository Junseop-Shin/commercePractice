import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CountControl } from '@components/CountControl';
import { IconRefresh, IconX } from '@tabler/icons';
import styled from '@emotion/styled';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Orders, OrderItem } from '@prisma/client';
import { useRouter } from 'next/router';
import { Badge, Button } from '@mantine/core';
import { format } from 'date-fns';

export const ORDER_QUERY_KEY = '/api/get-order';

const ORDER_STATUS_MAP = [
  '주문취소',
  '주문대기',
  '결제대기',
  '결제완료',
  '배송대기',
  '배송중',
  '배송완료',
  '환불대기',
  '환불완료',
  '반품대기',
  '반품완료',
];

interface OrderItemDetail extends OrderItem {
  name: string;
  image_url: string;
}

interface OrderDetail extends Orders {
  orderItems: OrderItemDetail[];
}

export default function MyPage() {
  const router = useRouter();

  const { data } = useQuery<{ items: OrderDetail[] }, unknown, OrderDetail[]>(
    [ORDER_QUERY_KEY],
    () =>
      fetch(ORDER_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.item)
  );

  return (
    <div>
      <span className="text-2xl mb-3">
        주문 내역 ({data ? data.length : 0})
      </span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data ? (
            data.length > 0 ? (
              data.map((item, idx) => <DetailItem key={idx} {...item} />)
            ) : (
              <div>주문 내역이 없습니다.</div>
            )
          ) : (
            <div>불러오는 중입니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const DetailItem = (props: OrderDetail) => {
  const handlePayment = () => {
    // 결제 처리
  };

  const handleCancel = () => {
    // 취소 처리
  };

  return (
    <div
      className="w-full flex flex-col p-4 rounded-md"
      style={{ border: '1px solid grey' }}
    >
      <div className="flex">
        <Badge color={props.status === 0 ? 'red' : ''}>
          {ORDER_STATUS_MAP[props.status + 1]}
        </Badge>
        <IconX className="ml-auto" />
      </div>
      {props.orderItems.map((orderItem, idx) => (
        <Item key={idx} {...orderItem} status={props.status} />
      ))}
      <div className="flex mt-4">
        <div className="flex flex-col">
          <span className="mb-2">주문 정보</span>
          <span>받는 사람: {props.receiver ?? '입력 필요'}</span>
          <span>주소: {props.address ?? '입력 필요'}</span>
          <span>연락처: {props.phoneNumber ?? '입력 필요'}</span>
        </div>
        <div className="flex flex-col ml-auto mr-4 text-right">
          <span className="mb-2 font-semibold">
            합계 금액:{' '}
            <span className="text-red-500">
              {props.orderItems
                .map((item) => item.amount)
                .reduce((prev, curr) => prev + curr, 0)
                .toLocaleString('ko-kr')}
            </span>
          </span>
          <span className="text-zinc-400 mt-auto mb-auto">
            주문 일자:{' '}
            {format(new Date(props.createdAt), 'yyyy년 M월 d일 HH:mm:ss')}
          </span>
          <Button
            style={{ backgroundColor: 'black', color: 'white' }}
            onClick={handlePayment}
          >
            결제 처리
          </Button>
          <Button
            style={{ backgroundColor: 'red', color: 'white' }}
            onClick={handleCancel}
          >
            취소 처리
          </Button>
        </div>
      </div>
    </div>
  );
};

const Item = (props: OrderItemDetail & { status: number }) => {
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [amount, setAmount] = useState<number>(props.amount);
  const router = useRouter();
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price);
    }
  }, [quantity, props.price]);

  const handleComment = () => {
    router.push(`/comment/edit?orderItemId=${props.id}`);
  };

  return (
    <div className="w-full flex p-4" style={{ borderBottom: '1px solid grey' }}>
      <Image
        src={props.image_url}
        width={250}
        height={150}
        alt={props.name}
        onClick={() => router.push(`/products/${props.productId}`)}
      />
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">
          가격: {props.price.toLocaleString('ko-kr')}원
        </span>
        <div className="flex item-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={20} />
        </div>
      </div>
      <div className="flex flex-col ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')}원</span>
        {props.status === 5 && (
          <Button
            style={{
              backgroundColor: 'black',
              color: 'white',
              marginTop: 'auto',
            }}
            onClick={handleComment}
          >
            후기 작성
          </Button>
        )}
      </div>
    </div>
  );
};

const Row = styled.div`
  display: flex;
  * ~ * {
    margin-left: auto;
  }
`;
