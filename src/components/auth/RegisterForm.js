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

import { registerUser } from "../../store/actions";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const { users } = useSelector((state) => state.users);
  const [formData, setFormData] = useState({ password: "", email: "" });
  const [formErrors, setFormErrors] = useState();
  const [hasError, setHasError] = useState();
  const [isSuccess, setIsSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formSchema = useMemo(() => prepareSchema("REGISTER"), []);

  const handleChange = async (e) => {
    setHasError(false);
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
    const isExisting = users.find((user) => user.email === formData.email);
    if (isValid && !isExisting) {
      dispatch(registerUser(formData));
      setIsSuccess(true);
      return setTimeout(() => navigate("/login", { replace: true }), 5000);
    } else if (isExisting) {
      return setHasError(true);
    }
  };

  const renderInputValidationError = (errorKey) => (
    <>
      {formErrors && formErrors[errorKey] && (
        <Text fontSize="xs" color={"red"}>
          {formErrors[errorKey]}
        </Text>
      )}
    </>
  );

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
          {renderInputValidationError("email")}
        </FormControl>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <Input
            value={formData.password}
            name="password"
            onChange={handleChange}
            type="password"
          />
          {renderInputValidationError("password")}
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
            Register
          </Button>
        </Stack>
        {hasError && (
          <Box color={"red.300"}>This user has already been signed up</Box>
        )}
        {isSuccess && (
          <Box color={"green.300"}>
            You successfuly registered to app. You will be redirected to Log In
            in 5 seconds.
          </Box>
        )}
      </Stack>
    </div>
  );
};

export default RegisterForm;
