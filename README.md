# Runeterra Atlas

A modern, offline-ready League of Legends wiki app for discovering champion lore and exploring
where champions come from on a stylized Runeterra map.

## Features

- Current champion roster loaded from public CommunityDragon champion data.
- Supplemental origin metadata for champion regions, lanes, release years, and resources.
- Champion search and filters by region or role.
- Champion detail view with lore summary, role chips, origin, splash art, and metadata.
- Visual Runeterra map with clickable region markers and champion counts.
- Region encyclopedia covering Bandle City, Bilgewater, Demacia, Freljord, Ionia, Ixtal,
  Mount Targon, Noxus, Piltover, Zaun, Shadow Isles, Shurima, The Void, and Runeterra.
- Offline download flow that caches champion bios, origins, icons, and base splash art.
- Service worker app shell cache for offline navigation after the first load.

## Run locally

Serve the folder with any static file server. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Service workers require `localhost` or HTTPS, so opening `index.html` directly from the file
system will not enable the full offline experience.

## Offline data

Open the **Offline** tab and choose **Download offline data**. The app will:

1. Fetch the latest champion roster.
2. Fetch compact lore details for each champion.
3. Cache champion icons and base splash art in the browser Cache API.
4. Save compact champion metadata in local storage.

After that, the app can show the downloaded atlas even without a network connection.

## Data sources and ownership

This is a fan-made educational project. Champion and artwork data are loaded from public
Riot/CommunityDragon assets, with supplemental public origin metadata. League of Legends and
all related champion names, lore, and artwork belong to Riot Games.
