import PaginationBar from "@/components/pagination-bar";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/services/admin";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

export default function AdminUserList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => getUsers()
  });
  
  const users = data?.items || [];
  const filteredUsers = users.filter(user => 
    search === "" || 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">User</h1>
      <div className="relative">
        <Input
          placeholder="Search user"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-lg px-10 rounded-full h-11 sm:h-12"
        />
        <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5  text-neutral-600' />
      </div>

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">No</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created at</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.createdAt ? dayjs(user.createdAt).format("DD MMM YYYY, HH:mm") : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={filteredUsers.length}
        onPageChange={setPage}
        className="mt-6"
      />
    </div>
  );
}