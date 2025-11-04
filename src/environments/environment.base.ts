export type EnvironmentType = 'development' | 'local' | 'production';


export interface EnvironmentBase{
  configuration: EnvironmentType;
  zertifierFileApiToken?: string;
  zertifierFileApiUrl?: string;
}


export const environmentBase: EnvironmentBase = {
  configuration: "local",
}
