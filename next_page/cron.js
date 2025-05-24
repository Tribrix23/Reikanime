document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const animeId = params.get("id");
  const AnimeImg = document.getElementById("Anme");
  const Title = document.getElementById("Animetlt");
  const genRs = document.getElementById("gnrs");
  const epsBtnContainer = document.querySelector(".epsbtn");
  const bacK = document.getElementById("return");
  const des = document.querySelector(".cont-des");
  const PlaY = document.getElementById("skfh");
  let DeFault = 1;

  if (!animeId) {
    console.error("No anime ID provided in URL.");
    return;
  }

  bacK.addEventListener('click', () => window.location.href = "/index.html");

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        description
        episodes
        averageScore
        genres
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

    if (!anime) {
      console.error("Anime not found.");
      return;
    }

    AnimeImg.src = anime.coverImage.large;
    Title.textContent = anime.title.english || anime.title.romaji;

    document.title = `Reikanime: ${Title.textContent}`;

    genRs.textContent = "Genres: " + (anime.genres || []).join(", ");

    const se = document.createElement("p");
    se.textContent = anime.description
    .replace(/<[^>]*>/g, "")
    .replace(/\(Source:.*?\)/g, "")
    .trim();

    des.appendChild(se);

    const TotalEpisode = anime.episodes || 0;

    if(anime.episodes == null) {
      const nope = document.createElement("p");
      nope.textContent = "Still not released";
      nope.style.fontSize = "2rem";
      nope.style.color = "red";

      epsBtnContainer.appendChild(nope);
    }

    for(let i = 1; i <= TotalEpisode; i++){
      const BtnTo = document.createElement("button");
      BtnTo.textContent = i;
      BtnTo.addEventListener('click', () => {
        window.location.href = `/player/play.html?id=${animeId}&ep=${i}`;
      });
      epsBtnContainer.appendChild(BtnTo)
    }

    if (TotalEpisode > 40) {
  epsBtnContainer.style.overflowY = "auto";
  epsBtnContainer.style.maxHeight = "20rem"; 
}



  } catch (error) {
    console.error("Error fetching anime by ID:", error);
  }

  PlaY.addEventListener('click', () => {
    window.location.href = `/player/play.html?id=${animeId}&ep=${DeFault}`;
  })
});
