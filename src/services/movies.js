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
