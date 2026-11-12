// Edit, save, refresh. Bump version to replace saved settings on visitors' devices.
window.CONFIG = {
  version: 1,
  sync: { databaseURL: "https://eclipse-a2e6b-default-rtdb.firebaseio.com" },
  title: "THANKSGIVING REUNION",
  who: "Lai&K",
  when: "2026-11-25T12:00:00-05:00",
  start: "2026-11-10T00:00:00-05:00", // when the wait began (how far the moon starts from the sun)
  msg: "I love you",
  pre: "gold",                  // gold | ember | moon | rose
  placeA: "St. Andrews, Scotland",         // type any city; the distance is worked out for you
  placeB: "Middlebury, Vermont",
  miles: 0,                     // leave 0 to calculate automatically (or set a number to override)
  // Default wishes shown even when no room code is set.
  wishes: [],

  // A song for each day. It unlocks at midnight on its date.
  // song: in Spotify, tap Share > Copy link to the song and paste it here. text: your message with it.
  songs: [],

  // Optional: change the wording that appears as the wait gets short.
  words: { week: "This week.", tomorrow: "Tomorrow.", today: "Today.", hour: "One hour.", ten: "Ten minutes.", minute: "One minute.", together: "Together for" }
};
