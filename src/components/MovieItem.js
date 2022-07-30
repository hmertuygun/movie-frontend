import {
  Box,
  Flex,
  Image,
  Badge,
  Button,
  Heading,
  Stack,
  Center,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { updateKeyword } from "../store/actions";

const MovieItem = ({ data, viewDetails, isNative }) => {
  const { favorites, token } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const isInFavorites = useMemo(() => {
    if (!token) return false;
    return favorites.find((element) => element.imdbID === data.imdbID);
  }, [favorites, viewDetails]);

  const posterUrl = useMemo(() => {
    if (isNative && data.Poster)
      return `https://image.tmdb.org/t/p/original${data.Poster}`;
    return data.Poster;
  }, [data, isNative]);

  const navigateUser = (title) => {
    dispatch(updateKeyword(title));
    return navigate("/discover", { replace: true });
  };

  return (
    <Flex p={3} w="full" alignItems="center" justifyContent="center">
      <Box
        width={"15rem"}
        height={"30rem"}
        maxW="sm"
        rounded="sm"
        shadow="lg"
        position="relative"
      >
        <Center>
          <Image
            src={posterUrl}
            alt={`Poster of ${data.Poster}`}
            height={"20rem"}
            width={"15rem"}
            roundedTop="sm"
          />
        </Center>

        <Box p="6">
          <Box d="flex" alignItems="baseline">
            {data.Year && (
              <Badge
                rounded="full"
                px="2"
                mr={2}
                fontSize="0.8em"
                colorScheme="red"
              >
                {data.Year}
              </Badge>
            )}
            {isInFavorites && (
              <Badge
                rounded="full"
                px="2"
                fontSize="0.8em"
                colorScheme="yellow"
              >
                Favorite
              </Badge>
            )}
            {isNative && (
              <Badge
                rounded="full"
                px="2"
                fontSize="0.8em"
                colorScheme="orange"
              >
                Recommended
              </Badge>
            )}
          </Box>
          <Stack mt="1" justifyContent="space-between" alignContent="center">
            <Box
              fontSize="2xl"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
            >
              <Heading as="h2" size="md" noOfLines={1}>
                {data.Title}
              </Heading>
            </Box>
            <Button
              onClick={() => {
                if (!isNative) return viewDetails(data.imdbID);
                return navigateUser(data.Title);
              }}
            >
              View Movie
            </Button>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};

export default MovieItem;
