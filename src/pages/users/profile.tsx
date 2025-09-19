import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { updateProfile } from "@/services/users";
import { toast } from "sonner";
import { updateUser } from "@/features/auth/authSlice";

export default function Profile() {
  const user = useSelector((s: RootState) => s.auth.user)!;
  const { register, handleSubmit } = useForm({ defaultValues: { name: user.name, phone: user.phone ?? "" } });
  const dispatch = useDispatch();

  const onSubmit = async (v: { name: string; phone?: string }) => {
    try {
      const u = await updateProfile(v);
      dispatch(updateUser(u));
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="max-w-md space-y-3">
      <h1 className="text-xl font-semibold">My Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Input placeholder="Name" {...register("name")} />
        <Input placeholder="Phone" {...register("phone")} />
        <Button>Save</Button>
      </form>
    </div>
  );
}