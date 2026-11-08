import { useAction, useQuery } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { routes } from "../../common/routes";
import { usePlayerId } from "../contexts/playerIdContext";
import { Button } from "./Button";
import { NameTag } from "./NameTag";

export function RoomList() {
  const playerId = usePlayerId();
  const playerRooms = useQuery(api.rooms.listForPlayer, { playerId }) ?? [];
  const recentRooms = useQuery(api.rooms.listRecent, { limit: 10 }) ?? [];
  const createRoom = useAction(api.rooms.create);
  const [creating, setCreating] = useState(false);

  const newCampaign = async () => {
    setCreating(true);
    try {
      const roomId = await createRoom();
      window.location.href = routes.room.view(roomId);
    } catch (error) {
      console.warn("Failed to create campaign", error);
      setCreating(false);
    }
  };

  return (
    <div className="text-md font-body p-4 flex flex-col justify-center gap-12">
      {playerRooms.length > 0 ? (
        <div>
          <h2 className="text-sepia text-center border-b border-dotted border-sepia/50 pb-1 mb-2">
            Your Campaigns
          </h2>

          <ul className="space-y-1">
            {playerRooms.map((room) => (
              <li key={room.id} className="focus-visible:outline-none">
                <a
                  className="link font-nametag"
                  href={routes.room.view(room.id)}
                >
                  — <NameTag className="">{room.name}</NameTag>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="text-center">
        <Button
          kind="flat"
          color="primary"
          size="lg"
          onClick={newCampaign}
          loading={creating}
        >
          New Campaign
        </Button>
      </div>

      {recentRooms.length > 0 ? (
        <div>
          <h2 className="text-sepia text-center border-b border-sepia/50 pb-1 mb-2">
            Recently Started Campaigns
          </h2>

          <ul className="space-y-1">
            {recentRooms.map((room) => (
              <li key={room.id} className="focus-visible:outline-none">
                <a
                  className="link font-nametag"
                  href={routes.room.view(room.id)}
                >
                  — <NameTag className="">{room.name}</NameTag>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
