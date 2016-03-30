/**
* This is a straight up copy of react-router's PatternUtils. It may be worth
* investigating if the react-router team is open to splitting this out
* into a separate package
*/

export interface Params {
  [param: string]: string | string[];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeSource(string) {
  return escapeRegExp(string).replace(/\/+/g, '/+')
}

export interface CompiledPattern {
  pattern: string;
  regexpSource: string;
  paramNames: string[];
  tokens: string[];
}

function _compilePattern(pattern: string): CompiledPattern {
  let regexpSource = '';
  const paramNames: string[] = [];
  const tokens: string[] = [];

  let match: RegExpExecArray;
  let lastIndex = 0;
  const matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)/g;

  while ((match = matcher.exec(pattern))) {
    if (match.index !== lastIndex) {
      tokens.push(pattern.slice(lastIndex, match.index));
      regexpSource += escapeSource(pattern.slice(lastIndex, match.index));
    }

    if( match[1] ) {
      regexpSource += '([^/]+)';
      paramNames.push(match[1]);
    }
    else if( match[0] === '**' ) {
      regexpSource += '(.*)';
      paramNames.push('splat');
    }
    else if( match[0] === '*' ) {
      regexpSource += '(.*?)';
      paramNames.push('splat');
    }
    else if( match[0] === '(' ) {
      regexpSource += '(?:';
    }
    else if( match[0] === ')' ) {
      regexpSource += ')?';
    }

    tokens.push(match[0]);
    lastIndex = matcher.lastIndex;
  }

  if( lastIndex !== pattern.length ) {
    tokens.push(pattern.slice(lastIndex, pattern.length))
    regexpSource += escapeSource(pattern.slice(lastIndex, pattern.length))
  }

  return {
    pattern,
    regexpSource,
    paramNames,
    tokens
  };
}

const CompiledPatternsCache: { [pattern: string]: CompiledPattern } = {}

export function compilePattern(pattern) {
  if( !(pattern in CompiledPatternsCache) ) {
    CompiledPatternsCache[pattern] = _compilePattern(pattern);
  }


  return CompiledPatternsCache[pattern];
}

/**
* Attempts to match a pattern on the given pathname. Patterns may use
* the following special characters:
*
* - :paramName     Matches a URL segment up to the next /, ?, or #. The
*                  captured string is considered a "param"
* - ()             Wraps a segment of the URL that is optional
* - *              Consumes (non-greedy) all characters up to the next
*                  character in the pattern, or to the end of the URL if
*                  there is none
* - **             Consumes (greedy) all characters up to the next character
*                  in the pattern, or to the end of the URL if there is none
*
* The return value is an object with the following properties:
*
* - remainingPathname
* - paramNames
* - paramValues
*/
export function matchPattern(pattern: string, pathname: string) {
  // Make leading slashes consistent between pattern and pathname.
  if( pattern.charAt(0) !== '/' ) {
    pattern = `/${pattern}`;
  }
  if( pathname.charAt(0) !== '/' ) {
    pathname = `/${pathname}`;
  }

  let { regexpSource, paramNames, tokens } = compilePattern(pattern);

  regexpSource += '/*'; // Capture path separators

  // Special-case patterns like '*' for catch-all routes.
  if (tokens[tokens.length - 1] === '*') {
    regexpSource += '$';
  }

  const match = pathname.match(new RegExp(`^${regexpSource}`, 'i'));

  let remainingPathname: string;
  let paramValues: string[];

  if( match != null ) {
    const matchedPath = match[0]
    remainingPathname = pathname.substr(matchedPath.length)

    // If we didn't match the entire pathname, then make sure that the match we
    // did get ends at a path separator (potentially the one we added above at
    // the beginning of the path, if the actual match was empty).
    if(
      remainingPathname &&
      matchedPath.charAt(matchedPath.length - 1) !== '/'
    ) {
      return {
        remainingPathname: null,
        paramNames,
        paramValues: null
      };
    }

    paramValues = match.slice(1).map(v => v && decodeURIComponent(v));
  }
  else {
    remainingPathname = paramValues = null;
  }

  return {
    remainingPathname,
    paramNames,
    paramValues
  };
}

export function getParamNames(pattern: string) {
  return compilePattern(pattern).paramNames;
}

export function getParams(pattern: string, pathname: string) {
  const { paramNames, paramValues } = matchPattern(pattern, pathname);

  if (paramValues != null) {
    return paramNames.reduce(function (memo, paramName, index) {
      memo[paramName] = paramValues[index];
      return memo;
    }, {});
  }

  return null;
}

/**
* Returns a version of the given pattern with params interpolated. Throws
* if there is a dynamic segment of the pattern for which there is no param.
*/
export function formatPattern(pattern: string, params: Params = {}) {
  const { tokens } = compilePattern(pattern);
  let parenCount = 0;
  let pathname = '';
  let splatIndex = 0;

  let token: string;
  let paramName: string;
  let paramValue;

  for(let i = 0, len = tokens.length; i < len; ++i) {
    token = tokens[i]

    if (token === '*' || token === '**') {
      paramValue = Array.isArray(params['splat']) ?
        params['splat'][splatIndex++] :
        params['splat'];

      if( paramValue != null || parenCount > 0 ) {
        console.error('Missing splat #%s for path "%s"',   splatIndex, pattern);
      }

      if( paramValue != null ) {
        pathname += encodeURI(paramValue);
      }
    }
    else if( token === '(' ) {
      parenCount += 1
    }
    else if( token === ')' ) {
      parenCount -= 1
    }
    else if( token.charAt(0) === ':' ) {
      paramName = token.substring(1);
      paramValue = params[paramName];

      if( paramValue != null || parenCount > 0 ) {
        console.error('Missing "%s" parameter for path "%s"',
        paramName, pattern);
      }

      if( paramValue != null ) {
        pathname += encodeURIComponent(paramValue);
      }
    }
    else {
      pathname += token;
    }
  }

  return pathname.replace(/\/+/g, '/');
}
