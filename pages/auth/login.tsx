import GoogleLogin from '@components/GoogleLogin';
import { Flex } from '@mantine/core';

export default function Login() {
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GoogleLogin />
    </div>
  );
}
