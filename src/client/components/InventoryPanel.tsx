import { Popover, Transition } from "@headlessui/react";
import React from "react";
import { InventoryItem } from "../../common/models/characterModel";
import { roomApiClient } from "../api/roomApiClient";
import { usePlayerId } from "../contexts/playerIdContext";
import { useRoomId } from "../contexts/roomContext";
import { Button } from "./Button";
import { DissolveInImage } from "./DissolveInImage";
import { Paper } from "./Paper";

// ❂✥❖⟣⟢◆◈

export function InventoryPanel({ inventory }: { inventory: InventoryItem[] }) {
  const roomId = useRoomId();
  const playerId = usePlayerId();
  return (
    <section className="clear-both pt-2">
      <h3 className="font-nametag first-letter:text-lg first-letter:leading-none underline underline-offset-1">
        Inventory
        <Button
          color="primary"
          kind="outline"
          className="ml-4"
          size="xs"
          onClick={
            roomId
              ? () => roomApiClient.redrawInventory(roomId)({ playerId })
              : undefined
          }
        >
          Redraw
        </Button>
      </h3>
      <ul className="grid grid-cols-2">
        {inventory.map((item, i) => (
          <InventoryItemCell item={item} key={item.name} />
        ))}
      </ul>
    </section>
  );
}

function InventoryItemCell({ item }: { item: InventoryItem }) {
  return (
    <li key={item.name} className="">
      <Popover>
        <Popover.Button className={"focus:outline-none link py-0.5"}>
          <span>◆</span> {item.name}{" "}
          {item.quantity > 1 && ` (x${item.quantity})`}
        </Popover.Button>

        <Transition
          enter="transition duration-150 origin-center"
          enterFrom="scale-0 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Panel className={"absolute z-20 w-fit h-fit"}>
            <Paper
              small
              className={"flex flex-col gap-2 w-64 p-1"}
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <header>
                <h3 className="font-heading-1 text-2xl text-center">
                  {item.name}
                </h3>
                {item.quantity > 1 && (
                  <h4 className="font-heading-2 text-xl">
                    Carrying {item.quantity}
                  </h4>
                )}
              </header>

              <DissolveInImage
                className="block aspect-square w-full border-4 border-double border-sepia/50"
                src={item.imageUrl}
                fadeEdges
                duration={0}
              />
              <p className="font-caption font-light leading-tight text-sm">
                {item.description}
              </p>
            </Paper>
          </Popover.Panel>
        </Transition>
      </Popover>
    </li>
  );
}

{
  /* <Popover.Button>Solutions</Popover.Button>

<Popover.Panel className="absolute z-10">
  <div className="grid grid-cols-2">
    <a href="/analytics">Analytics</a>
    <a href="/engagement">Engagement</a>
    <a href="/security">Security</a>
    <a href="/integrations">Integrations</a>
  </div>

  <img src="/solutions.jpg" alt="" />
</Popover.Panel>
</Popover> */
}
