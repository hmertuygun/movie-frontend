import { validateForm, validateInput } from '../validateForms';
import * as yup from 'yup';

describe('validateForm', () => {
  test('returns true when all errors are null', () => {
    const errors = { email: null, password: null };
    expect(validateForm(errors)).toBe(true);
  });

  test('returns false when any error string exists', () => {
    const errors = { email: 'Invalid email', password: null };
    expect(validateForm(errors)).toBe(false);
  });
});

describe('validateInput', () => {
  const schema = yup.object().shape({
    username: yup
      .string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
  });

  test('resolves with null when input is valid', async () => {
    const target = { name: 'username', value: 'john' };
    await expect(validateInput(target, schema)).resolves.toEqual({ username: null });
  });

  test('returns error message when input is invalid', async () => {
    const target = { name: 'username', value: 'jo' };
    await expect(validateInput(target, schema)).resolves.toEqual({
      username: 'Username must be at least 3 characters',
    });
  });
});
