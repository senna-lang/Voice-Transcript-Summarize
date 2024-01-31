"use client";
import { TextInput, Button, Group, Box, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      APIkey: "",
    },

    //バリデーションチェック
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "無効なメールアドレスです",
      password: (value) =>
        value.length >= 8 ? null : "パスワードは８文字以上で設定してください。",
    },
  });

  return (
    <div className=" flex h-screen flex-col items-center justify-center bg-dark-mode">
      <h1 className=" mb-14 text-2xl font-bold text-white">VTSへようこそ</h1>
      <Box maw={400} className="rounded-md bg-blue-600 p-8 md:w-96">
        <form
          onSubmit={form.onSubmit(async (values) => {
            await createUserWithEmailAndPassword(
              auth,
              values.email,
              values.password,
            )
              .then((userCredential) => {
                const user = userCredential.user;
                router.push("/auth/login");
              })
              .catch((error) => {
                if (error.code === "auth/email-already-in-use") {
                  alert("このメールアドレスはすでに使用されています。");
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
                新規登録
              </Button>
            </Group>
            <Group justify="flex-end" mt="md">
              <Link href="/auth/login">アカウントをお持ちの方</Link>
            </Group>
          </div>
        </form>
      </Box>
    </div>
  );
};

export default Register;
