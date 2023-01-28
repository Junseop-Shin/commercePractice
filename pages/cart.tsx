import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { CountControl } from '@components/CountControl';
import { IconRefresh, IconX } from '@tabler/icons';
import styled from '@emotion/styled';
import { Button } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { products, Cart, OrderItem } from '@prisma/client';
import { useRouter } from 'next/router';
import { CATEGORY_MAP } from 'constants/products';
import { ORDER_QUERY_KEY } from './my';

interface CartItemProps extends Cart {
  name: string;
  price: number;
  image_url: string;
}

export const CART_QUERY_KEY = '/api/get-cart';

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery<
    { items: CartItemProps[] },
    unknown,
    CartItemProps[]
  >([CART_QUERY_KEY], () =>
    fetch(CART_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.item)
  );

  const deliveryFee = data && data.length > 0 ? 5000 : 0;
  const discountCost = 0;

  const amount = useMemo(() => {
    if (data == null) {
      return 0;
    }
    return data
      .map((item) => item.amount)
      .reduce((prev, curr) => prev + curr, 0);
  }, [data]);

  const { mutate: addOrder } = useMutation<
    unknown,
    unknown,
    Omit<OrderItem, 'id'>[],
    any
  >(
    (items) =>
      fetch('api/add-order', {
        method: 'POST',
        body: JSON.stringify({ items }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: () => {
        queryClient.invalidateQueries([ORDER_QUERY_KEY]);
      },
      onSuccess: () => {
        router.push('/my');
      },
    }
  );

  const handleOrder = () => {
    if (data == null) {
      return;
    }
    addOrder(
      data.map((cart) => ({
        productId: cart.productId,
        quantity: cart.quantity,
        price: cart.price,
        amount: cart.amount,
      }))
    );
    alert('장바구니 주문');
  };

  const { data: products } = useQuery<
    { items: products[] },
    unknown,
    products[]
  >(
    [`/api/get-products?skip=0&take=3`],
    () => fetch('/api/get-products?skip=0&take=3').then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  );

  return (
    <div>
      <span className="text-2xl mb-3">Cart ({data ? data.length : 0})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data ? (
            data.length > 0 ? (
              data.map((item, idx) => <CartItem key={idx} {...item} />)
            ) : (
              <div>장바구니가 비어있습니다.</div>
            )
          ) : (
            <div>불러오는 중입니다.</div>
          )}
        </div>
        <div className="px-4">
          <div
            className="flex flex-col p-4 space-y-4"
            style={{ minWidth: 300, border: '1px solid grey' }}
          >
            <div>Info</div>
            <Row>
              <span>금액</span>
              <span>{amount.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span>배송비</span>
              <span>{deliveryFee.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span>할인 금액</span>
              <span>{discountCost.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span className="font-semibold">결제 금액</span>
              <span className="font-semibold text-red-500">
                {(amount + deliveryFee - discountCost).toLocaleString('ko-kr')}{' '}
                원
              </span>
            </Row>
            <Button
              style={{ backgroundColor: 'black' }}
              radius="xl"
              size="md"
              styles={{
                root: { height: 48 },
              }}
              onClick={handleOrder}
            >
              구매하기
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-32">
        <p>추천 상품</p>
        {products && (
          <div className="grid grid-cols-3 gap-5">
            {products.map((item) => (
              <div
                key={item.id}
                style={{ maxWidth: 310 }}
                onClick={() => router.push(`/products/${item.id}`)}
              >
                <Image
                  className="rounded"
                  alt={item.name}
                  src={item.image_url ?? ''}
                  width={310}
                  height={390}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk0QYAADkAMfA9tJ0AAAAASUVORK5CYII="
                />
                <div className="flex">
                  <span>{item.name}</span>
                  <span className="ml-auto">
                    {item.price.toLocaleString('ko-KR')}원
                  </span>
                </div>
                <span className="text-zinc-400">
                  {CATEGORY_MAP[item.category_id + 1]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CartItem = (props: CartItemProps) => {
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [amount, setAmount] = useState<number>(props.amount);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price);
    }
  }, [quantity, props.price]);

  const { mutate: updateCart } = useMutation<unknown, unknown, Cart, any>(
    (item) =>
      fetch('api/update-cart', {
        method: 'POST',
        body: JSON.stringify({ item }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: async (item) => {
        await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEY] });

        // Snapshot the previous value
        const previous = queryClient.getQueryData([CART_QUERY_KEY]);

        // Optimistically update to the new value
        queryClient.setQueryData<Cart[]>([CART_QUERY_KEY], (old) =>
          old?.filter((c) => c.id !== item.id).concat(item)
        );

        // Return a context object with the snapshotted value
        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([CART_QUERY_KEY], context.previous);
      },
      onSuccess: () => {
        queryClient.invalidateQueries([CART_QUERY_KEY]);
      },
    }
  );

  const { mutate: deleteCart } = useMutation<unknown, unknown, number, any>(
    (id) =>
      fetch('api/delete-cart', {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEY] });

        // Snapshot the previous value
        const previous = queryClient.getQueryData([CART_QUERY_KEY]);

        // Optimistically update to the new value
        queryClient.setQueryData<Cart[]>([CART_QUERY_KEY], (old) =>
          old?.filter((c) => c.id !== id)
        );

        // Return a context object with the snapshotted value
        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([CART_QUERY_KEY], context.previous);
      },
      onSuccess: () => {
        queryClient.invalidateQueries([CART_QUERY_KEY]);
      },
    }
  );

  const handleUpdate = () => {
    if (quantity == null) {
      alert('최소 수량을 선택하세요');
      return;
    }
    updateCart({
      ...props,
      quantity: quantity,
      amount: props.price * quantity,
    });
  };

  const handleDelete = () => {
    deleteCart(props.id);
    alert(`장바구니에서 ${props.name} 제거`);
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
          <IconRefresh onClick={handleUpdate} />
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')}원</span>
        <IconX onClick={handleDelete} />
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
