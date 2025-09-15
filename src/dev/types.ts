export type RpcSuccessResult<result> = {
  method?: undefined;
  result: result;
  error?: undefined;
};

export type RpcErrorResult<error> = {
  method?: undefined;
  result?: undefined;
  error: error;
};

export type RpcResponse<result = any, error = any> = {
  jsonrpc: `${number}`;
  id: number;
} & (RpcSuccessResult<result> | RpcErrorResult<error>);
