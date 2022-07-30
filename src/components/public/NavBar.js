import { Button, Center } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div>
      <Center marginTop={2}>
        <Link to="/">
          <Button margin={5} background={"red.300"}>
            For You
          </Button>
        </Link>
        <Link to="/discover">
          <Button margin={5} background={"purple.300"}>
            Discover
          </Button>
        </Link>
        <Link to="/profile">
          <Button margin={5} background={"blue.300"}>
            Profile
          </Button>
        </Link>
      </Center>
    </div>
  );
};

export default NavBar;
