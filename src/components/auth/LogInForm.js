import { Button, FormControl, FormLabel, Input, Stack } from "@chakra-ui/react";
import React from "react";

const LogInForm = () => {
  return (
    <div>
      <Stack spacing={4}>
        <FormControl id="email">
          <FormLabel>Email address</FormLabel>
          <Input type="email" />
        </FormControl>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <Input type="password" />
        </FormControl>
        <Stack spacing={10}>
          <Button
            bg={"blue.400"}
            color={"white"}
            _hover={{
              bg: "blue.500",
            }}
          >
            Sign in
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default LogInForm;
