import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { register as apiRegister } from "@/services/users";
import { useDispatch } from "react-redux";
import { setAuth } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { getErrorMessage } from "@/lib/errors";
import { Asterisk, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });
type Form = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const onSubmit = async (v: Form) => {
    try {
      const res = await apiRegister({ name: v.name, email: v.email, phone: v.phone, password: v.password });
      dispatch(setAuth(res));
      toast.success("Account created!");
      nav("/");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) ?? "Register failed");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="flex items-center gap-2">
        <Asterisk className="size-5 text-primary" />
        <div className="font-semibold text-lg">Booky</div>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="text-sm text-muted-foreground">Create your account to start borrowing books.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" className="h-10 rounded-lg" aria-invalid={!!errors.name} {...register("name")} />
          <p className={`text-xs mt-1 ${errors.name ? "text-destructive" : "text-muted-foreground"}`}>
            {errors.name?.message ?? "Text Helper"}
          </p>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="h-10 rounded-lg" aria-invalid={!!errors.email} {...register("email")} />
          <p className={`text-xs mt-1 ${errors.email ? "text-destructive" : "text-muted-foreground"}`}>
            {errors.email?.message ?? "Text Helper"}
          </p>
        </div>
        <div>
          <Label htmlFor="phone">Nomor Handphone</Label>
          <Input id="phone" className="h-10 rounded-lg" aria-invalid={!!errors.phone} {...register("phone")} />
          <p className={`text-xs mt-1 ${errors.phone ? "text-destructive" : "text-muted-foreground"}`}>
            {errors.phone?.message ?? "Text Helper"}
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
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPwd ? "text" : "password"}
              aria-invalid={!!errors.confirmPassword}
              className="h-10 rounded-lg"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              aria-label={showConfirmPwd ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfirmPwd((s) => !s)}
            >
              {showConfirmPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className={`text-xs mt-1 ${errors.confirmPassword ? "text-destructive" : "text-muted-foreground"}`}>
            {errors.confirmPassword?.message ?? "Text Helper"}
          </p>
        </div>
        <Button disabled={isSubmitting} className="w-full rounded-full h-12">Submit</Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-primary-300">Log In</Link>
      </p>
    </div>
  );
}
