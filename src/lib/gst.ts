// GST on the course. The price we show and store (priceInPaise) is BEFORE tax;
// GST is added on top at checkout and the buyer pays the total.
//
// DFREN Marketing Agency holds a regular GST registration (GSTIN below, from the
// GST REG-06 certificate dated 14 Jan 2026). Online courses from a commercial
// provider are taxed at 18% (SAC 999293, commercial training and coaching). Your
// accountant should confirm the rate and SAC; change GST_RATE_PERCENT here if it
// ever differs and everything (checkout, invoice lines, copy) follows.
export const GST_RATE_PERCENT = 18;
export const GST_SAC = "999293";
export const GSTIN = "33AAYFD6911B1ZI";

/** GST on a pre-tax price, in paise, rounded to the nearest paisa. */
export function gstPaise(basePaise: number): number {
  return Math.round((basePaise * GST_RATE_PERCENT) / 100);
}

/** What the buyer pays: price plus GST, in paise. */
export function totalWithGstPaise(basePaise: number): number {
  return basePaise + gstPaise(basePaise);
}

/** "499" for whole rupees, "588.82" otherwise (en-IN grouping). */
export function rupeesFromPaise(paise: number): string {
  const r = paise / 100;
  return Number.isInteger(r)
    ? r.toLocaleString("en-IN")
    : r.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
