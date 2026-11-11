// Edit, save, refresh. Bump version to replace saved settings on visitors' devices.
window.CONFIG = {
  version: 1,
  title: "Until we’re together",
  who: "Lai and K",
  when: "2026-12-20T14:30:00-05:00",
  start: "2026-11-10T00:00:00-05:00", // when the wait began (how far the moon starts from the sun)
  msg: "I love you",
  pre: "gold",                  // gold | ember | moon | rose
  placeA: "Dallas, TX",         // type any city; the distance is worked out for you
  placeB: "Middlebury, VT",
  miles: 0,                     // leave 0 to calculate automatically (or set a number to override)
  // Add your own notes here, or enter them in the settings panel.
  wishes: [],

  // A song for each day. It unlocks at midnight on its date.
  // song: in Spotify, tap Share > Copy link to the song and paste it here. text: your message with it.
  songs: [
    { date: "2026-11-12", song: "", text: "Listen to this one when you wake up." },
    { date: "2026-11-13", song: "", text: "This one is how today feels." }
  ],

  // Optional: change the wording that appears as the wait gets short.
  words: { week: "This week.", tomorrow: "Tomorrow.", today: "Today.", hour: "One hour.", ten: "Ten minutes.", minute: "One minute.", together: "Together for" }
};
