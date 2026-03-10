export class MissingSerializedParamsError extends Error {
  constructor(propertyName: string) {
    super(
      `Cannot access '${propertyName}': serializedParams were not provided`,
    );
    this.name = "MissingSerializedParamsError";
  }
}
