"use client";
import { Button } from "@/components/ui/button";
import GoogleSignIn from "@/components/GoogleSignIn";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
//TODO: add login login

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await credentialsLogin(email, password);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/");
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="mb-3">
                Email
              </Label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-3">
                password
              </Label>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                required
              />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            {error && <p className="text-destructive">{error}</p>}
          </form>

          <div className="relative text-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>

          <GoogleSignIn />

          <p className="text-sm text-center text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

type res = { ok: true } | { ok: false; error: string };
export async function credentialsLogin(
  email: string,
  password: string
): Promise<res> {
  const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!res) {
    return { ok: false, error: "No response from server" };
  }

  if (res.error) {
    return { ok: false, error: "Email หรือ Password ไม่ถูกต้อง" };
  }

  return { ok: true };
}
