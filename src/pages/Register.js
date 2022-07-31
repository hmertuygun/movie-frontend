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
import RegisterForm from "../components/auth/RegisterForm";
import { Link } from "react-router-dom";

const Register = () => {
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
            <Heading fontSize={"4xl"}>Register to Movies App</Heading>
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
            <RegisterForm />
            <Center>
              <Text color={"blue.400"} mt={3}>
                <Link to="/login">Sign In</Link>
              </Text>
            </Center>
          </Box>
        </Stack>
      </Flex>
    </div>
  );
};

export default Register;
