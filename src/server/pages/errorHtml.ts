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
  <main class="paper max-w-6xl">
    <a class="link m-2" href="/">◄ Home</a>
    <h1 class="text-md mb-2 font-bold font-heading-1 text-center text-3xl">Error: ${error.message}</h1>
    <pre class="bg-sepia-800 text-zinc-50 font-mono text-xs p-2 rounded overflow-x-auto">${error.stack}</pre>
  </main>
</body>

</html>`;
}
