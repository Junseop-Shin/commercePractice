import React, { useCallback, useEffect, useState } from 'react';
import { products, categories } from '@prisma/client';
import Image from 'next/image';
import { Input, Pagination, SegmentedControl, Select } from '@mantine/core';
import { CATEGORY_MAP, FILTERS, TAKE } from 'constants/products';
import { IconSearch } from '@tabler/icons';
import useDebounce from 'useDebounce';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [activePage, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('-1');
  const [selectedFilter, setFilter] = useState<string | null>(FILTERS[0].value);
  const [keyword, setKeyword] = useState<string>('');

  const { data: categories } = useQuery<
    { items: categories[] },
    unknown,
    categories[]
  >(
    ['/api/get-categories'],
    () => fetch('/api/get-categories').then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  );

  const debouncedValue = useDebounce(keyword);

  const { data: total } = useQuery<{ items: number }, unknown, number>(
    [
      `/api/get-products-count?category=${selectedCategory}&contains=${debouncedValue}`,
    ],
    () =>
      fetch(
        `/api/get-products-count?category=${selectedCategory}&contains=${debouncedValue}`
      ).then((res) => res.json()),
    {
      select: (data) => Math.ceil(data.items / TAKE),
    }
  );

  // useEffect(() => {
  //   const skip = TAKE * (activePage - 1);
  //   fetch(
  //     `/api/get-products?skip=${skip}&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedValue}`
  //   ).then((res) => res.json().then((data) => setProducts(data.items)));
  // }, [activePage, selectedCategory, selectedFilter, debouncedValue]);

  const { data: products } = useQuery<
    { items: products[] },
    unknown,
    products[]
  >(
    [
      `/api/get-products?skip=${
        TAKE * (activePage - 1)
      }&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedValue}`,
    ],
    () =>
      fetch(
        `/api/get-products?skip=${
          TAKE * (activePage - 1)
        }&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedValue}`
      ).then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  );

  const changeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  return (
    <div className="mt-36 mb-36">
      {categories && (
        <div className="mb-4 flex">
          <SegmentedControl
            value={selectedCategory}
            onChange={setSelectedCategory}
            data={[
              { label: 'ALL', value: '-1' },
              ...categories.map((item) => ({
                label: item.name,
                value: String(item.id),
              })),
            ]}
            color="dark"
          />
          <div className="m-auto w-28">
            <Input
              icon={<IconSearch />}
              placeholder="Search"
              value={keyword}
              onChange={changeKeyword}
            />
          </div>
          <div className="ml-auto mh-auto w-28">
            <Select
              value={selectedFilter}
              onChange={setFilter}
              data={FILTERS}
            ></Select>
          </div>
        </div>
      )}
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
      <div className="w-full flex mt-5">
        {total && (
          <Pagination
            className="m-auto"
            page={activePage}
            onChange={setPage}
            total={total}
          />
        )}
      </div>
    </div>
  );
}
