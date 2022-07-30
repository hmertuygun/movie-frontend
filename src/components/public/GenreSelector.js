import { Button, Checkbox, CheckboxGroup, Stack, Wrap } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { GENRES } from "../../constants/genres";

const GenreSelector = ({ getSelecteds, active }) => {
  console.log(active);
  const [selected, setSelected] = useState(active ? active : []);

  useEffect(() => {
    getSelecteds(selected);
  }, [selected]);

  const isSelected = (genre) => selected.includes(genre);

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
        {GENRES.map((genre) => (
          <Button
            key={genre.name}
            backgroundColor={isSelected(genre.id) ? "green.700" : "green.200"}
            color={isSelected(genre.id) ? "white" : "black"}
            onClick={() => handleClick(genre.id)}
          >
            {genre.name}
          </Button>
        ))}
      </Wrap>
    </div>
  );
};

export default GenreSelector;
