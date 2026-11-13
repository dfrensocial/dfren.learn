// GST on the course. The price we show and store (priceInPaise) is what the
// buyer PAYS, GST included: ₹599. The pre-tax value and the GST are worked out
// from it, never the other way round, so the total is always exactly the
// advertised price (a "base + 18%" calculation would land on odd paise).
//
// DFREN Marketing Agency holds a regular GST registration (GSTIN below, from the
// GST REG-06 certificate dated 14 Jan 2026). Online courses from a commercial
// provider are taxed at 18% (SAC 999293, commercial training and coaching). Your
// accountant should confirm the rate and SAC; change GST_RATE_PERCENT here if it
// ever differs and everything (checkout, invoice lines, copy) follows.
export const GST_RATE_PERCENT = 18;
export const GST_SAC = "999293";
export const GSTIN = "33AAYFD6911B1ZI";

export type GstSplit = { totalPaise: number; basePaise: number; gstPaise: number };

/**
 * Splits a GST-inclusive price (paise) into its pre-tax value and the GST.
 * base = total / (1 + rate), rounded to the nearest paisa; GST = total - base.
 * ₹599 (59900) -> base 50763 (₹507.63) + GST 9137 (₹91.37) = 59900.
 */
export function splitInclusivePaise(totalPaise: number): GstSplit {
  const basePaise = Math.round((totalPaise * 100) / (100 + GST_RATE_PERCENT));
  return { totalPaise, basePaise, gstPaise: totalPaise - basePaise };
}

/** "599" for whole rupees, "507.63" otherwise (en-IN grouping). */
export function rupeesFromPaise(paise: number): string {
  const r = paise / 100;
  return Number.isInteger(r)
    ? r.toLocaleString("en-IN")
    : r.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
