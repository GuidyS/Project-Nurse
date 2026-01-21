import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

/**
 * NavLink Component - Custom NavLink component ที่รองรับ className props
 * 
 * หน้าที่:
 * - Wrap React Router's NavLink เพื่อให้ใช้งานง่ายขึ้น
 * - รองรับ activeClassName และ pendingClassName สำหรับ styling
 * - รวม className ด้วย cn() utility function
 * 
 * Props:
 * - className: Base className ที่จะใช้เสมอ
 * - activeClassName: ClassName ที่จะเพิ่มเมื่อ link active
 * - pendingClassName: ClassName ที่จะเพิ่มเมื่อ link กำลัง pending
 * - to: Route path ที่ต้องการ navigate
 * - ...props: Props อื่นๆ จาก React Router NavLink
 * 
 * @param {NavLinkCompatProps} props - Component props
 * @param {React.Ref<HTMLAnchorElement>} ref - Ref สำหรับ anchor element
 * @returns {JSX.Element} - NavLink component
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
