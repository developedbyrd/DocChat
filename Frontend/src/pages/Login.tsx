import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
        toast.success("Login successful");
      } else {
        if (!formData.name) {
          toast.error("Please enter your name");
          return;
        }
        await register(formData.email, formData.password, formData.name);
        toast.success("Account created successfully");
      }

      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <LogIn className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">DocChat</h1>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground">
            {isLoginMode
              ? "Sign in to access your documents"
              : "Join DocChat to manage your documents"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="bg-input border-border"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="bg-input border-border"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isLoginMode ? "••••••••" : "Minimum 8 characters"}
                className="bg-input border-border pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary text-primary-foreground cursor-pointer"
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : isLoginMode
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setFormData({ email: "", password: "", name: "" });
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isLoginMode
              ? "Don't have an account? "
              : "Already have an account? "}
            <span className="font-semibold text-primary">
              {isLoginMode ? "Sign up" : "Sign in"}
            </span>
          </button>
        </div>
      </Card>
    </div>
  );
}
