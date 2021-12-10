export type Invoice = {
  url: string;
  number: string;
  amount: number;
};

export type Partner = {
  mobile: string;
  name: string;
};

export type MsgResponse = {
  company: string;
  invoice: Invoice;
  partner: Partner;
};

export enum FetchStatus {
  IDLE,
  LOADING,
}
