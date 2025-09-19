import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { login as apiLogin } from "@/services/users";
import { useDispatch } from "react-redux";
import { setAuth } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { getErrorMessage } from "@/lib/errors";
import { useState } from "react";
import { Eye, EyeOff, Asterisk } from "lucide-react";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type Form = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = async (v: Form) => {
    try {
      const res = await apiLogin(v);
      dispatch(setAuth(res));
      toast.success("Welcome back!");
      nav("/");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) ?? "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="flex items-center gap-2">
        <Asterisk className="size-5 text-primary" />
        <div className="font-semibold text-lg">Booky</div>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-muted-foreground">Sign in to manage your library account.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="h-10 rounded-lg" aria-invalid={!!errors.email} {...register("email")} />
          <p className={`text-xs mt-1 ${errors.email ? "text-destructive" : "text-muted-foreground"}`}>
            {errors.email?.message ?? "Text Helper"}
          </p>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              aria-invalid={!!errors.password}
              className="h-10 rounded-lg"
              {...register("password")}
            />
            <button
              type="button"
              aria-label={showPwd ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPwd((s) => !s)}
            >
              {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className={`text-xs mt-1 ${errors.password ? "text-destructive" : "text-muted-foreground"}`}>
            {errors.password?.message ?? "Text Helper"}
          </p>
        </div>
        <Button disabled={isSubmitting} className="w-full rounded-full h-12 ">Login</Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account? <Link to="/register" className="text-primary-300">Register</Link>
      </p>
    </div>
  );
}
