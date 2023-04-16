import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  RoomListItem,
  roomListSchema,
} from "../../common/models/roomListModel";

export function RoomList() {
  const rooms = useRoomList();

  return (
    <ul>
      {rooms.map((room) => (
        <li key={room.id}>
          <a href={`/room/${room.id}`}>{room.name}</a>
        </li>
      ))}
    </ul>
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
