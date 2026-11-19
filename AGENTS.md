# Architecture rules

- The startup slideshow mounts only its active and outgoing slides, releasing the outgoing image after the fade to limit TV graphics memory.
- The video tile keeps one <video> element and never uses `loop` or seeks back to 0 (Tizen signage blacks out). At the end of each pass the same element drops its src, calls load() and reattaches the src, so only one hardware decoder is in use. A watchdog escalates on stalls: reload source, then unmount and remount the element after a gap, then (only if it played before, at most every 10 minutes) reload the page. Do not cache-bust because TV buffers are limited.
- The bundled video poster is a fallback only for its matching configured media file, so replacement videos do not show an unrelated cover.