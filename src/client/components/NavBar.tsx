import React from "react";
import { Button } from "../components/Button";

export function NavBar() {
  return (
    <nav className="text-zinc-100 container mx-auto max-w-2xl font-serif">
      <a href="/">
        <Button color="white" kind="text">
          Home
        </Button>
      </a>
    </nav>
  );
}
