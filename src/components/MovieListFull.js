import { Center, Wrap, WrapItem } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import MovieItem from "./MovieItem";

const MovieListFull = () => {
  const { results } = useSelector((state) => state.search);
  return (
    <div>
      <Center>
        <Wrap spacing="5px">
          {results ? (
            results.map((movie) => (
              <WrapItem key={movie.imdbID} margin={3}>
                <MovieItem data={movie} />
              </WrapItem>
            ))
          ) : (
            <Center>NO RESULT</Center>
          )}
        </Wrap>
      </Center>
    </div>
  );
};

export default MovieListFull;
