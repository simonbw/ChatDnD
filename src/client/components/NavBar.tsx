import React from "react";
import { routes } from "../../common/routes";
import { Button } from "../components/Button";

export function NavBar() {
  return (
    <nav className="text-zinc-100 container mx-auto max-w-2xl font-serif p-1">
      <a href={routes.home()}>
        <Button color="white" kind="text">
          Home
        </Button>
      </a>
    </nav>
  );
}
