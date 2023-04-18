import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  RoomListItem,
  roomListSchema,
} from "../../common/models/roomListModel";
import { NameTag } from "../components/NameTag";
import { Button } from "../components/Button";
import { routes } from "../../common/routes";
import { usePlayerContext } from "../contexts/playerContext";

export function RoomList() {
  const rooms = useRoomList();

  return (
    <div className="text-md font-body p-4">
      <h2 className="text-sepia text-center border-b border-sepia/50 pb-1 mb-2">
        Join A Campaign
      </h2>
      <ul className="space-y-1">
        {rooms.map((room) => (
          <li key={room.id} className="focus-visible:outline-none">
            <a className="link font-nametag" href={routes.room.view(room.id)}>
              — <NameTag className="">{room.name}</NameTag>
            </a>
          </li>
        ))}
      </ul>
      <form action="/new-room" method="post" className="mt-2">
        <Button type="submit" kind="flat" color="primary">
          New Campaign
        </Button>
      </form>
    </div>
  );
}

function useRoomList(): RoomListItem[] {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const { player } = usePlayerContext();

  useEffect(() => {
    if (player) {
      const url = new URL(routes.rooms(), window.location.origin);
      url.searchParams.set("playerId", player.id);
      fetch(url, {})
        .then((response) => response.json())
        .then((data) => z.object({ rooms: roomListSchema }).parse(data))
        .then((roomList) => setRooms(roomList.rooms));
    }
  }, [player]);

  return rooms;
}
