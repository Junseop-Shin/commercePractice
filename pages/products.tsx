import Carousel from 'nuka-carousel/lib/carousel';
import Image from 'next/image';
import { useState } from 'react';

const images = [
  {
    original: 'https://picsum.photos/id/1018/1000/600/',
    thumbnail: 'https://picsum.photos/id/1018/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1015/1000/600/',
    thumbnail: 'https://picsum.photos/id/1015/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1016/1000/600/',
    thumbnail: 'https://picsum.photos/id/1016/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1013/1000/600/',
    thumbnail: 'https://picsum.photos/id/1013/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1019/1000/600/',
    thumbnail: 'https://picsum.photos/id/1019/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1011/1000/600/',
    thumbnail: 'https://picsum.photos/id/1011/250/150/',
  },
];

export default function Products() {
  const [index, setIndex] = useState(0);
  return (
    <>
      <Carousel animation="fade" autoplay withoutControls slideIndex={index}>
        {images.map((image) => (
          <Image
            key={image.original}
            src={image.original}
            alt="image"
            width={1000}
            height={600}
          />
        ))}
      </Carousel>
      <div style={{ display: 'flex' }}>
        {images.map((image, idx) => (
          <Image
            onClick={() => {
              setIndex(idx);
            }}
            key={idx}
            src={image.original}
            alt="image"
            width={100}
            height={60}
          />
        ))}
      </div>
    </>
  );
}
