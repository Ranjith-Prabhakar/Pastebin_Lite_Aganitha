import { headers } from "next/headers";

export async function getNow() {
  if (process.env.TEST_MODE !== "1") {
    return new Date();
  }

  const h = await headers();

  const testNow =
    typeof h?.get === "function"
      ? h.get("x-test-now-ms")
      : h?.["x-test-now-ms"];

  if (testNow) {
    const ms = Number(testNow);
    if (!Number.isNaN(ms)) {
      return new Date(ms);
    }
  }

  return new Date();
}
