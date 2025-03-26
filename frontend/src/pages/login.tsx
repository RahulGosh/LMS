import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Login, Register } from "@/types/types";
import { useEffect, useState } from "react";
import { useLoginMutation, useRegisterMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [signupInput, setSignupInput] = useState<Register>({
    name: "",
    email: "",
    password: "",
  });

  const [loginInput, setLoginInput] = useState<Login>({
    email: "",
    password: "",
  });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Registered Successfully");
      setActiveTab("login");
      // Auto-fill the email in login form
      setLoginInput(prev => ({ ...prev, email: signupInput.email }));
      // Clear the signup form
      setSignupInput({ name: "", email: "", password: "" });
    }

    if (registerError) {
      const errorData = (registerError as FetchBaseQueryError)?.data as {
        message?: string;
      };
      toast.error(errorData?.message || "Registration Failed");
    }

    if (loginError) {
      const errorData = (loginError as FetchBaseQueryError)?.data as {
        message?: string;
      };
      toast.error(errorData?.message || "Login Failed");
    }

    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "LoggedIn Successfully");
      navigate("/");
    }
  }, [
    loginIsLoading,
    registerIsLoading,
    loginData,
    registerData,
    loginError,
    registerError,
    loginIsSuccess,
    registerIsSuccess,
    signupInput.email,
    navigate
  ]);

  const changeInputHandler = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "signup" | "login"
  ) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput((prev) => ({ ...prev, [name]: value }));
    } else {
      setLoginInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegistration = async (type: "signup" | "login") => {
    if (type === "signup") {
      const inputData = signupInput;
      try {
        await registerUser(inputData).unwrap();
      } catch (error) {
        console.error("Signup Error:", error);
      }
    } else if (type === "login") {
      const inputData = loginInput;
      try {
        await loginUser(inputData).unwrap();
      } catch (error) {
        console.error("Login Error:", error);
      }
    }
  };

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "login" | "signup")} 
        className="w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

        {/* Signup Tab */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Eg. patel"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Eg. patel@gmail.com"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Eg. xyz"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Login Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login with your credentials here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Eg. patel@gmail.com"
                  value={loginInput.email}
                  onChange={(e) => changeInputHandler(e, "login")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Eg. xyz"
                  value={loginInput.password}
                  onChange={(e) => changeInputHandler(e, "login")}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoginComponent;