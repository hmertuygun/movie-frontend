import React, { useMemo, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { validateForm, validateInput } from "../../utils/validateForms";
import prepareSchema from "../../utils/prepareSchema";
import { useDispatch } from "react-redux";

import { registerUser } from "../../store/actions";

const RegisterForm = () => {
  const [formData, setFormData] = useState({ password: "", email: "" });
  const [formErrors, setFormErrors] = useState();
  const dispatch = useDispatch();

  const formSchema = useMemo(() => prepareSchema("REGISTER"), []);

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
    if (isValid) {
      dispatch(registerUser(formData));
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
            Sign in
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default RegisterForm;
