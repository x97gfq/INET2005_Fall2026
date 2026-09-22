<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Deadline Timeline</title>
<link rel="stylesheet" href="assets/style.css" />
</head>
<body>
<div class="wrap">
  <h1>Deadline Timeline</h1>
  <p class="sub">Every assignment, quiz, and project due date across your Brightspace courses, in one list.</p>

  <div class="filters" id="filters"></div>

  <div class="setup" id="setupBox">
    <div class="input-row">
      <input type="text" id="icsUrl" placeholder="https://nscconline.brightspace.com/d2l/le/calendar/feed/..." />
      <button id="loadBtn">Load deadlines</button>
    </div>
    <details id="instructions">
      <summary>Where do I get my calendar link?</summary>
      <ol>
        <li>In Brightspace, go to <strong>Calendar</strong>.</li>
        <li>Click the <strong>Settings</strong> (gear) icon.</li>
        <li>Under <strong>URL</strong>, make sure <strong>Enable Calendar Feed</strong> (or similar) is turned <strong>on</strong> — this has to be enabled before a subscribe link will work.</li>
        <li>Click <strong>Subscribe</strong> and choose <strong>All Calendars</strong> (or select every course) so you get one link covering everything.</li>
        <li>Copy the URL it gives you — it ends in <code>.ics</code>. Paste it below.</li>
      </ol>
      <p class="note">This link is tied to your account, like a password for your schedule — don't share it with anyone else.</p>
    </details>
  </div>

  <div class="status" id="status"></div>
  <div id="results"></div>
</div>

<script src="assets/app.js"></script>
</body>
</html>
