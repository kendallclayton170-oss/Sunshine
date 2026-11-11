# Until Totality

A countdown website: the moon slowly slides across the sun, and when the countdown hits zero you get a total solar eclipse and a hidden message.

## Run it in VS Code
1. Open this folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension.
3. Right-click `index.html` > **Open with Live Server**.

(You can also just double-click `index.html`. It needs no build step or dependencies.)

## Customize
- **`config.js`**: set the date/time, names, message, and sun color. Refresh to see changes.
- `config.js` provides defaults. Edits to every setting-panel field (title, names, message, places, color, reunion date/time, and wishes) save automatically in that browser and override those defaults. **Reset to shared settings** clears those edits and reloads values from `config.js`.
- Bump `version` in `config.js` to discard saved panel settings on visitors' devices and apply the new shared defaults.
- **⚙ button** on the page: change settings live (saved in that browser only). Use "Preview the eclipse" to watch the ending.
- **History** keeps completed countdowns in this browser, including the title, date, names, and revealed message.
- The settings panel opens automatically on first visit only when `config.js` has no reunion date set.

## Put it online (so your partner can open a link)
Drag this folder onto **Netlify Drop**, or push it to a GitHub repo and turn on **GitHub Pages**.

## Files
- `index.html`: page structure
- `style.css`: layout and text styling
- `script.js`: the canvas art (stars, sun, moon, corona, diamond ring) and countdown logic
- `config.js`: your date, names, message, colors

## Daily notes, places, milestones
- `songs` in `config.js`: one entry per day with a `date`, a Spotify `song` link (Share > Copy link), and your `text` message. Each unlocks at midnight on its date; the ♫ icon shows a pulsing badge for new songs until you close the song list after viewing them. Tap ♫, then **Play on this page**. The player stays on the page when the song list closes. Use **Pause & stop** to stop playback. Albums and playlists work too.
- `placeA`, `placeB`, `miles`: two little shooting stars drift toward each other as the days pass, and the miles shrink to 0 at totality. After that the page counts how long you’ve been together.
- `words`: the milestone text shown under the countdown ("Tomorrow.", "One hour.", "Ten minutes.", "One minute.").

## Magic
- Fireflies drift up the sky, a sparkle trail follows your cursor or finger, and tapping the sky bursts a few stars.
- Now and then a falling star crosses the sky. Tap it to hear a chime and read a wish. Add wishes in `config.js` (`wishes`) or in the settings panel.
- At totality the two stars meet in a burst of golden dust, the sky flares, the corona blooms, and the message is written in light.
- The felt look is a woolly grain (`#felt`) plus stitched dashed lines around the sun and between the two stars.
- Wishes typed in settings are stored only in that browser and override the shared wishes from `config.js`. Use **Copy my wishes to share** and add the copied `wishes: [...]` line to `config.js` if both people should see them; the static site does not sync browser data between devices.
- A softly glowing, cloud-framed mountain horizon adds a mystical painted landscape around the eclipse.
- A staggered constellation spells “IT IS WRITTEN” with connected, irregular star paths at the right side of the sky. A heart-shaped nebula, made of blue-white stars, amber sparks, and soft mauve clouds, glows behind the eclipse and brightens as totality approaches.
- **Explore the night** can show the Milky Way, meteor showers, and northern or southern auroras on demand. Before totality, the Milky Way appears weekly, meteors every two weeks, and auroras every 17 or 23 days on varied local evenings. These are artistic effects, not live astronomical alerts.
- The eclipse is framed by glowing storm clouds and a shadowed mountain horizon; stars, auroras, meteors, and the Milky Way remain visible through the changing sky.
