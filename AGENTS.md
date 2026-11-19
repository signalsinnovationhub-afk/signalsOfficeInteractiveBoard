# Architecture rules

- The startup slideshow mounts only its active and outgoing slides, releasing the outgoing image after the fade to limit TV graphics memory.
- The video tile plays one pass per <video> element (no `loop`) and swaps in a fresh element at the end, on error or long stall; TV browsers black out when seeking a used decoder back to start. Replaced elements release their src; do not cache-bust because TV buffers are limited.
- The bundled video poster is a fallback only for its matching configured media file, so replacement videos do not show an unrelated cover.