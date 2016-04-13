declare module 'path-to-regexp' {
  function pathToRegexp(path: string, values: any[], options?: pathToRegexp.IOptions): RegExp;

  namespace pathToRegexp {
    interface IOptions {
      sensitive?: boolean;
      strict?: boolean;
      end?: boolean;
    }

    interface IToken {
      name: string | number;
      prefix: string;
      delimiter: string;
      optional: boolean;
      repeat: boolean;
      pattern: string;
    }

    interface CompiledRegExp extends RegExp {
      keys: IToken[];
    }

    function parse(path: string): Array<string | IToken>;
    function compile(path: string): (params: any) => string;
    function tokensToRegExp(tokens: Array<string | IToken>): RegExp;
    function tokensToFunction(tokens: Array<string | IToken>): (params: any) => string;
  }

  export = pathToRegexp;
}
