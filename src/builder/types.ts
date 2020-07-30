
export abstract class ODataDataObject {
  abstract toString(): string;
}

export class ODataDateTimeV4 extends ODataDataObject {

  private constructor(date: Date) {
    super();
    this._date = date;
  }

  static from(date: Date): ODataDateTimeV4;
  static from(date: string): ODataDateTimeV4;
  static from(date: any): ODataDateTimeV4 {
    switch (typeof date) {
      case 'string':
        return new ODataDateTimeV4(new Date(date));
      default:
        return new ODataDateTimeV4(date);
    }
  }

  private _date: Date

  public toString(): string {
    return `${this._date.toISOString()}`;
  }

}

export class ODataDateTimeOffsetV4 extends ODataDataObject {

  private constructor(date: Date) {
    super();
    this._date = date;
  }

  static from(date: Date): ODataDateTimeOffsetV4;
  static from(date: string): ODataDateTimeOffsetV4;
  static from(date: any): ODataDateTimeOffsetV4 {
    switch (typeof date) {
      case 'string':
        return new ODataDateTimeOffsetV4(new Date(date));
      default:
        return new ODataDateTimeOffsetV4(date);
    }
  }


  private _date: Date

  public toString(): string {
    return `${this._date.toISOString()}`;
  }

}
