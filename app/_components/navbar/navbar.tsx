"use client";

import { useEffect, useState } from "react";
import { Section } from "../section";
import classNames from "classnames";

export interface NavbarProps {
  name: string;
  tagline: string;
  email: string;
}

export const Navbar = ({ name, tagline, email }: NavbarProps) => {
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY < 15);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Section
      className={classNames(
        "sticky top-0 bg-background z-50 xl:rounded-b-xl transition-all border-0 border-background-alt px-4!",
        {
          "shadow-background-alt md:border-2 bg-background-alt": !isTop,
        },
      )}
    >
      <nav className="flex justify-between flex-row items-center py-4 text-accent">
        <div className="flex flex-col gap-1">
          <p className="leading-none font-bold">{name}</p>
          <p className="leading-none">{tagline}</p>
        </div>

        <a className="underline" href={`mailto:${email}`}>
          {email}
        </a>
      </nav>
    </Section>
  );
};
