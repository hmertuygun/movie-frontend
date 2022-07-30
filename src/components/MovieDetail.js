import {
  Badge,
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tag,
  TagLabel,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GENRES } from "../constants/genres";
import { addFavorites, removeFavorite } from "../store/actions";

const MovieDetail = ({ onClose, isOpen, id }) => {
  const { movieDetails } = useSelector((state) => state.search);
  const { favorites, token } = useSelector((state) => state.users);

  const dispatch = useDispatch();

  const getGenre = (data) => {
    const genre = GENRES.find((element) => element.id === data);
    if (genre) return genre.name;
    return null;
  };

  const isInFavorites = useMemo(() => {
    if (!token) return false;
    return favorites.find((element) => element.imdbID === id);
  }, [favorites, token]);

  const handleFavorite = () => {
    if (!isInFavorites) {
      dispatch(
        addFavorites({
          email: token,
          Title: movieDetails.title,
          imdbID: id,
          genre: movieDetails.genre_ids[0],
          Poster: `https://image.tmdb.org/t/p/original${movieDetails.poster_path}`,
        }),
      );
    } else {
      dispatch(removeFavorite(id));
    }
  };

  return (
    <div>
      <Modal onClose={onClose} size={"xl"} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{movieDetails.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex>
              <Image
                src={`https://image.tmdb.org/t/p/original${movieDetails.poster_path}`}
                alt={`Poster of ${movieDetails.title}`}
                height={"20rem"}
                width={"15rem"}
                roundedTop="sm"
              />
              <Box p={3}>
                <Stack>
                  <Text>{movieDetails.overview}</Text>
                  <Box>
                    {movieDetails.genre_ids &&
                      movieDetails.genre_ids.map(
                        (genre) =>
                          getGenre(genre) && (
                            <Badge ml="1" colorScheme="green">
                              {getGenre(genre)}
                            </Badge>
                          ),
                      )}
                    <Tag
                      my="1"
                      size={"lg"}
                      key={"lg"}
                      variant="subtle"
                      colorScheme="cyan"
                    >
                      <TagLabel>
                        {dayjs(movieDetails.release_date).format(
                          "MMMM DD, YYYY",
                        )}
                      </TagLabel>
                    </Tag>
                  </Box>
                  <Button onClick={handleFavorite} colorScheme="yellow">
                    {isInFavorites
                      ? "Remove from favorites"
                      : "Add to favorites"}
                  </Button>
                </Stack>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MovieDetail;
