import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  RoomListItem,
  roomListSchema,
} from "../../common/models/roomListModel";
import { NameTag } from "./NameTag";
import { Button } from "./Button";
import { routes } from "../../common/routes";
import { usePlayerId } from "../contexts/playerIdContext";

export function RoomList() {
  const playerRooms = usePlayerRooms();
  const recentRooms = useRecentRooms();

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

      <form action="/new-room" method="post" className="text-center">
        <Button type="submit" kind="flat" color="primary" size="lg">
          New Campaign
        </Button>
      </form>

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

function usePlayerRooms(): RoomListItem[] {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const playerId = usePlayerId();

  useEffect(() => {
    const url = new URL(routes.rooms(), window.location.origin);
    url.searchParams.set("playerId", playerId);
    fetch(url, {})
      .then((response) => response.json())
      .then((data) => z.object({ rooms: roomListSchema }).parse(data))
      .then((roomList) => setRooms(roomList.rooms));
  }, [playerId]);

  return rooms;
}

function useRecentRooms(): RoomListItem[] {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);

  useEffect(() => {
    const url = new URL(routes.rooms(), window.location.origin);
    url.searchParams.set("limit", "10");
    fetch(url, {})
      .then((response) => response.json())
      .then((data) => z.object({ rooms: roomListSchema }).parse(data))
      .then((roomList) => setRooms(roomList.rooms));
  }, []);

  return rooms;
}
