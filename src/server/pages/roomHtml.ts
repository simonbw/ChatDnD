import { RoomState } from "../../common/roomModel";

export function roomHtml(roomId: string, state: RoomState) {
  return /*html*/ `
<html>

<head>
  <meta name="viewport" content="width=device-width">
  <title>ChatDnD — ${roomId}</title>
  <link rel="stylesheet" href="/static/index.css" />
</head>

<body>
  <div id="react-container"></div>
  <script>const roomState = '${JSON.stringify(state)}';</script>
  <script src="/static/pages/room.js"></script>
</body>

</html>`;
}
