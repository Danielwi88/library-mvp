import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateProfile } from "@/services/users";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateUser } from "@/features/auth/authSlice";

export function ProfileTab() {
  const user = useSelector((s: RootState) => s.auth.user);
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const dispatch = useDispatch();
  
  // Get profile data from API
  const profileData = profileQuery.data?.data;
  const userProfile = profileData?.profile;
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || user?.name || "",
    email: userProfile?.email || user?.email || "",
    phone: user?.phone || ""
  });

  // Update when profile data loads
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: user?.phone || ""
      });
    }
  }, [userProfile, user?.phone]);
  

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string }) => updateProfile(data),
    onSuccess: ({ changes, message }, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      const updates = changes && Object.keys(changes).length > 0 ? changes : variables;
      dispatch(updateUser(updates));
      toast.success(message);
      setIsEditing(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ 
      name: formData.name.trim(),
      phone: formData.phone?.trim() ? formData.phone.trim() : undefined
    });
  };

  return (
    <div className="space-y-4  ">
      <h1 className="text-xl font-semibold">Profile</h1>
      
      {profileQuery.isLoading ? (
        <div className="flex justify-center py-8 ">
          <img src="/avatarfall.png" alt="avatarfall" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : profileQuery.error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load profile data</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => profileQuery.refetch()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col  mb-8  shadow-custom p-5 rounded-2xl ">
            <Avatar className="w-16 h-16 mb-4">
              <AvatarFallback className="bg-blue-600 text-white items-start text-xl">
                <img src="/avatarfall.png" alt="avatar" width='64' height='64'  />
              </AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-[557px]">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Handphone</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 w-full ">
                <div className="flex justify-between">
                  <div className="text-sm">Name</div>
                  <div className="font-medium">{userProfile?.name || user?.name || "Not available"}</div>
                </div>
                
                <div className="flex justify-between">
                  <div className="text-sm">Email</div>
                  <div className="font-medium">{userProfile?.email || user?.email || "Not available"}</div>
                </div>
                
                <div className="flex justify-between">
                  <div className="text-sm">Nomor Handphone</div>
                  <div className="font-medium">{user?.phone || "Not provided"}</div>
                </div>
                
                <Button 
                  className="w-full rounded-full mt-4" 
                  onClick={() => setIsEditing(true)}
                >
                  Update Profile
                </Button>
              </div>
            )}
          </div>
          
          
        </>
      )}
    </div>
  );
}
