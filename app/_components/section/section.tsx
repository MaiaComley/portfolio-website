import classNames from "classnames";
import { PropsWithChildren } from "react";

export interface SectionProps extends PropsWithChildren {
  fullWidth?: boolean;
  className?: string;
}

export const Section = ({ children, fullWidth, className }: SectionProps) => (
  <section
    className={classNames(
      "flex flex-col w-full",
      {
        "max-w-7xl md:px-8": !fullWidth,
      },
      className,
    )}
  >
    {children}
  </section>
);
