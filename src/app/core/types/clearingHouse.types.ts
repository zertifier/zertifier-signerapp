export type ClearingHouseApi = {
  url: string;
  proxy?: string;
}

export const APPROVED_CHS = ["GAIA", "ARUBA", "DELTA_DAO"];
export type ApprovedCHs = typeof APPROVED_CHS[number];
export type CHServices = "COMPLIANCE" | "LNR";
export type ClearingHouseList = Record<ApprovedCHs, CHServiceList>;
export type CHServiceList = Record<CHServices, ClearingHouseApi>;
