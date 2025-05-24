const Rcontainer = document.getElementById("romance-cont");
const Acontainer = document.getElementById("action-cont");
const Ccontainer = document.getElementById("comedy-cont");
const Hcontainer = document.getElementById("horror-cont");

const maxPage = 35;

const variables = {
  page: Math.floor(Math.random() * maxPage) + 1,
  perPage: 14
};


async function fetchAnimeByGenre(genre, container) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(genre: "${genre}", type: ANIME, sort: START_DATE_DESC) {
          id
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
 

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const data = await response.json();
    const animeList = data.data.Page.media;

    animeList.forEach(anime => {
      const card = document.createElement("div");
      card.className = "anime";
      card.id = anime.id;

      const img = document.createElement("img");
      img.src = anime.coverImage.large;
      img.alt = anime.title.english || anime.title.romaji;

      const title = document.createElement("p");
      title.textContent = anime.title.english || anime.title.romaji;

      card.appendChild(img);
      card.appendChild(title);
      container.appendChild(card);
    });
  } catch (error) {
    console.error(`API error fetching ${genre} anime:`, error);
  }
}

if (Rcontainer && Acontainer && Ccontainer && Hcontainer) {
  Promise.all([
  fetchAnimeByGenre("Romance", Rcontainer),
  fetchAnimeByGenre("Action", Acontainer),
  fetchAnimeByGenre("Comedy", Ccontainer),
  fetchAnimeByGenre("Horror", Hcontainer)
  ])
}

document.addEventListener("DOMContentLoaded", () => {
  const genreButtons = {
    RoBtn: "Romance",
    AcBtn: "Action",
    CoBtn: "Comedy",
    HoBtn: "Horror"
  };


  Object.entries(genreButtons).forEach(([btnId, genre]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.href = `mb.html?genre=${encodeURIComponent(genre)}`;
      });
    }
  });

  const bckBtn = document.getElementById("bckBtn");
  if (bckBtn) {
    bckBtn.addEventListener("click", () => window.location.href = "index.html");
  }

  const params = new URLSearchParams(window.location.search);
  const genre = params.get("genre");
  const container = document.getElementById("animecont-cont");
  const heading = document.querySelector(".top h1");

  if (!genre || !container || !heading) {
    console.error("Missing genre or container or heading.");
    return;
  }

  document.title = `Reikanime: ${genre} Genre`;
  heading.textContent = `${genre} Anime`;

  const maxPage = 35;
  const perPage = 10;
  const delay = 2000;
  let currentPage = Math.floor(Math.random() * maxPage) + 1;
  let lastPage = null;
  let isLoading = false;

  
  function createSpinnerCard() {
    const spinnerCard = document.createElement("div");
    spinnerCard.className = "anime spinner-card";
    spinnerCard.innerHTML = `
      <div class="spinner"></div>
    `;
    return spinnerCard;
  }


  function removeSpinnerCard() {
    const spinnerCard = container.querySelector(".spinner-card");
    if (spinnerCard) {
      container.removeChild(spinnerCard);
    }
  }

  async function fetchAndAppendAnime(page) {
    if (isLoading || (lastPage && page > lastPage)) return;

    isLoading = true;

   
    removeSpinnerCard();
    const spinnerCard = createSpinnerCard();
    container.appendChild(spinnerCard);

    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
          }
          media(genre: "${genre}", type: ANIME) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
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
          variables: {
    page: page,
    perPage: perPage
  }
        })
      });

      const data = await response.json();
      const { media, pageInfo } = data.data.Page;

      lastPage = pageInfo.lastPage;
      currentPage = pageInfo.currentPage;

      
      removeSpinnerCard();

      media.forEach(anime => {
        const card = document.createElement("div");
        card.className = "anime";
        card.id = anime.id;

        const img = document.createElement("img");
        img.src = anime.coverImage.large;
        img.alt = anime.title.english || anime.title.romaji;

        const title = document.createElement("p");
        title.textContent = anime.title.english || anime.title.romaji;

        card.appendChild(img);
        card.appendChild(title);
        container.appendChild(card);
      });

      
      container.appendChild(createSpinnerCard());

      await new Promise(resolve => setTimeout(resolve, delay));

      isLoading = false;

    } catch (err) {
      console.error("Error loading anime batch:", err);
      removeSpinnerCard();
      isLoading = false;
    }
  }

  fetchAndAppendAnime(currentPage);

  container.addEventListener("scroll", () => {
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
      fetchAndAppendAnime(currentPage + 1);
    }
  });

  container.addEventListener("click", (e) => {
    const card = e.target.closest(".anime");
    if (card && !card.classList.contains("spinner-card")) {
      const animeId = card.getAttribute("id");
      if (animeId) {
        window.location.href = `next.html?id=${animeId}`;
      }
    }
  });
});


[Rcontainer, Acontainer, Ccontainer, Hcontainer].forEach(container => {
  container.addEventListener("click", (e) => {
    const card = e.target.closest(".anime");
    if (card) {
      const sH = card.getAttribute("id");
      window.location.href = `next.html?id=${sH}`;
    }
  });
});


