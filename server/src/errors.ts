// 1. An Error that also carries an HTTP STATUS CODE.
//    Routes can simply `throw new HttpError(409, 'Out of stock')` from anywhere, even deep
//    inside a database transaction. Express 5 sends the thrown error to the error handler in
//    index.ts, which turns it into  res.status(409).json({ error: 'Out of stock' }).
//    Any OTHER error is unexpected (a bug, the database is down...) and becomes a generic 500.
export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// 2. Shared check for ids that come from the URL or the body.
//    2147483647 is the largest Postgres INTEGER; bigger would make the query itself crash.
export function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 2147483647
}
