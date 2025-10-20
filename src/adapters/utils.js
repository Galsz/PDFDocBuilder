const isPlainObject = (value) => {
  if (value === null || typeof value !== "object") return false;
  return Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null;
};

const cloneDeep = (value) => {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
};

const ensureObject = (value, fallback = {}) => {
  if (isPlainObject(value)) return { ...value };
  return isPlainObject(fallback) ? { ...fallback } : {};
};

const ensureArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value.map((item) => cloneDeep(item));
  if (Array.isArray(fallback)) return fallback.map((item) => cloneDeep(item));
  return [];
};

const ensureString = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const ensureNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const coerced = Number(value);
    if (Number.isFinite(coerced)) return coerced;
  }
  return fallback;
};

const ensureBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return fallback;
};

const mergeDefaults = (defaults, raw) => {
  const base = isPlainObject(defaults) ? cloneDeep(defaults) : {};
  const source = ensureObject(raw);
  return { ...base, ...source };
};

const normalizeList = (value) => ensureArray(value).filter((item) => item !== undefined && item !== null);

module.exports = {
  cloneDeep,
  ensureArray,
  ensureBoolean,
  ensureNumber,
  ensureObject,
  ensureString,
  isPlainObject,
  mergeDefaults,
  normalizeList,
};
