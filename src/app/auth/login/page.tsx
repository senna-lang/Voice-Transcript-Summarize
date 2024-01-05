'use client';
import React from 'react';
import { TextInput, Button, Group, Box, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { userState } from '@/app/atoms/user';

const Login = () => {
  const [userId, setUserId] = useRecoilState(userIdState);
  const [user, setUser] = useRecoilState(userState);

  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: value =>
        /^\S+@\S+$/.test(value) ? null : '無効なメールアドレスです',
      password: value =>
        value.length < 8 ? 'パスワードは８文字以上で設定してください。' : null,
    },
  });

  return (
    <div className=" h-screen flex flex-col items-center justify-center bg-dark-mode">
      <h1 className=" text-white text-2xl mb-14 font-bold">VTSへログイン</h1>
      <Box maw={400} className="p-8 w-96 bg-blue-600 rounded-md">
        <form
          onSubmit={form.onSubmit(async values => {
            await signInWithEmailAndPassword(
              auth,
              values.email,
              values.password
            )
              .then(userCredential => {
                const unsubscribed = onAuthStateChanged(auth, newUser => {
                  setUser(newUser?.email ?? null);
                  setUserId(newUser?.uid ?? null);
                  router.push('/');
                });
                return () => {
                  unsubscribed();
                };
              })
              .catch(error => {
                if (error.code === 'auth/invalid-credential') {
                  alert('メールアドレス、またはパスワードが間違っています。');
                } else {
                  alert(error.message);
                }
              });
          })}
        >
          <TextInput
            withAsterisk
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="set your password"
            {...form.getInputProps('password')}
          />
          <div className="flex justify-between">
            <Group justify="flex-end" mt="md">
              <Button type="submit" className=" bg-slate-500">
                ログイン
              </Button>
            </Group>
            <Group justify="flex-end" mt="md">
              <Link href="/auth/register" className=" text-sm">
                アカウントをお持ちのでない方
              </Link>
            </Group>
          </div>
        </form>
      </Box>
    </div>
  );
};

export default Login;
