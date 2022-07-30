export const validateForm = (errors) => {
  return !Object.values(errors).some((error) => typeof error === "string");
};

export const validateInput = (target, schema) => {
  return schema.fields[target.name]
    .validate(target.value)
    .then(() => {
      return { [target.name]: null };
    })
    .catch((error) => {
      return { [target.name]: error.message };
    });
};
