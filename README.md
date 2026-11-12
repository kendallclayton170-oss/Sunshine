# Until Totality

A countdown website: the moon slowly slides across the sun, and when the countdown hits zero you get a total solar eclipse and a hidden message.

## Run it in VS Code
1. Open this folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension.
3. Right-click `index.html` > **Open with Live Server**.

(You can also just double-click `index.html`. It needs no build step or dependencies.)

## Customize
- **`config.js`**: set the date/time, names, message, and sun color. Refresh to see changes.
- `config.js` remains the source of truth for the title, names, start-time fallback, and default totality message. Its reunion date/time is the fallback until a shared room countdown is saved.
- The **“Who’s counting?”** screen lets Kendall or Laila open a profile. First-time character choices are saved individually under `/rooms/<roomCode>/profiles/kendall` or `/rooms/<roomCode>/profiles/laila`; songs, wishes, and the totality message keep their existing paths and behavior. A device without a saved room code asks for it in the profile flow. Character changes are available from the gear panel, and the top-right character button switches profiles.
- **⚙ button** on the page: set the Firebase room code, change the shared countdown date and time, and edit the shared totality message. A date entered in either person's local time zone is saved as an ISO timestamp under `/rooms/<roomCode>/countdown`; the last save wins and shows who changed it. Confirm the new date before saving. The selected profile supplies the name shown on new shared songs and wishes. Songs and wishes are appended under `/rooms/<roomCode>/`; settings show **Synced**, **Offline**, or **Enter room code**. Offline, the page uses the last room copy saved on that device. A room code is never stored in `config.js`.
- **Remember me on this device** remembers the last selected profile and a local companion copy for offline display. Firebase remains the shared source for saved character choices across devices.
- The sun color, room code, your name, and both location fields are stored only in that browser. Changing the room code lets you join another room. **Reset to shared settings** clears those personal settings without deleting room content.
- `sync.databaseURL` in `config.js` must be the Firebase Realtime Database REST base URL. The database's Realtime Database rules must permit the app to read and write the intended `/rooms` paths; the page uses unauthenticated REST requests and does not provide user authentication.
- The page only offers **Remove** for songs and wishes whose stored device ID matches the current device. This is a client-side check, not server-enforced authentication; configure Firebase Realtime Database rules appropriately and do not treat a room code or device ID as an access-control boundary. Totality message edits replace the previous shared message; clearing it restores the `msg` default from `config.js`.
- **History** is available from the ⚙ settings panel for either profile. It keeps completed countdowns in this browser, including the title, date, names, and revealed message.
- The settings panel opens automatically on first visit only when `config.js` has no reunion date set.

## Put it online (so your partner can open a link)
Drag this folder onto **Netlify Drop**, or push it to a GitHub repo and turn on **GitHub Pages**.

## Files
- `index.html`: page structure
- `style.css`: layout and text styling
- `script.js`: the canvas art (stars, sun, moon, corona, diamond ring) and countdown logic
- `config.js`: your date, names, message, colors
- `characters.svg`: original storybook companion illustrations used by the profile chooser

## Daily notes, places, milestones
- `songs` in `config.js` and room songs: one entry per day with a `date`, a Spotify `song` link (Share > Copy link), a `text` message, and (for room entries) the contributor's name. Each unlocks at midnight on its date; the ♫ icon shows a pulsing badge for new songs until you close the song list after viewing them. Tap ♫, then **Play on this page**. The player stays on the page when the song list closes. Use **Pause & stop** to stop playback. Albums and playlists work too.
- `placeA`, `placeB`, `miles`: two little shooting stars drift toward each other as the days pass, and the miles shrink to 0 at totality. After that the page counts how long you’ve been together.
- `words`: the milestone text shown under the countdown ("Tomorrow.", "One hour.", "Ten minutes.", "One minute.").

## Magic
- Fireflies drift up the sky, a sparkle trail follows your cursor or finger, and tapping the sky bursts a few stars.
- Now and then a falling star crosses the sky. Tap it to hear a chime and read a wish. Wishes in `config.js` are defaults; room wishes are shared and can be added in the settings panel (up to 200 characters each). With no room code, only config wishes and songs are shown.
- At totality the two stars meet in a burst of golden dust, the sky flares, the corona blooms, and the message is written in light.
- The felt look is a woolly grain (`#felt`) plus stitched dashed lines around the sun and between the two stars.
- Shared content is read when the page loads and refreshed every 15 seconds. The totality message is shared by room; the last saved message is used, or `msg` from `config.js` if no room message exists.
- A softly glowing, cloud-framed mountain horizon adds a mystical painted landscape around the eclipse.
- A staggered constellation spells “IT IS WRITTEN” with connected, irregular star paths at the right side of the sky. A heart-shaped nebula, made of blue-white stars, amber sparks, and soft mauve clouds, glows behind the eclipse and brightens as totality approaches.
- **Explore the night** can show the Milky Way, meteor showers, and northern or southern auroras on demand. Before totality, the Milky Way appears weekly, meteors every two weeks, and auroras every 17 or 23 days on varied local evenings. These are artistic effects, not live astronomical alerts.
- The eclipse is framed by glowing storm clouds and a shadowed mountain horizon; stars, auroras, meteors, and the Milky Way remain visible through the changing sky.
