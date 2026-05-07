import Binance from "binance-api-node";
import { getErrorCodeByBinanceCode } from "../utils/get-error-code-by-binance-code";
import { ProblemDetailsException } from "nest-problem-details-filter";
import { BinanceErrorCode } from "../types/binance-error-code.type";

function handleBinanceError(exception: unknown) {
  const errorCode: BinanceErrorCode = typeof exception === 'object' && exception !== null && 'code' in exception && typeof exception.code === 'number' ?
    getErrorCodeByBinanceCode(exception.code) :
    'UNKNOWN'

  throw new ProblemDetailsException({
    status: 400,
    title: errorCode.toLowerCase().split("_").join(" "),
    type: errorCode.toLowerCase()
  })
}

export function ErrorHandledBinance(...args: Parameters<typeof Binance>) {

  const client = Binance(...args)


  return new Proxy(client, {
    get(target, prop) {

      const originalMethod = target[prop as keyof typeof target]

      if (typeof originalMethod === 'function') {
        return async<TArgs extends any[]>(...args: TArgs) => {
          try {
            return await originalMethod.apply(target, args)
          } catch (e) {
            handleBinanceError(e)
          }
        }
      } else {
        return originalMethod
      }

    }
  })
}


