import * as yup from "yup";

export const FORM_ELEMENTS = {
  email: yup
    .string()
    .email("Please enter an email address")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Password must be at least 5 characters long"),
};
