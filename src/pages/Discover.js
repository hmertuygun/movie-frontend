import { Box, Center, Stack } from "@chakra-ui/react";
import React from "react";
import MovieListFull from "../components/MovieListFull";
import MovieSearcher from "../components/MovieSearcher";

const Discover = () => {
  return (
    <div>
      <Box marginX={10}>
        <Stack>
          <Center>
            <Stack>
              <MovieSearcher />
              <MovieListFull />
            </Stack>
          </Center>
        </Stack>
      </Box>
    </div>
  );
};

export default Discover;
