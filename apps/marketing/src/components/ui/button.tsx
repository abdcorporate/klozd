import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, asChild, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] focus:ring-primary shadow-lg hover:shadow-xl",
      secondary:
        "bg-brand-orange text-white hover:bg-brand-orange-dark hover:scale-[1.02] active:scale-[0.98] focus:ring-brand-orange shadow-lg hover:shadow-xl hover:shadow-brand-orange/20",
      outline:
        "border border-border bg-background text-foreground hover:bg-accent hover:border-primary hover:scale-[1.02] active:scale-[0.98] focus:ring-primary shadow-sm hover:shadow-md",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const classes = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes} {...(props as any)}>
          {children}
        </Link>
      );
    }

    if (asChild && typeof children === "object" && children !== null) {
      return <>{children}</>;
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
