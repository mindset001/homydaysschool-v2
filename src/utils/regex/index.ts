export const specialCharRegexImport = /[!@#$%^&*(),.?":{}|<>]/;
export const codeInjectionRegexImport =
  /(eval|function|console|alert|<script|<\/script>|javascript:|onerror|onload|onclick|document\.|window\.|location\.|setTimeout|setInterval|\b(new|throw|catch|while|for|if|else)\b|\b(var|let|const)\b|`|{|}|\(|\))/i;
export const sqlInjectionRegexImport =
  /(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|UNION|SCRIPT|WHERE|FROM|JOIN)\\b|(--|\/\*|\*\/|;|'|"))/i;
export const invalidFullnameCharRegexImport = /[^a-zA-Z\s'-]/;
export const invalidEmailCharRegexImport = /[^a-zA-Z0-9@._%+-]/;
export const emailRegexImport =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const consecutiveDotsRegexImport = /\.{2,}/;
export const commonPasswordsImport = [
  "password",
  "123456",
  "12345678",
  "1234",
  "qwerty",
  "abc123",
];
export const today = new Date().toISOString().split("T")[0];
export const convertToNormalWords = (text: string): string => {
  // Handle camelCase
  const camelCaseToSpaces = text.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Handle snake_case
  const snakeCaseToSpaces = camelCaseToSpaces.replace(/_/g, " ");

  // Convert to lowercase and capitalize the first letter of each word
  const normalWords = snakeCaseToSpaces
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

  return normalWords;
};

export const calculateAge = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const capitaliseCase = (word: string) =>
  word.toLowerCase().replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
