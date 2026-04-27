export interface EnvVariable {
  id: string;
  key: string;
  value: string;
}

export interface EnvVariableInput {
  key: string;
  value: string;
}

export interface EnvVariablesResponse {
  data: EnvVariable[];
}
