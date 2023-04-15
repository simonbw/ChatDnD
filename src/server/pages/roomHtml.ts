import { RoomState } from "../../common/models/roomModel";

export function roomHtml(roomId: string, state: RoomState) {
  return /*html*/ `
<html>

<head>
  <meta name="viewport" content="width=device-width">
  <title>ChatDnD — ${roomId}</title>
  <link rel="stylesheet" href="/static/styles/index.css" />
</head>

<body>
  <div id="react-container"></div>
  <script src="/static/pages/roomPage.js"></script>
</body>

</html>`;
}
