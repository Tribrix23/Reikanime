document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const animeId = params.get("id");
  const episodeS = parseInt(params.get("ep") || "1");

  const PlayerVid = document.getElementById("PlayerVid");
  const Title = document.getElementById("Animetlt");
  const epsBtnContainer = document.getElementById("esp");
  const bacK = document.getElementById("return");
  const PlaY = document.getElementById("skfh");

  if (!animeId) return;

  PlayerVid.src = `https://vidsrc.cc/v2/embed/anime/ani${animeId}/${episodeS}/sub?autoPlay=true`;

  bacK.addEventListener('click', () => window.location.href = `/next_page/next.html?id=${animeId}`);

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
        episodes
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        query,
        variables: { id: parseInt(animeId) }
      })
    });

    const data = await response.json();
    const anime = data.data.Media;
    if (!anime) return;

    Title.textContent = anime.title.english || anime.title.romaji;
    document.title = `Reikanime: ${Title.textContent}`;
    const TotalEpisode = anime.episodes || 0;

    if (!TotalEpisode) {
      const nope = document.createElement("p");
      nope.textContent = "Still not released";
      nope.style.fontSize = "2rem";
      nope.style.color = "red";
      epsBtnContainer.appendChild(nope);
    }

    for (let i = 1; i <= TotalEpisode; i++) {
      const BtnTo = document.createElement("button");
      BtnTo.textContent = i;
      if (i === episodeS) {
        BtnTo.style.backgroundColor = "rgba(226, 107, 9, 0.952)";
        BtnTo.style.color = "white";
      }
      BtnTo.addEventListener('click', () => {
        window.location.href = `/player/play.html?id=${animeId}&ep=${i}`;
      });
      epsBtnContainer.appendChild(BtnTo);
    }

    if (TotalEpisode > 40) {
  epsBtnContainer.style.overflowY = "auto";
  epsBtnContainer.style.maxHeight = "20rem"; 
}

    window.addEventListener('message', (event) => {
        console.log('Received message:', event);

      if (event.origin !== 'https://vidsrc.cc') return;
      if (event.data && event.data.type === 'PLAYER_EVENT') {
        const { event: eventType } = event.data.data;
        console.log('Player event type:', eventType);
        if (eventType === 'complete') {
          const nextEp = episodeS + 1;
          if (nextEp <= TotalEpisode) {
            window.location.href = `/player/play.html?id=${animeId}&ep=${nextEp}`;
          }
        }
      }
    });

    PlaY.addEventListener('click', () => {
      window.location.href = `/player/play.html?id=${animeId}&ep=1`;
    });

  } catch (error) {
    console.error("Error fetching anime by ID:", error);
  }
});
