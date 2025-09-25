import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from "@prisma/client/runtime/library";
import {
  DatabaseError,
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from "./types";

export function handlePrismaError(error: unknown): never {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2000":
        throw new ValidationError("Value too long for the column type");
      case "P2001":
        throw new NotFoundError("Record does not exist");
      case "P2002":
        throw new ConflictError("Unique constraint violation");
      case "P2003":
        throw new ValidationError("Foreign key constraint violation");
      case "P2004":
        throw new ValidationError("Constraint violation");
      case "P2005":
        throw new ValidationError("Invalid value for field type");
      case "P2006":
        throw new ValidationError("Invalid field value");
      case "P2007":
        throw new ValidationError("Data validation error");
      case "P2008":
        throw new DatabaseError("Failed to parse query");
      case "P2009":
        throw new DatabaseError("Failed to validate query");
      case "P2010":
        throw new DatabaseError("Raw query failed");
      case "P2011":
        throw new ValidationError("Null constraint violation");
      case "P2012":
        throw new ValidationError("Missing required value");
      case "P2013":
        throw new ValidationError("Missing required argument");
      case "P2014":
        throw new ValidationError("Required relation is missing");
      case "P2015":
        throw new NotFoundError("Related record not found");
      case "P2016":
        throw new DatabaseError("Query interpretation error");
      case "P2017":
        throw new DatabaseError("Records not connected");
      case "P2018":
        throw new NotFoundError("Required connected records not found");
      case "P2019":
        throw new ValidationError("Input error");
      case "P2020":
        throw new ValidationError("Value out of range");
      case "P2021":
        throw new DatabaseError("Table does not exist");
      case "P2022":
        throw new DatabaseError("Column does not exist");
      case "P2023":
        throw new DatabaseError("Inconsistent column data");
      case "P2024":
        throw new DatabaseError("Connection pool timeout");
      case "P2025":
        throw new NotFoundError("Record to delete does not exist");
      case "P2026":
        throw new DatabaseError("Unsupported feature");
      case "P2027":
        throw new DatabaseError("Multiple errors occurred");
      case "P2028":
        throw new DatabaseError("Transaction API error");
      case "P2030":
        throw new NotFoundError("Fulltext index not found");
      case "P2031":
        throw new DatabaseError("MongoDB replica set required");
      case "P2033":
        throw new ValidationError("Number out of range");
      case "P2034":
        throw new ConflictError("Transaction conflict");
      default:
        throw new DatabaseError(`Database error: ${error.message}`);
    }
  }

  if (error instanceof PrismaClientValidationError) {
    throw new ValidationError("Invalid query parameters");
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    throw new DatabaseError("Unknown database error occurred");
  }

  if (error instanceof PrismaClientInitializationError) {
    throw new DatabaseError("Database connection failed");
  }

  throw new InternalServerError("Unexpected error occurred");
}
