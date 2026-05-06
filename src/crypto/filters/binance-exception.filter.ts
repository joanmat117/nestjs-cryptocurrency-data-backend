import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { Response } from "express";
import { BinanceException } from "../types/binance-exception.type";
import { getErrorCodeByBinanceCode } from "../utils/get-error-code-by-binance-code";
import { IProblemDetail } from "node_modules/nest-problem-details-filter/dist";

const log = new Logger("BinanceExceptionFilter")

Catch()
export class BinanceExceptionFilter implements ExceptionFilter {

  catch(exception: BinanceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()

    log.error("Exception:", JSON.stringify(exception, null, 2))

    const errorCode = getErrorCodeByBinanceCode(exception.code)

    const response: IProblemDetail = {
      status: 400,
      title: errorCode.toLowerCase().split("_").join(" "),
      type: errorCode.toLowerCase()
    }

    res.status(400).json(response)

  }
}
