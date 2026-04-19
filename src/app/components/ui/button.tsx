import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/35 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/92 dark:hover:brightness-[1.06]",
        accent:
          "bg-accent-blue text-white shadow-sm hover:bg-accent-blue-hover focus-visible:ring-accent-blue/30 dark:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/25 dark:bg-accent-red-soft dark:text-accent-red dark:hover:bg-accent-red/20 dark:hover:text-accent-red",
        outline:
          "border border-border-subtle bg-bg-surface text-text-primary hover:bg-bg-elevated hover:text-text-primary dark:border-border-subtle dark:bg-transparent dark:hover:bg-bg-elevated/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85 dark:bg-bg-elevated dark:text-text-primary dark:hover:bg-bg-elevated/80",
        ghost:
          "hover:bg-bg-elevated/80 hover:text-text-primary dark:hover:bg-bg-elevated/60",
        link: "text-primary underline-offset-4 hover:text-accent-blue-hover hover:underline dark:text-accent-blue",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
