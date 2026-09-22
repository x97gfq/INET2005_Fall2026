# Deadline Timeline

A single page that shows a student every due date — assignments, quizzes,
and projects — across **all** their Brightspace courses, in one scrolling
list instead of having to check each course separately.

## How students get their calendar link

Brightspace already tracks every due date it knows about in each student's
personal calendar. This tool just reads that calendar. Here's how a student
gets the link, step by step:

1. Log into Brightspace and open **Calendar** (usually in the top navbar,
   or under your course's tools).
2. Click the **Settings** (gear) icon.
3. Find the **Enable Calendar Feed** (or similarly named) toggle under
   **URL**, and turn it **on**. This has to be switched on first — the
   Subscribe button won't produce a working link until it is.
4. Click **Subscribe** (sometimes labelled **Create/Manage Subscriptions**).
5. Choose to subscribe to **all courses** if that option is offered — that
   way one link covers every course at once, not just one.
6. Copy the link. It's a URL ending in `.ics`, something like:
   `https://nscconline.brightspace.com/d2l/le/calendar/feed/...`

**This link is personal — treat it like a password.** Anyone who has it can
see that student's schedule. Don't post it publicly or share it with
classmates.

## Using the tool

1. Open the Deadline Timeline page.
2. Paste your calendar link into the box and click **Load deadlines**.
3. Your due dates appear grouped by day, with the soonest at the top.
   Items are colour-coded: red for overdue, amber for due within 3 days,
   green for everything later. If you're in more than one course, you can
   filter to just one course using the chips above the list.

Nothing is saved — the page re-fetches your calendar each time you load it,
and your link isn't stored anywhere on the server.

## What it won't catch

This only shows due dates that Brightspace itself knows about — i.e., ones
an instructor actually entered into the Assignments, Quizzes, or Content
tool with a due date set. A deadline that only appears in a syllabus PDF or
an announcement won't show up here, because Brightspace's own calendar
doesn't know about it either.

## Questions or something looks wrong?

Talk to your instructor — this is a locally-built tool, not an official
Brightspace feature.
