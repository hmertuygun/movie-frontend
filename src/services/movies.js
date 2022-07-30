import axios from "axios";

const API_KEY = "e1a73560";

export const searchKeyword = (keyword, page) => {
  return axios
    .get(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${keyword}&type=movie&page=1`,
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
      `https://api.themoviedb.org/3/find/${id}?api_key=4e8de507cc2fa247b9441d1d1df15078&language=en-US&external_source=imdb_id`,
    )
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        return response.data.movie_results[0];
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
