import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { Response } from "express";
import { BinanceException } from "../types/binance-exception.type";
import { BinanceErrorCodes } from "../enums/binance-error-codes.enum";

const log = new Logger("BinanceExceptionFilter")

Catch()
export class BinanceExceptionFilter implements ExceptionFilter {

  catch(exception: BinanceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()

    log.error("Exception: %o", JSON.stringify(exception, null, 2))

    const [errorMsg] = Object.entries(BinanceErrorCodes).find(([, code]) => {
      return exception.code === code
    }) || ['UNKNOWN', BinanceErrorCodes.UNKNOWN]

    const message = errorMsg.toLowerCase().split('_').join(" ")

    res.status(400).json({
      message,
      error: errorMsg
    })

  }
}
