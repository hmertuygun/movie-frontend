import React from "react";
import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import LogInForm from "../components/auth/LogInForm";
import { Link } from "react-router-dom";

const LogIn = () => {
  return (
    <div>
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Sign in to Movies App</Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              all about movies for you 🍿
            </Text>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <LogInForm />
            <Center>
              <Text color={"blue.400"} mt={3}>
                <Link to="/register">Register</Link>
              </Text>
            </Center>
          </Box>
        </Stack>
      </Flex>
    </div>
  );
};

export default LogIn;
