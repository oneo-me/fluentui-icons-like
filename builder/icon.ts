class Icon {
  data: string;
  constructor(public file: string, public key: string, public size: number) {
    this.data = "";
  }
}

class SvgIcon {
  constructor(public file: string, public type: string, public key: string, public size: number) {}
}

export { Icon, SvgIcon };
