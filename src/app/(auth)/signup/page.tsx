import GoogleSignIn from "@/components/GoogleSignIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
//TODO: add signup logic
const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Sign Up
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div>
              <Label htmlFor="username" className="mb-3">
                Username
              </Label>
              <Input
                type="text"
                placeholder="Username"
                id="username"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-3">
                Email
              </Label>
              <Input type="email" placeholder="Email" id="email" required />
            </div>

            <div>
              <Label htmlFor="password" className="mb-3">
                password
              </Label>
              <Input
                type="password"
                placeholder="Password"
                id="password"
                required
              />
            </div>

            <Button className="w-full mt-6" type="submit">
              Sign Up
            </Button>
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
