import { Button, Wrap } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { getPopularActors } from "../../services/movies";

const ActorSelector = ({ getSelecteds, active }) => {
  const [selected, setSelected] = useState(active ? active : []);
  const [actors, setActors] = useState([]);

  useEffect(() => {
    getSelecteds(selected);
  }, [selected]);

  const getActors = async () => {
    const results = await getPopularActors();
    setActors(results);
  };

  useEffect(() => {
    getActors();
  }, []);

  const isSelected = (actor) => selected.includes(actor);

  const handleClick = (value) => {
    if (isSelected(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  return (
    <div>
      <Wrap spacing={[1, 4]} direction={["column", "row"]}>
        {actors.map((actor) => (
          <Button
            key={actor.name}
            backgroundColor={isSelected(actor.id) ? "blue.700" : "blue.200"}
            color={isSelected(actor.id) ? "white" : "black"}
            onClick={() => handleClick(actor.id)}
          >
            {actor.name}
          </Button>
        ))}
      </Wrap>
    </div>
  );
};

export default ActorSelector;
