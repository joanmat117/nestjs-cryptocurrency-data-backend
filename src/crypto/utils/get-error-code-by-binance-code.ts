import { ValueOf } from "src/common/types/valueof.type"
import { BinanceErrorCodes } from "../enums/binance-error-codes.enum"
import { BinanceErrorCode } from "../types/binance-error-code.type"

export function getErrorCodeByBinanceCode(currentCode: number): BinanceErrorCode {

  const [errorCode] = (Object
    .entries(BinanceErrorCodes) as [BinanceErrorCode, ValueOf<typeof BinanceErrorCodes>][])
    .find(([, code]) => {
      return code === currentCode
    }) || ['UNKNOWN', BinanceErrorCodes.UNKNOWN]

  return errorCode

}
