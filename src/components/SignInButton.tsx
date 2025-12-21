"use client";

import { login } from "@/app/lib/actions/auth";

const SignInButton = () => {
  return <button onClick={() => login()}>Login With Google</button>;
};

export default SignInButton;
