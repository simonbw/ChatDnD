// import "../styles/index.css";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  RoomListItem,
  roomListSchema,
} from "../../common/models/roomListModel";
import { renderPage } from "../utils/renderPage";

renderPage(
  <main className="container mx-auto p-2">
    <h1 className="text-6xl font-cambridge">ChatDnD</h1>
    <p>This is the home page.</p>

    <RoomList />
  </main>
);

function RoomList() {
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
