async function fetchTop5PopularAnimeByGenre(genre) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(genre: "${genre}", type: ANIME, sort: [POPULARITY_DESC, START_DATE_DESC]) {
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          popularity
        }
      }
    }
  `;

  const variables = {
    page: 1,
    perPage: 5
  };

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();
    const animeList = data.data.Page.media;

   
    const image = document.getElementById("imgS");
    const paragraph = document.querySelector(".popular p");

    
    image.src = animeList[0].coverImage.large;
    image.alt = animeList[0].title.english || animeList[0].title.romaji;

  
    paragraph.innerHTML = ""; 
    animeList.forEach((anime, index) => {
      const title = anime.title.english || anime.title.romaji;
      paragraph.innerHTML += `${index + 1}. ${title}<br>`;
    });

  } catch (error) {
    console.error("Failed to fetch popular anime:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchTop5PopularAnimeByGenre("Action"); 
});
