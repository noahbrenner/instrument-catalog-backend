import type { IInstrument } from "#db/instrument";

export function isTruthyObject(arg: unknown): arg is Record<string, unknown> {
  return typeof arg === "object" && arg !== null;
}

export function isInstrumentWithUserDefinedFields(
  arg: unknown
): arg is Omit<IInstrument, "id" | "userId"> &
  Partial<Pick<IInstrument, "id" | "userId">> {
  return (
    isTruthyObject(arg) &&
    (typeof arg.id === "number" || arg.id === undefined) &&
    typeof arg.categoryId === "number" &&
    (typeof arg.userId === "string" || arg.userId === undefined) &&
    typeof arg.name === "string" &&
    typeof arg.summary === "string" &&
    typeof arg.description === "string" &&
    typeof arg.imageUrl === "string"
  );
}
