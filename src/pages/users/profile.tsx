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
      const payload = { name: v.name, phone: v.phone?.trim() ? v.phone : undefined };
      const { changes, message } = await updateProfile(payload);
      const updates = Object.keys(changes).length > 0 ? changes : payload;
      dispatch(updateUser(updates));
      toast.success(message);
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="max-w-[557px] space-y-3">
      <h1 className="text-xl font-semibold">My Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Input placeholder="Name" {...register("name")} />
        <Input placeholder="Phone" {...register("phone")} />
        <Button>Save</Button>
      </form>
    </div>
  );
}
