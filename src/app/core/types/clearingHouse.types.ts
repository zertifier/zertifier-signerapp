export type ClearingHouseApi = {
  url: string;
  proxy?: string;
}

export const APPROVED_CHS = ["GAIA", "ARUBA", "DELTA_DAO"];
export type ApprovedCHs = typeof APPROVED_CHS[number];
export type CHServices =
  "COMPLIANCE_V1"
  | "LNR_V1"
  | "LNR_V2"
  | "COMPLIANCE_V2_STANDARD"
  | "LABEL_V2_1"
  | "LABEL_V2_2"
  | "LABEL_V2_3";
export type ClearingHouseList = Record<ApprovedCHs, CHServiceList>;
export type CHServiceList = Partial<Record<CHServices, ClearingHouseApi>>;
