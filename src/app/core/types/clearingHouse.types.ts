export type ClearingHouseApi = {
  url: string;
  proxy?: string;
}
export type ApprovedCHs = "GAIA" | "ARUBA" | "DELTA_DAO";
// TODO Its for selectors I am too lazy to rewrite right now
export const ApprovedCHsOptions = ["GAIA", "ARUBA", "DELTA_DAO"];
export type CHServices = "COMPLIANCE" | "LNR";
export type ClearingHouseList = Record<ApprovedCHs, CHServiceList>;
export type CHServiceList = Record<CHServices, ClearingHouseApi>;
