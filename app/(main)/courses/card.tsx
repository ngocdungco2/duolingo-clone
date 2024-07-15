import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

type Props = {
  title: string;
  id: number;
  imageSrc: string;
  onClick: (id: number) => void;
  disabled?: boolean;
  active?: boolean;
};

const Card = ({ title, id, imageSrc, onClick, disabled, active }: Props) => {
  return (
    <div
      //khi nhấn vào card này sẽ lấy id của card và truyền tới hàm onclick được gọi
      onClick={() => onClick(id)}
      // in style theo dynamic nếu card hiện tại là không bị vô hiệu sẽ hiện ra card với sytyle như trên nếu card bị vô hiệu (disabled) thì sẽ bỏ con trỏ và làm mở 50%
      className={cn(
        "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[217px] min-w-[200px]",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="min-[24px] w-full flex items-center justify-end">
        {active && (
          // nếu đây là khóa học được người dùng đang học thì sẽ hiện giấu tích màu xanh
          <div className="rounded-md bg-green-600 flex items-center justify-center p-1.5">
            <Check className="text-white stroke-[4] h-4 w-4" />
          </div>
        )}
      </div>
      {/* in ảnh theo nguồn được lấy từ csdl */}
      <Image
        src={imageSrc}
        alt={title}
        height={70}
        width={93.33}
        className="rouded-lg drop-shadow-md border object-cover"
      />
      {/* in tên title theo nguồn lấy từ csdl */}
      <p className="text-neutral-700 text-center font-bold mt-3">{title}</p>
    </div>
  );
};

export default Card;
