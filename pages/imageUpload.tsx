import AutoSizeImage from 'components/AutoSizeImage';
import Button from '@components/Button';
import styled from '@emotion/styled';
import Image from 'next/image';
import { useRef, useState } from 'react';

export default function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState('');

  const handleUpload = () => {
    if (inputRef.current && inputRef.current.files) {
      const fd = new FormData();

      fd.append(
        'image',
        inputRef.current.files[0],
        inputRef.current.files[0].name
      );

      // 이미지 호스팅 서비스 url
      fetch('', {
        method: 'POST',
        body: fd,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setImage(data.data.image.url);
        })
        .catch((error) => console.log(error));
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" />
      <Button onClick={handleUpload}>업로드</Button>
      {image !== '' && <AutoSizeImage src={image} />}
    </div>
  );
}
