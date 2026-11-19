# Current tasks

- [x] Back up the bottom video, delete it, and re-insert it as a fresh file under a new name.
- [x] Replace the old video playback code with a new one-pass-per-element player.
- [x] Rework the player: same element reloads its source per pass (no seek, no parallel decoder), watchdog with element remount and page reload as last resort.
- [ ] Confirm the video keeps playing after full loops on the Samsung touchscreen; blocked by lack of access to the physical display.
