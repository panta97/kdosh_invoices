import { useEffect, useState } from "react";
import { CountryCode, COUNTRY_CODES } from "./CountryCodes";
import { FetchStatus, MsgResponse } from "./types";
import WhatsappMD from "./WhatsappMD";

const getMessageTemplate = (response: MsgResponse) => {
  let template = `Estimado ${response.partner.name}, `;
  template += `remitimos adjunta su *factura ${response.invoice.number}* link: ${response.invoice.url} `;
  template += `por un importe de *S/ ${response.invoice.amount}* efectuado por ${response.company}.`;
  return template;
};

const getResponse = async (
  url: string,
  key: string,
  invoiceId: number
): Promise<MsgResponse> => {
  const response = await fetch(`${url}?id=${invoiceId}`, {
    method: "GET",
    headers: { "x-api-key": key },
  });
  const result = await response.json();
  return result.body as MsgResponse;
};

const getParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("api") && urlParams.has("key") && urlParams.has("id")) {
    return {
      url: urlParams.get("api")!,
      key: urlParams.get("key")!,
      invoiceId: Number(urlParams.get("id")!),
    };
  }
  return undefined;
};

function App() {
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>({
    name: "Peru",
    dial_code: "+51",
    code: "PE",
  });
  const [phone, setPhone] = useState("");
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(FetchStatus.IDLE);

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleCountryCode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryCode = COUNTRY_CODES.find(
      (cc) => cc.code === e.target.value
    );
    if (selectedCountryCode) setCountryCode(selectedCountryCode);
  };

  const handleMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMsg = () => {
    if (phone === "") {
      alert("Debe poner un número de teléfono");
      return;
    }
    if (!message) {
      alert("Debe poner un mensaje");
      return;
    }
    window
      .open(
        `https://api.whatsapp.com/send?phone=${countryCode.dial_code}${phone}&text=${message}`,
        "_blank"
      )!
      .focus();
  };

  useEffect(() => {
    const executeAsync = async () => {
      const p = getParams();
      if (!p) return;
      setFetchStatus(FetchStatus.LOADING);
      const msgResponse = await getResponse(p.url, p.key, p.invoiceId);
      if (msgResponse.partner.mobile === "null" || !msgResponse.partner.mobile)
        setPhone("");
      else setPhone(msgResponse.partner.mobile);
      setMessage(getMessageTemplate(msgResponse));
      setFetchStatus(FetchStatus.IDLE);
    };
    executeAsync();
  }, []);

  return fetchStatus === FetchStatus.LOADING ? (
    <div>cargando ...</div>
  ) : (
    <div className="max-w-screen-sm mx-auto mt-2 p-2">
      <div className="flex flex-col items-center space-y-1">
        <label htmlFor="phone">
          Celular:{" "}
          <select value={countryCode.code} onChange={handleCountryCode}>
            {COUNTRY_CODES.map((cc) => (
              <option
                key={cc.code}
                value={cc.code}
              >{`${cc.name} (${cc.dial_code})`}</option>
            ))}
          </select>
          <input
            className="border rounded-md px-1"
            type="number"
            id="phone"
            value={phone}
            onChange={handlePhone}
          />
        </label>
        <label htmlFor="content" className="w-full">
          Mensaje:
          <textarea
            value={message}
            onChange={handleMessage}
            className="border rounded-md py-1 px-3 w-full"
            style={{ height: "100px" }}
          />
        </label>
        <WhatsappMD content={message} />
        <button
          className="border-2 rounded py-1 px-2 cursor-pointer"
          style={{ borderColor: "#00bfa5", color: "#009480" }}
          onClick={handleSendMsg}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default App;
