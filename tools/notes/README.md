# Course notes builder

`notes.html` is generated from the lesson data inside `course.html`.

- `build.js`: reads `course.html`, renders every lesson with board diagrams, writes `notes.html`.
- `keypoints.js`: the "Yaad rakho" summary for each lesson, plus a few extra diagrams.
- `notes.css`: styles for the notes page.

After changing the course, run `node tools/notes/build.js` and commit `notes.html`.
