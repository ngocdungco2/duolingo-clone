import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  name: string;

  icon: string;
  href: string;
};
export default function SidebarItem({ icon, href, name }: Props) {
  const pathname = usePathname();

  const currentPath = pathname.split("/").pop();
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg  text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
              currentPath === name &&
                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 bg-accent"
            )}
          >
            <Image src={icon} alt="" width={25} height={25} />
            <span className="sr-only">{name}</span>
          </Link>
        </TooltipTrigger>
      </Tooltip>
    </>
  );
}
