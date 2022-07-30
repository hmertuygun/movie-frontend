import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { validateForm, validateInput } from "../../utils/validateForms";
import prepareSchema from "../../utils/prepareSchema";
import { useDispatch, useSelector } from "react-redux";

import { loginUser } from "../../store/actions";
import { Navigate } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({ password: "", email: "" });
  const [formErrors, setFormErrors] = useState();
  const [hasError, setHasError] = useState();
  const dispatch = useDispatch();
  const { users, token } = useSelector((state) => state.users);

  const formSchema = useMemo(() => prepareSchema("LOGIN"), []);

  const handleChange = async (e) => {
    setFormData((values) => {
      return { ...values, [e.target.name]: e.target.value };
    });

    const inputError = await validateInput(e.target, formSchema);

    setFormErrors((errors) => {
      return { ...errors, ...inputError };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm(formErrors);
    const isUserExists = users.find(
      (user) =>
        user.email === formData.email && user.password === formData.password,
    );

    if (isValid && isUserExists) {
      dispatch(loginUser(formData.email));
    }

    return setHasError(true);
  };

  if (token) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <div>
      <Stack spacing={4}>
        <FormControl id="email">
          <FormLabel>Email address</FormLabel>
          <Input
            name="email"
            onChange={handleChange}
            value={formData.email}
            type="email"
          />
        </FormControl>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <Input
            value={formData.password}
            name="password"
            onChange={handleChange}
            type="password"
          />
        </FormControl>
        <Stack spacing={10}>
          <Button
            bg={"blue.400"}
            color={"white"}
            _hover={{
              bg: "blue.500",
            }}
            onClick={handleSubmit}
          >
            Sign in
          </Button>
        </Stack>

        {hasError && (
          <Box color={"red.300"}>Your email or password is incorrect</Box>
        )}
      </Stack>
    </div>
  );
};

export default RegisterForm;
