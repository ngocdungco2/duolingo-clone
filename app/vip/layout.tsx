import { TooltipProvider } from "@radix-ui/react-tooltip";
import Sidebar from "./component/sidebar";
import { ThemeProvider } from "./component/theme-provider";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <>
      <TooltipProvider>
        <Sidebar />
      </TooltipProvider>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </main>
      </div>
    </>
  );
};

export default MainLayout;
