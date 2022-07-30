import { Box, Center, Stack } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import MovieListFull from "../components/MovieListFull";
import MovieSearcher from "../components/MovieSearcher";

const Discover = () => {
  const { results } = useSelector((state) => state.search);

  return (
    <div>
      <Box marginX={10}>
        <Stack>
          <Center>
            <Stack>
              <MovieSearcher />
              <MovieListFull results={results} />
            </Stack>
          </Center>
        </Stack>
      </Box>
    </div>
  );
};

export default Discover;
