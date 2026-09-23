import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={{ "--width": "min(440px, calc(100vw - 32px))" } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast:
            "group toast !min-h-20 !gap-4 !px-5 !py-4 !text-base group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "!text-base !font-medium !leading-6",
          description: "!text-base !leading-6 group-[.toast]:text-muted-foreground",
          icon: "!h-6 !w-6 [&>svg]:!h-6 [&>svg]:!w-6",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
