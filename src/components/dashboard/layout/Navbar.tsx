"use client"

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Inbox,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/store';
import { logout } from '../../../redux/authSlice';
import type { UserRole } from '../../../redux/authSlice';
import { setCart } from '../../../redux/cartSlice';
import { fetchCart } from '../../../lib/cart-api';
import {
  fetchNotifications,
  getUnreadCount,
  markNotificationRead,
  type AppNotification,
} from '../../../lib/notifications-api';
import logo from '../../../assets/svgs/logo.svg';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiUrl = import.meta.env.VITE_API_URL;
  const { token, user: authUser } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Notification States matching your items: [] structure
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = authUser?.role as UserRole | undefined;
  const isAdmin = () => role === 'admin';
  const isDesigner = () => role === 'designer';

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${apiUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Profile fetch error", err);
      }
    };
    fetchProfile();
  }, [token, apiUrl]);

  /* ================= FETCH NOTIFICATIONS ================= */
  const loadNotifications = async () => {
    if (!token) return;
    try {
      const items = await fetchNotifications(token);
      setNotifications(items);
      setUnreadCount(getUnreadCount(items));
    } catch (err) {
      console.error('Notification fetch error', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 120000);
    return () => clearInterval(interval);
  }, [token]);

  /* ================= FETCH CART COUNT ================= */
  useEffect(() => {
    const loadCartCount = async () => {
      if (!token || isAdmin() || isDesigner()) return;
      try {
        const data = await fetchCart(token);
        dispatch(setCart(data.items));
      } catch {
        // Keep existing redux cart state on failure
      }
    };
    loadCartCount();
  }, [token, role, dispatch]);

  /* ================= MARK AS READ ================= */
  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await axios.post(`${apiUrl}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Logout failed");
    } finally {
      setIsLogoutDialogOpen(false);
    }
  };

  // const navItems = [
  //   !isAdmin() && !isDesigner() && { label: 'Store', path: '/client/store' },
  //   !isAdmin() && !isDesigner() && { label: 'Cart', path: '/client/cart' },
  // ].filter(Boolean) as { label: string; path: string }[];

  // const isActive = (path: string) => {
  //   if (path === '/' && location.pathname === '/') return true;
  //   return location.pathname.startsWith(path);
  // };

  // const renderNavLinks = () => (
  //   <>
  //     {navItems.map((item) => (
  //       <Link
  //         key={item.label}
  //         to={item.path}
  //         className={`nav-link ${isActive(item.path) ? 'nav-link-active' : ''}`}
  //       >
  //         <span className="inline-flex items-center gap-1.5">
  //           {item.label}
  //           {item.path === '/client/cart' && cartCount > 0 && (
  //             <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#C4FE01] text-[10px] text-black font-black flex items-center justify-center">
  //               {cartCount}
  //             </span>
  //           )}
  //         </span>
  //       </Link>
  //     ))}
  //   </>
  // );

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4 px-3 sm:gap-8">
          <Link to="/" className="flex items-center gap-2 ">
            <img
              src={logo}
              alt='logo'
              className='w-5 md:w-5 '
            />
          </Link>

          {/* <nav className="hidden md:flex items-center gap-1">
            {renderNavLinks()}
          </nav> */}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* NOTIFICATIONS */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors outline-none">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#C4FE01] text-[10px] text-black font-black flex items-center justify-center border-2 border-background">
                    {unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-card border-border shadow-2xl mr-2" align="end">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Notifications</h3>
                </div>
              </div>

              <ScrollArea className="h-80">
                {notifications.length > 0 ? (
                  <div className="flex flex-col divide-y divide-border/40">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => n.read_at === null && markAsRead(n._id)}
                        className={`p-4 flex flex-col gap-1 transition-all hover:bg-white/5 cursor-pointer relative ${n.read_at === null ? 'bg-[#C4FE01]/5' : ''}`}
                      >
                        {n.read_at === null && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#C4FE01]" />}
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-tighter ${n.read_at === null ? 'text-[#C4FE01]' : 'text-muted-foreground'}`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{n.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-16 opacity-30">
                    <Inbox className="w-8 h-8 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">All Caught Up</p>
                  </div>
                )}
              </ScrollArea>

              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full text-[10px] font-bold uppercase tracking-widest h-8"
                  onClick={() => role && navigate(`/${role}/notifications`)}
                  disabled={!role}
                >
                  View History
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* CART (Client Only) */}
          {!isAdmin() && !isDesigner() && (
            <Link to="/client/cart" className="relative w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C4FE01] text-[10px] text-black font-black flex items-center justify-center border-2 border-background">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* USER MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 outline-none group">
                <Avatar className="w-8 h-8 border-2 border-[#C4FE01]/30 group-hover:border-[#C4FE01] transition-all duration-300">
                  <AvatarImage src={user?.profilePictureUrl} />
                  <AvatarFallback className="bg-muted text-[10px] font-bold">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-[11px] font-bold text-white">{user?.name || "User"}</span>
                  <span className="text-[9px] text-muted-foreground font-black tracking-tighter uppercase">{role}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-white" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 bg-card border-border mt-1">
              <DropdownMenuLabel className="px-3 py-2 flex flex-col">
                <span className="text-xs font-bold truncate">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground truncate font-medium">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
                <User className="w-3.5 h-3.5 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>
                <Settings className="w-3.5 h-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsLogoutDialogOpen(true)} className="text-destructive font-bold">
                <LogOut className="w-3.5 h-3.5 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* LOGOUT MODAL */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Logout</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to exit your session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLogoutDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;