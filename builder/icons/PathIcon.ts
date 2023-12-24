import { IIcon } from "./IIcon";

export class PathIcon implements IIcon {
  constructor(public Key: string, public Size: number, public Data: string) {}
}
