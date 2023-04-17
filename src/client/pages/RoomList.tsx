import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  RoomListItem,
  roomListSchema,
} from "../../common/models/roomListModel";
import { NameTag } from "../components/NameTag";

export function RoomList() {
  const rooms = useRoomList();

  return (
    <div className="text-md font-body p-4">
      <h2>Available Rooms</h2>
      <ul className="pl-4 list-disc">
        {rooms.map((room) => (
          <li key={room.id}>
            <a
              className="text-sepia-500 hover:text-sepia-400 active:text-sepia-700 focus:text-sepia-400"
              href={`/room/${room.id}`}
            >
              <NameTag
                name={`Room ${room.name} — (${room.players.length} players)`}
                className="text-sepia-500 hover:text-sepia-400 active:text-sepia-700 focus:text-sepia-400"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useRoomList(): RoomListItem[] {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);

  useEffect(() => {
    fetch("/rooms", {})
      .then((response) => response.json())
      .then((data) => z.object({ rooms: roomListSchema }).parse(data))
      .then((roomList) => setRooms(roomList.rooms));
  }, []);

  return rooms;
}
