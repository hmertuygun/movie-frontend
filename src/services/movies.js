import axios from "axios";

const API_KEY_1 = "e1a73560";
const API_KEY_2 = "4e8de507cc2fa247b9441d1d1df15078";

export const searchKeyword = (keyword) => {
  return axios
    .get(
      `https://www.omdbapi.com/?apikey=${API_KEY_1}&s=${keyword}&type=movie&page=1`,
    )
    .then((response) => {
      if (response.data.Response === "True") {
        return response.data.Search;
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getMovieDetails = (id) => {
  return axios
    .get(
      `https://api.themoviedb.org/3/find/${id}?api_key=${API_KEY_2}&language=en-US&external_source=imdb_id`,
    )
    .then((response) => {
      if (response.status === 200) {
        if (response.data.movie_results) return response.data.movie_results[0];
        else return null;
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getPopularActors = () => {
  return axios
    .get(
      `https://api.themoviedb.org/3/person/popular?api_key=${API_KEY_2}&language=en-US&page=1`,
    )
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        return response.data.results.map((actor) => {
          return { name: actor.name, id: actor.id };
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getRecomendations = (genre, actor) => {
  return axios
    .get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY_2}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_people=${actor.join(
        "|",
      )}&with_genres=${genre.join("|")}&with_watch_monetization_types=flatrate`,
    )
    .then((response) => {
      if (response.status === 200) {
        return response.data.results;
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
