const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

let searchTimeout = null;
let lastSearchValue = "";

async function fetchAnimeByTitlePrefix(prefix) {
  if (!prefix) return [];

  const query = `
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            medium
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
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          search: prefix,
          perPage: 20,
        },
      }),
    });

    const data = await response.json();
    if (!data.data) return [];

    return data.data.Page.media
      .filter(anime => {
        const title = (anime.title.english || anime.title.romaji || "").toLowerCase();
        return title.includes(prefix.toLowerCase());
      })
      .slice(0, 6); 
  } catch (error) {
    console.error("Search API error:", error);
    return [];
  }
}

function renderSearchResults(animes) {
  searchResults.innerHTML = "";

  if (animes.length === 0) {
    searchResults.style.display = "none";
    return;
  }

  animes.forEach(anime => {
    const div = document.createElement("div");
    div.className = "anime-result";
    div.setAttribute("data-id", anime.id);

    div.innerHTML = `
      <img src="${anime.coverImage.medium}" alt="${anime.title.english || anime.title.romaji}">
      <span>${anime.title.english || anime.title.romaji}</span>
    `;

    div.addEventListener("click", () => {
      window.location.href = `next.html?id=${anime.id}`;
    });

    searchResults.appendChild(div);
  });

  const resultHeight = animes.length * 50;
  searchResults.style.maxHeight = resultHeight > 300 ? "300px" : resultHeight + "px";
  searchResults.style.display = "block";
}

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const val = searchInput.value.trim();

  if (!val) {
    searchResults.style.display = "none";
    lastSearchValue = "";
    return;
  }
 
  if (val.length % 3 === 0 || val.length < lastSearchValue.length) {
    searchTimeout = setTimeout(async () => {
      const results = await fetchAnimeByTitlePrefix(val);
      renderSearchResults(results);
      lastSearchValue = val;
    }, 300);
  }
});

searchInput.addEventListener("blur", () => {
  setTimeout(() => {
    if (!searchResults.matches(":hover")) {
      searchResults.style.display = "none";
    }
  }, 150);
});

searchResults.addEventListener("mouseenter", () => {
  if (searchInput.value.trim()) {
    searchResults.style.display = "block";
  }
});

searchResults.addEventListener("mouseleave", () => {
  if (document.activeElement !== searchInput) {
    searchResults.style.display = "none";
  }
});
