import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { Response } from "express"

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const res: Response = context.getResponse()
    const dbCode = exception.code 

    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      console.log({
        message: `Prisma Error`,
        code: dbCode,
        exception
      })
    }

    const fields = this.extractConstraintFields(exception)
    let message = "Internal Server Error"
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR

    switch (dbCode) {
      // Unique constraint violation
      case "P2002":
        message = `The field ${fields.join(", ")} already exists and must be unique`
        statusCode = HttpStatus.CONFLICT
        break

      // Record not found
      case "P2001":
      case "P2025":
        message = "The requested record was not found"
        statusCode = HttpStatus.NOT_FOUND
        break

      // Foreign key constraint failed
      case "P2003":
        message = "Cannot perform this operation because it references a non-existent record"
        statusCode = HttpStatus.BAD_REQUEST
        break

      // Constraint failed on the database
      case "P2004":
        message = "Database constraint violation"
        statusCode = HttpStatus.BAD_REQUEST
        break

      // Invalid value for a field
      case "P2005":
      case "P2006":
      case "P2007":
      case "P2008":
      case "P2009":
      case "P2010":
      case "P2011":
      case "P2012":
      case "P2013":
      case "P2014":
      case "P2015":
        message = "Invalid data provided for one or more fields"
        statusCode = HttpStatus.BAD_REQUEST
        break

      // Relation violation
      case "P2016":
      case "P2017":
      case "P2018":
      case "P2019":
      case "P2020":
        message = "Invalid relation between records"
        statusCode = HttpStatus.BAD_REQUEST
        break

      // Unique constraint failed on a relation
      case "P2021":
      case "P2022":
        message = "Table or column does not exist"
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR
        break

      // Database connection errors
      case "P2024":
        message = "Database connection timeout"
        statusCode = HttpStatus.SERVICE_UNAVAILABLE
        break

      // Query parsing error
      case "P2026":
      case "P2027":
      case "P2028":
        message = "Database query error"
        statusCode = HttpStatus.BAD_REQUEST
        break

      // Transaction errors
      case "P2029":
      case "P2030":
      case "P2031":
      case "P2032":
      case "P2033":
        message = "Transaction error"
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR
        break

      // Value too long for field
      case "P2034":
        message = "Value too long for field"
        statusCode = HttpStatus.BAD_REQUEST
        break

      default:
        // Log unexpected errors in production too
        console.error(`Unhandled Prisma error code: ${dbCode}`, exception)
        message = "Database operation failed"
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR
        break
    }

    const errorResponse: any = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    }

    // Añadir código de error solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.errorCode = dbCode
    }

    res.status(statusCode).json(errorResponse)
  }

  private extractConstraintFields(exception: PrismaClientKnownRequestError): string[] {
    try {
      const meta = exception.meta as any;
      
      if (meta?.cause?.constraint?.fields) {
        return meta.cause.constraint.fields;
      }
      
      if (meta?.target) {
        return Array.isArray(meta.target) ? meta.target : [meta.target];
      }
      
      const messageMatch = exception.message.match(/fields: \(`([^`]+)`\)/);
      if (messageMatch) {
        return [messageMatch[1]];
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }
}
