import * as pathToRegexp from 'path-to-regexp';

export interface Params {
  [param: string]: string | string[];
}

export interface CompiledPattern {
  pattern: string;
  regexpSource: string;
  paramNames: string[];
  tokens: string[];
}

const REGEXP_CACHE = new Map<string, { regexp: RegExp, keys: any[] }>();
const COMPILED_CACHE = new Map<string, (params: Params) => string>();

export function getRegexp(pattern: string) {
  if (!REGEXP_CACHE.has(pattern)) {
    const keys = [];
    const regexp = pathToRegexp(pattern, keys, { end: false });
    REGEXP_CACHE.set(pattern, { keys, regexp });
  }

  return REGEXP_CACHE.get(pattern);
}

export function getCompiled(pattern: string) {
  if (!COMPILED_CACHE.has(pattern)) {
    COMPILED_CACHE.set(pattern, pathToRegexp.compile(pattern));
  }

  return COMPILED_CACHE.get(pattern);
}

export function matchPattern(pattern: string, pathname: string) {
  if ( pattern.charAt(0) !== '/' ) {
    pattern = `/${pattern}`;
  }

  const compiled = getRegexp(pattern);
  const match = compiled.regexp.exec(pathname);

  if (!match) {
    return {
      remainingPathname: null,
      paramNames: [],
      paramValues: []
    };
  }

  return {
    remainingPathname: pathname.substr(match[0].length),
    paramNames: compiled.keys.map(({ name }) => name),
    paramValues: match.slice(1).map(value => value && decodeURIComponent(value))
  };
}

export function getParamNames(pattern: string) {
  return getRegexp(pattern).keys.map(({ name }) => name);
}

export function makeParams(paramNames: (string | number)[], paramValues: any[]): Params {
  const params: Params = {};
  let lastIndex = 0;

  paramNames.forEach(function(paramName, index) {
    if (typeof paramName === 'number') {
      paramName = lastIndex++;
    }

    params[paramName] = paramValues && paramValues[index];
  });

  return params;
}

export function getParams(pattern: string, pathname: string) {
  const { remainingPathname, paramNames, paramValues } = matchPattern(pattern, pathname);

  if (remainingPathname === null) {
    return null;
  }

  return makeParams(paramNames, paramValues);
}


export function formatPattern(pattern: string, params: Params = {}) {
  return getCompiled(pattern)(params);
}
