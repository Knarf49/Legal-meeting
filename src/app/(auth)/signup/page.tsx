"use client";
import { SignupWithCredentials } from "@/app/lib/actions/auth";
import GoogleSignIn from "@/components/GoogleSignIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Link from "next/link";
import { useState } from "react";
import { credentialsLogin } from "../login/page";
import { useRouter } from "next/navigation";
//TODO: add signup logic

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await SignupWithCredentials(email, password, name);

    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }

    // สมัครเสร็จ → login อัตโนมัติ
    await credentialsLogin(email, password);
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Sign Up
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="username" className="mb-3">
                Display Name
              </Label>
              <Input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="username"
                required
              />
            </div>
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

            <Button disabled={loading} className="w-full mt-6" type="submit">
              {loading ? "Signing up..." : "Sign up"}
            </Button>
            {error && <p>{error}</p>}
          </form>

          <div className="relative text-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>

          <GoogleSignIn />

          <p className="text-sm text-center text-muted-foreground">
            Already have account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
