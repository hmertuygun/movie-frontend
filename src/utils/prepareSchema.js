import * as yup from "yup";
import { FORM_ELEMENTS } from "../constants/formElements";
import { FORMS } from "../constants/forms";

const prepareSchema = (formName) => {
  let preparedSchema = {};
  FORMS[formName].forEach((field) => {
    preparedSchema[field] = FORM_ELEMENTS[field];
  });
  return yup.object().shape(preparedSchema);
};

export default prepareSchema;
