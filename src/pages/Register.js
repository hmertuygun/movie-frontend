import React from "react";
import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import RegisterForm from "../components/auth/RegisterForm";

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
          </Box>
        </Stack>
      </Flex>
    </div>
  );
};

export default Register;
