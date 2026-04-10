import { useState } from "react";
import { Bell, Menu, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { MobileSidebar } from "./MobileSidebar";
import type { Role } from "@prisma/client";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const userName = session?.user?.name || "User";
  const userRole = (session?.user as any)?.role || "PEGAWAI";

  return (
    <>
      <header className="sticky top-0 h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Menu className="w-5 h-5 text-primary" />
          </button>
          
          <div>
            <h1 className="font-bold text-foreground text-sm lg:text-base tracking-tight">{title}</h1>
            {subtitle && (
              <p className="hidden xs:block text-[10px] lg:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">{userName}</p>
            <p className="text-[9px] text-muted-foreground font-medium">{userRole}</p>
          </div>

          <button className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-all border border-border/50">
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
          </button>
          
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {userName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
        </div>
      </header>

      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        role={userRole as Role}
        userName={userName}
        userRole={userRole}
      />
    </>
  );
}
