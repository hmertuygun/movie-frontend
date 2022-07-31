/* eslint-disable no-async-promise-executor */
import { Box, Heading, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import MovieListFull from "../components/MovieListFull";
import UserDetails from "../components/UserDetails";
import { getRecomendations } from "../services/movies";

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { token, users } = useSelector((state) => state.users);
  const [allResults, setAllResults] = useState([]);

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

  const setRecomendations = async () => {
    const { genre, actor } = userDetails;

    const res = await getRecomendations(genre, actor);
    const data = res.map((movie) => {
      return {
        Poster: movie.poster_path,
        Title: movie.title,
        imdbID: movie.id,
      };
    });
    setAllResults([...allResults, ...data]);
  };

  useEffect(() => {
    if (!hasDetails) onOpen();
  }, [hasDetails]);

  useEffect(() => {
    if (!hasDetails) return;
    setRecomendations();
  }, [hasDetails]);

  return (
    <div>
      <Box m={5}>
        <Heading>Recommended For You</Heading>
        <MovieListFull
          isHome={true}
          results={allResults.sort(() => Math.random() - 0.5)}
        />
        {!hasDetails && <UserDetails onClose={onClose} isOpen={isOpen} />}
      </Box>
    </div>
  );
};

export default Home;
