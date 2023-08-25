class Domain {
  constructor(private _name: string) {}
  get name() {
    return this._name
  }
  set name(value) {
    this._name = value
  }

  public login() {
    return true
  }

  public logout() {
    return true
  }

  public hasRoot() {
    return true
  }
}

export default Domain
