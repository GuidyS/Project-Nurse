import { Cloud } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2 justify-center">
      <Cloud className="h-8 w-8 text-primary fill-primary/20" />
      <span className="text-2xl font-semibold tracking-tight text-foreground">Aura</span>
    </div>
  );
};

export default Logo;
