import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border shadow-2xl shadow-black/5 overflow-hidden">
          {/* Grid Pattern Header */}
          <div className="h-16 bg-gradient-to-b from-muted/50 to-transparent relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          {/* Content */}
          <div className="px-8 pb-8 -mt-4">
            {/* Logo */}
            <div className="mb-6">
              <Logo />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm">
                Please enter your details to sign in
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
