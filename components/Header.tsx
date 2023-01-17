import { IconHome, IconShoppingCart, IconUser } from '@tabler/icons';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className="mt-12 mb-12">
      <div className="flex w-full h-50 items-center">
        <IconHome onClick={() => router.push('/')} />
        <span className="m-auto" />
        <IconShoppingCart
          className="mr-4"
          onClick={() => router.push('/cart')}
        />
        {session ? (
          <Image
            onClick={() => router.push('/auth/login')}
            src={session.user?.image!}
            width={30}
            height={30}
            style={{ borderRadius: '50%' }}
            alt="profile"
          />
        ) : (
          <IconUser onClick={() => router.push('/auth/login')} />
        )}
      </div>
    </div>
  );
}
