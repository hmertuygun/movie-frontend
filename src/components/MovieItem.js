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
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const MovieItem = ({ data, viewDetails }) => {
  const { favorites, token } = useSelector((state) => state.users);

  const isInFavorites = useMemo(() => {
    if (!token) return false;
    return favorites.find((element) => element.imdbID === data.imdbID);
  }, [favorites, viewDetails]);

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
            src={data.Poster}
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
          </Box>
          <Stack mt="1" justifyContent="space-between" alignContent="center">
            <Box
              fontSize="2xl"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              isTruncated
            >
              <Heading as="h2" size="md" noOfLines={1}>
                {data.Title}
              </Heading>
            </Box>
            <Button onClick={() => viewDetails(data.imdbID)}>View Movie</Button>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};

export default MovieItem;
