# Synthetic video fixture

`red.mp4` is an original QA fixture: a 640 × 360 solid red, two-second MP4.
It contains no third-party video, music or other external content.

The source is intentionally red so the exported monochrome filter and black
masked corners can be checked from decoded pixels. The test compares uploaded
and restored bytes using SHA-256. This fixture is part of the test source;
neither the production editor nor these tests need the standalone lab.
