import styled from '@emotion/styled';
import Image from 'next/image';

export default function AutoSizeImage({
  src,
  size = 500,
}: {
  src: string;
  size?: number;
}) {
  return (
    <AutoSizeImageWrapper size={size}>
      <Image src={src} alt="" layout="fill" objectFit="contain" />
    </AutoSizeImageWrapper>
  );
}

const AutoSizeImageWrapper = styled.div<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  position: relative;
`;
