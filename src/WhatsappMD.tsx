enum TokenType {
  NORMAL,
  ITALIC,
  BOLD,
  STRIKETHROUGH,
  MONOSPACE,
  URL,
}

interface Token {
  type: TokenType;
  content: string;
}

const getTokens = (text: string): Token[] => {
  const tokens: Token[] = [];

  const matchPattern =
    /\*[^]+?\*|_[^]+?_|~[^]+?~|```[^]+?```|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

  let fromIndex = 0,
    toIndex = 0;
  let result: RegExpExecArray | null;

  while ((result = matchPattern.exec(text)) !== null) {
    toIndex = result.index;
    tokens.push({
      type: TokenType.NORMAL,
      content: text.substring(fromIndex, toIndex),
    });
    // +1-1 to get rid of markers
    fromIndex = result.index + 1;
    toIndex = result.index + result[0].length - 1;
    // get first character of matched pattern
    const firstCharMatch = result[0][0];
    let token: Token | undefined;
    switch (firstCharMatch) {
      case "*":
        token = {
          type: TokenType.BOLD,
          content: text.substring(fromIndex, toIndex),
        };
        break;
      case "_":
        token = {
          type: TokenType.ITALIC,
          content: text.substring(fromIndex, toIndex),
        };
        break;
      case "~":
        token = {
          type: TokenType.STRIKETHROUGH,
          content: text.substring(fromIndex, toIndex),
        };
        break;
      case "`":
        token = {
          type: TokenType.MONOSPACE,
          content: text.substring(fromIndex + 2, toIndex - 2),
        };
        break;
      case "h":
        token = {
          type: TokenType.URL,
          content: text.substring(fromIndex - 1, toIndex + 1),
        };
        break;
    }
    if (token) tokens.push(token);
    fromIndex = toIndex + 1;
  }
  tokens.push({
    type: TokenType.NORMAL,
    content: text.substring(fromIndex, text.length),
  });
  return tokens;
};

interface WhatsappMDProps {
  content: string;
}

function WhatsappMD({ content }: WhatsappMDProps) {
  const tokens = getTokens(content);
  return (
    <div
      style={{ backgroundColor: "#DCF8C6", width: "500px" }}
      className="rounded-md py-2 px-3 text-sm break-words whitespace-pre-wrap"
    >
      {tokens.map((token, index) => {
        switch (token.type) {
          case TokenType.NORMAL:
            return <span key={index}>{token.content}</span>;
          case TokenType.BOLD:
            return (
              <span key={index} className="font-bold">
                {token.content}
              </span>
            );
          case TokenType.ITALIC:
            return (
              <span key={index} className="italic">
                {token.content}
              </span>
            );
          case TokenType.STRIKETHROUGH:
            return (
              <span key={index} className="line-through">
                {token.content}
              </span>
            );
          case TokenType.MONOSPACE:
            return (
              <span key={index} className="font-mono">
                {token.content}
              </span>
            );
          case TokenType.URL:
            return (
              <a
                style={{ color: "#039BE5" }}
                key={index}
                className="cursor-pointer hover:underline"
                href={token.content}
                target="_blank"
              >
                {token.content}
              </a>
            );
        }
      })}
    </div>
  );
}

export default WhatsappMD;
