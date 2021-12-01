import { useEffect, useState } from "react";
import { MsgResponse } from "./types";

const getMessageTemplate = (response: MsgResponse) => {
  let template = `Estimado ${response.partner.name} ,\n`;
  template += `Remitimos adjunta su *factura ${response.invoice.number}* (link: ${response.invoice.url})`;
  template += `por un importe de S/ ${response.invoice.amount} efectuado por ${response.company}.`;
  return template;
};

const getResponse = async (url: string, key: string): Promise<MsgResponse> => {
  const response = await fetch(url, {
    method: "GET",
    headers: { "x-api-key": key },
  });
  const result = await response.json();
  return result.body as MsgResponse;
};

const getUrlAndKey = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("api") && urlParams.has("key")) {
    return {
      url: urlParams.get("api")!,
      key: urlParams.get("key")!,
    };
  }
  return undefined;
};

function App() {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const executeAsync = async () => {
      const urlAndKey = getUrlAndKey();
      if (!urlAndKey) return;
      const msgResponse = await getResponse(urlAndKey.url, urlAndKey.key);
      setPhone(`+51${msgResponse.partner.mobile}`);
      setMessage(getMessageTemplate(msgResponse));
    };
    executeAsync();
  }, []);

  return (
    <div>
      <a
        href={`https://api.whatsapp.com/send?phone=${phone}&text=${message}`}
        target="_blank"
      >
        Enviar
      </a>
    </div>
  );
}

export default App;
