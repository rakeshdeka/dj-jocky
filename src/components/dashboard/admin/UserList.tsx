import React from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface UserListProps {
  users: any[];
  title?: string;
  isLoading?: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, title, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#c5fb00]" />
        <p className="text-xs text-muted-foreground animate-pulse tracking-wider uppercase text-[10px] font-bold">
          Fetching users...
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-border rounded-md">
        <p className="text-muted-foreground text-sm italic">No new users registered recently.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <table className="w-full font-sans">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-semibold text-muted-foreground text-[10px] uppercase">User</th>
            <th className="pb-3 font-semibold text-muted-foreground text-[10px] uppercase">Role</th>
            <th className="pb-3 font-semibold text-muted-foreground text-[10px] uppercase">Joined</th>
            <th className="pb-3 font-semibold text-muted-foreground text-[10px] uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      user.name?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter
                  ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 text-[11px] text-muted-foreground">
                {new Date(user.createdAt || user.joinedAt).toLocaleDateString()}
              </td>
              <td className="py-3 text-right">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] hover:bg-[#c5fb00] hover:text-black">
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;