"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
};

const SidebarItem = ({ label, iconSrc, href }: Props) => {
  const pathname = usePathname(); //lấy đường dẫn
  const active = pathname === href; // lấy đường dẫn hiện tại đang hoạt động
  return (
    <Button
      variant={active ? "sidebarOutline" : "sidebar"} // kiểm tra xem nút này có đang hoạt động bằng cách đường dẫn có giống với tên nút hay không
      className="justify-start h-[52px] "
      asChild
    >
      <Link href={href}>
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={32}
          width={32}
        />
        {label}
      </Link>
    </Button>
  );
};

export default SidebarItem;
