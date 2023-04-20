export function errorHtml(error: Error) {
  return /*html*/ `
<html lang="en">

<head>
  <meta name="viewport" content="width=device-width">
  <title>ChatDnD Error</title>
  <link rel="icon" type="image/png" href="/static/images/favicon.png">
  <link rel="stylesheet" href="/static/styles/index.css" />
</head>

<body class="p-4">
  <main class="p-4 bg-sepia-200 text-sm font-mono">
    <pre class="text-md mb-2 font-bold">${error.message}</pre>
    <pre>${error.stack}</pre>
  </main>
</body>

</html>`;
}
