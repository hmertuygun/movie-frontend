import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import MovieListFull from "../components/MovieListFull";
import UserDetails from "../components/UserDetails";

const Profile = () => {
  const { favorites, token, users } = useSelector((state) => state.users);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const hasDetails = useMemo(() => {
    if (!token) return;
    const currentUser = users.find((user) => user.email === token);
    return !!currentUser.details;
  }, [token, users]);

  const userDetails = useMemo(() => {
    if (hasDetails && token)
      return users.find((element) => element.email === token).details;
    return null;
  }, [users, hasDetails]);

  const favoriteMovies = useMemo(() => {
    return favorites.filter((element) => element.email === token);
  }, [favorites]);

  return (
    <div>
      <Box marginX={10}>
        <Stack>
          <Flex>
            <Heading>Favorites</Heading>
            <Button ml={3} onClick={() => onOpen()}>
              Edit preferences
            </Button>
          </Flex>
          <Center>
            <Stack>
              <MovieListFull results={favoriteMovies} />
            </Stack>
          </Center>
        </Stack>
      </Box>
      {isOpen && (
        <UserDetails onClose={onClose} isOpen={isOpen} pref={userDetails} />
      )}
    </div>
  );
};

export default Profile;
