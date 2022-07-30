import { Center, Input } from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateKeyword } from "../store/actions";

const MovieSearcher = () => {
  const { keyword } = useSelector((state) => state.search);
  const dispatch = useDispatch();
  const handleChange = (e) => {
    dispatch(updateKeyword(e.target.value));
  };

  return (
    <div>
      <Center>
        <Input
          onChange={handleChange}
          width={"30vw"}
          placeholder="Search a keyword"
          size="lg"
          value={keyword}
        />
      </Center>
    </div>
  );
};

export default MovieSearcher;
