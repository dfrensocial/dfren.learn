// Checking engine: given a screenshot or frame grab from a suspicious clip,
// recovers the embedded watermark id (if any) using the same blind
// differential-luminance scheme as scripts/watermark-poc/lib.ts.
//
// Usage: npx tsx scripts/watermark-check.ts <image-path> [expectedPayloadLength]

export {};

async function main() {
  const { decode } = await import("./watermark-poc/lib");
  const path = await import("node:path");

  const [, , imagePath, payloadLenArg] = process.argv;
  if (!imagePath) {
    console.error("Usage: npx tsx scripts/watermark-check.ts <image-path> [expectedPayloadLength]");
    process.exit(1);
  }

  const expectedPeriod = payloadLenArg ? 16 + Number(payloadLenArg) * 8 : undefined;
  const result = await decode({ input: path.resolve(imagePath), expectedPeriod });

  if (result.text) {
    console.log(`Watermark found: "${result.text}"  (bit period ${result.period})`);
    console.log("Look this id up in the watermarks collection to identify the viewer it was issued to.");
  } else {
    console.log("No watermark recovered from this image.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
