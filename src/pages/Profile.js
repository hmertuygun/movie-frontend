import { Box, Center, Heading, Stack } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import MovieListFull from "../components/MovieListFull";

const Profile = () => {
  const { favorites, token } = useSelector((state) => state.users);

  const favoriteMovies = useMemo(() => {
    return favorites.filter((element) => element.email === token);
  }, [favorites]);

  return (
    <div>
      <Box marginX={10}>
        <Stack>
          <Heading>Favorites</Heading>
          <Center>
            <Stack>
              <MovieListFull results={favoriteMovies} />
            </Stack>
          </Center>
        </Stack>
      </Box>
    </div>
  );
};

export default Profile;
