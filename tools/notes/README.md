# Course notes builder

`notes.html` is generated from the lesson data inside `course.html`.

- `build.js`: reads `course.html`, renders every lesson with board diagrams, writes `notes.html`.
- `keypoints.js`: the "Yaad rakho" summary for each lesson, plus a few extra diagrams.
- `notes.css`: styles for the notes page.

After changing the course, run `node tools/notes/build.js` and commit `notes.html`.

Word and text downloads (`downloads/`): run `node tools/notes/export.js` (needs Playwright), then in its `out/` folder run pandoc on `docx.html` (to .docx) and `txt.html` (to plain text).
