import { Button, Center } from "@chakra-ui/react";
import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { LogOut } from "../../store/actions";

const NavBar = () => {
  const dispatch = useDispatch();
  return (
    <div>
      <Center marginTop={2}>
        <Link to="/">
          <Button margin={5} background={"orange.300"}>
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
        <Button
          onClick={() => dispatch(LogOut())}
          margin={5}
          background={"red.300"}
        >
          Log Out
        </Button>
      </Center>
    </div>
  );
};

export default NavBar;
