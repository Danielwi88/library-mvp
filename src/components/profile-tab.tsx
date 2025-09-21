import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "@/services/users";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// API endpoint for updating profile
const API_URL = "https://belibraryformentee-production.up.railway.app/api/me";

export function ProfileTab() {
  const user = useSelector((s: RootState) => s.auth.user);
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  
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
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name: formData.name });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      
      {profileQuery.isLoading ? (
        <div className="flex justify-center py-8">
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
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {userProfile ? getInitials(userProfile.name) : user ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
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
              <div className="space-y-4 w-full max-w-md">
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
                  className="w-full mt-4" 
                  onClick={() => setIsEditing(true)}
                >
                  Update Profile
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-12">
            <div className="text-center mb-4">
              <div className="inline-flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                <span className="ml-2 font-semibold">Booky</span>
              </div>
            </div>
            
            <p className="text-center text-sm mb-4">
              Discover inspiring stories & timeless knowledge, ready to become anything. Create, innovate & let our books bring you to new heights.
            </p>
            
            <div className="text-center text-sm mb-4">
              Follow on Social Media
            </div>
            
            <div className="flex justify-center space-x-4">
              <button className="text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7615 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2648 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.9572 14.8821 3.28445C14.0247 3.61171 13.2884 4.1944 12.773 4.95372C12.2575 5.71303 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}