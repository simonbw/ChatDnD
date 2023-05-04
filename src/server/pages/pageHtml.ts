import { RoomPublicState } from "../../common/models/roomModel";

interface Options {
  scripts: string[];
  title?: string;
  data?: object;
}
export function basicHtml({ scripts, title, data }: Options) {
  return /*html*/ `
<html lang="en">

<head>
  <meta name="viewport" content="width=device-width">
  <title>${title ?? "ChatDnD"}</title>
  <link rel="icon" type="image/png" href="/static/images/favicon.png">
  <link rel="stylesheet" href="/static/styles/index.css" />
</head>

<body>
  <div id="react-container"></div>
  <script type="application/json">${JSON.stringify(data)}</script>
  ${scripts.map((src) => /*html*/ `<script src="${src}"></script>`)}
  
</body>

</html>`;
}
