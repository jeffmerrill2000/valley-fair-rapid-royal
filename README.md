# Orchard Drop

A small browser game. Apples fall through an orchard. Tap one before it hits the grass.

## How to play

1. Press **Start picking**.
2. Tap a falling apple to catch it.
3. Miss three apples and the round ends.

Your best score stays on this device. The speaker button in the corner mutes the sounds.

## Scoring

| Apple | Points |
| --- | --- |
| Red | 10 |
| Gold | 40 |

Catch apples in a row and the points multiply, up to **×8**. A miss resets the combo. Gold apples are rarer and fall a little faster. The orchard gets busier as your score climbs.

## Run it locally

You need Node.js 22.

```bash
npm install
npm run dev
```

Open the app at `http://127.0.0.1:8080`.

```bash
npm run typecheck
npm run build
```

## License

[MIT](LICENSE). Copyright (c) 2026 Jeff Merrill.

## Android

A full-screen Android app for the same game is in [android](android). Download [android/orchard-drop.apk](android/orchard-drop.apk), allow installs from your browser or Files app, and open it. The app loads [the published game](https://valley-fair-rapid-royal.grok.me/) and needs a network connection.
