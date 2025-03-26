import { Menu, School } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { User } from "../types/types";

const Navbar: React.FC = () => {
  const { user } = useSelector((store: RootState) => store.auth) as { user: User | null };
  const [logoutUser, { data, isSuccess }] = useLogoutMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "User logged out.");
      navigate("/login");
    }
  }, [isSuccess]);

  return (
    <div className="h-16 bg-[#F3F4F6] shadow-sm border-b border-gray-300 fixed top-0 left-0 right-0 z-50">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        <div className="flex items-center gap-3">
          <School size={30} className="text-blue-500" />
          <Link to="/">
            <h1 className="font-extrabold text-2xl text-gray-800 tracking-wide">
              E-Learning
            </h1>
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-8">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user.photoUrl || "https://github.com/shadcn.png"}
                    alt={user.name || "User Avatar"}
                  />
                  <AvatarFallback>
                    {user.name ? user.name.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg text-gray-800">
                <DropdownMenuLabel className="text-gray-500">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link to="/my-learning" className="hover:text-blue-500 transition">
                      My Learning
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/profile" className="hover:text-blue-500 transition">
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logoutHandler}
                    className="hover:text-red-500 transition"
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/admin/dashboard" className="hover:text-blue-500 transition">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="hover:bg-gray-200"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Signup
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-xl text-gray-800">E-Learning</h1>
        <MobileNavbar user={user} />
      </div>
    </div>
  );
};

export default Navbar;

// Mobile Navbar Component
interface MobileNavbarProps {
  user: User | null;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full hover:bg-gray-100 text-gray-600"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col bg-white text-gray-800 border border-gray-200 shadow-md">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle>
            <Link to="/" className="text-gray-900">E-Learning</Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-6">
          <Link to="/my-learning" className="hover:text-blue-500 transition">
            My Learning
          </Link>
          <Link to="/profile" className="hover:text-blue-500 transition">
            Edit Profile
          </Link>
          {user && (
            <p
              className="cursor-pointer hover:text-red-500 transition"
              onClick={() => navigate("/login")}
            >
              Log out
            </p>
          )}
        </nav>
        {user?.role === "instructor" && (
          <SheetFooter>
            <SheetClose asChild>
              <Button
                type="submit"
                onClick={() => navigate("/admin/dashboard")}
                className="bg-blue-500 hover:bg-blue-600 text-white w-full"
              >
                Dashboard
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
