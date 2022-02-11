import { APCustomAttribute } from "./APCustomAttribute";

export enum TAPAccessLevelValues {
  PRIVATE = 'private',
  INTERNAL = 'internal',
  PUBLIC = 'public'
}

export class APAccessLevelAttribute extends APCustomAttribute {
  private readonly ComponentName = "APAccessLevelAttribute";
  private static AttributeName = "_AP_ACCESS_LEVEL_";
  private static AttributeDisplayName = "Access Level";

  constructor(value: TAPAccessLevelValues) {
    super(APAccessLevelAttribute.AttributeName, APAccessLevelAttribute.AttributeDisplayName, value);
  }

}

