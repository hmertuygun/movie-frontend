import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserDetails } from "../store/users/userActions";
import ActorSelector from "./public/ActorSelector";
import GenreSelector from "./public/GenreSelector";
const UserDetails = ({ onClose, isOpen }) => {
  const { token } = useSelector((state) => state.users);

  const [allItems, setAllItems] = useState({ genre: [], actor: [] });

  const dispatch = useDispatch();

  const handleSubmit = useCallback(() => {
    dispatch(updateUserDetails({ token, allItems }));
    onClose();
  }, [allItems]);

  const setSelected = (type, selected) => {
    setAllItems({ ...allItems, [type]: selected });
  };

  const isButtonDisabled = useMemo(() => {
    return !allItems.genre.length || !allItems.actor.length;
  }, [allItems]);

  return (
    <div>
      <Modal onClose={onClose} size={"xl"} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text color={"blue.400"}>
              Set you details for better recommendations
            </Text>
          </ModalHeader>
          <ModalBody>
            <Stack>
              <Heading size={"md"}>Genre</Heading>
              <GenreSelector
                getSelecteds={(data) => setSelected("genre", data)}
              />
              <Heading size={"md"}>Actors</Heading>
              <ActorSelector
                getSelecteds={(data) => setSelected("actor", data)}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button isDisabled={isButtonDisabled} onClick={handleSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserDetails;
