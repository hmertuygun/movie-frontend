import { Box, Center, Heading, Stack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import MovieListFull from "../components/MovieListFull";
import MovieSearcher from "../components/MovieSearcher";

const Discover = () => {
  const { results, keyword } = useSelector((state) => state.search);

  return (
    <div>
      <Box marginX={10}>
        <Stack>
          <Center>
            <Stack>
              <MovieSearcher />
              <Center>
                {results.length > 0 ? (
                  <MovieListFull results={results} />
                ) : keyword.length === 0 ? (
                  <Heading mt={5}>Type a keyword to search movie</Heading>
                ) : (
                  <Heading mt={5}>No results</Heading>
                )}
              </Center>
            </Stack>
          </Center>
        </Stack>
      </Box>
    </div>
  );
};

export default Discover;
