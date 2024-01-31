"use client";
import { TextInput, Button, Group, Box, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { useUserIdState } from "@/app/atoms/userId";
import { useUserState } from "@/app/atoms/user";

const Login = () => {
  const [userId, setUserId] = useUserIdState();
  const [user, setUser] = useUserState();

  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    //バリデーションチェック
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "無効なメールアドレスです",
      password: (value) =>
        value.length < 8 ? "パスワードは８文字以上で設定してください。" : null,
    },
  });

  return (
    <div className=" flex h-screen flex-col items-center justify-center bg-dark-mode">
      <h1 className=" mb-14 text-2xl font-bold text-white">VTSへログイン</h1>
      <Box maw={400} className="rounded-md bg-blue-600 p-8 md:w-96">
        <form
          onSubmit={form.onSubmit(async (values) => {
            await signInWithEmailAndPassword(
              auth,
              values.email,
              values.password,
            )
              .then((userCredential) => {
                const unsubscribed = onAuthStateChanged(auth, (newUser) => {
                  setUser(newUser?.email ?? null);
                  setUserId(newUser?.uid ?? "");
                  router.push("/");
                });
                return () => {
                  unsubscribed();
                };
              })
              .catch((error) => {
                if (error.code === "auth/invalid-credential") {
                  alert("メールアドレス、またはパスワードが間違っています。");
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
            {...form.getInputProps("email")}
          />
          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="set your password"
            {...form.getInputProps("password")}
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
