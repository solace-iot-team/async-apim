import { TAPAttribute } from "./APAttributesService";


export abstract class APCustomAttribute {
  private readonly BaseComponentName = "APCustomAttribute";

  private _name: string;
  private _displayName: string;
  private _value: string;

  constructor(name: string, displayName: string, value: string) {
    this._name = name;
    this._displayName = displayName;
    this._value = value;
  }

  public get name() {
    return this._name;
  }

  public get displayName() {
    return this._displayName;
  }

  public get value() {
    return this._value;
  }
  // public set value(value: string) {
  //   this._value = value;
  // }

  public get apAttribute(): TAPAttribute {
    return {
      name: this._name,
      value: this._value
    }
  }

  public get connectorApiFilter(): string {
    return `"${this._name}" "${this._value}"`;
  }
}

