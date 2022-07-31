import {
  Center,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateMovieDetails } from "../store/actions";
import MovieDetail from "./MovieDetail";
import MovieItem from "./MovieItem";

const MovieListFull = ({ results, isHome }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { error } = useSelector((state) => state.search);
  const toast = useToast();
  const dispatch = useDispatch();

  const [viewDetails, setViewDetails] = useState(null);

  useEffect(() => {
    if (viewDetails) {
      dispatch(updateMovieDetails(viewDetails));
    }
  }, [viewDetails]);

  useEffect(() => {
    if (error) {
      toast({
        title: error,
        variant: "solid",
        isClosable: true,
      });
    }
  }, [error]);

  return (
    <div>
      <Center>
        <Wrap spacing="5px">
          {results ? (
            results.map((movie) => (
              <WrapItem key={movie.imdbID} margin={3}>
                <MovieItem
                  data={movie}
                  isNative={isHome}
                  viewDetails={(id) => {
                    onOpen();
                    setViewDetails(id);
                  }}
                />
              </WrapItem>
            ))
          ) : (
            <Center>NO RESULT</Center>
          )}
        </Wrap>
        {!error && viewDetails && (
          <MovieDetail
            onClose={() => {
              setViewDetails(null);
              onClose();
            }}
            isOpen={isOpen}
            id={viewDetails}
          />
        )}
      </Center>
    </div>
  );
};

export default MovieListFull;
