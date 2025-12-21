//TODO: implement login page
import { Button } from "@/components/ui/button";


const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-3">
            <Input type="email" placeholder="Email" required />
            <Input type="password" placeholder="Password" required />

            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>

          <div className="relative text-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>

          <GoogleButton />

          <p className="text-sm text-center text-muted-foreground">
            No account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
