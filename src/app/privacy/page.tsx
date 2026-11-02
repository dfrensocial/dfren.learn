import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { PrivacySettingsLink } from "@/components/consent/privacy-settings-link";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = { title: "Privacy policy — dfrenLearn" };

const th = "border border-neutral-300 bg-neutral-50 px-2 py-1.5 align-top font-semibold text-black";
const td = "border border-neutral-300 px-2 py-1.5 align-top";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <section>
        <p>
          We&apos;re a small team and we run this site on data. Not to chase you, but to find what&apos;s broken,
          see what visitors actually need, and make the course better. Some of that data is needed to run your
          account. Some is optional, and the optional part stays off until you switch it on. This page tells you
          which is which, plainly.
        </p>
        <p className="mt-2 text-neutral-500">Policy version {LEGAL.privacyVersion}. In effect for India.</p>
      </section>

      <section>
        <h2>The short version</h2>
        <ul>
          <li>We need your email, your order details and a few security records to give you the course. That part isn&apos;t optional.</li>
          <li>Analytics and session recordings are optional. They&apos;re off until you accept them on the banner.</li>
          <li>Decline, or send a Global Privacy Control or Do Not Track signal, and none of the optional tools load.</li>
          <li>Ticking the Terms box at sign-in or checkout does not turn on analytics. The two are separate.</li>
          <li>We don&apos;t sell your data and we don&apos;t use it for advertising.</li>
          <li>
            You can change your mind any time with <PrivacySettingsLink className="underline" />, or ask us to
            delete your data.
          </li>
        </ul>
      </section>

      <section>
        <h2>Who we are</h2>
        <p>
          {LEGAL.entity}, {LEGAL.entityType}, {LEGAL.address}. We run dfrenLearn at {LEGAL.website} and decide why and how your
          data is used. In law that makes us the data fiduciary. You can reach us at{" "}
          <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>
          .
        </p>
      </section>

      <section>
        <h2>What we collect to run the course (not optional)</h2>
        <p>
          When you tick &ldquo;I&apos;m 18 or older, I agree to the Terms and I&apos;ve read the Privacy Policy&rdquo;
          at sign-in or before paying, you agree to us handling the data below, because the service can&apos;t
          work without it. Nothing here is used for anything beyond the reason given.
        </p>
        <ul>
          <li>
            <strong>Your email address and account.</strong> It&apos;s how you sign in (a link sent to your
            inbox, no password) and where support replies go. Accounts live in Google Firebase.
          </li>
          <li>
            <strong>Your orders.</strong> Course, amount, payment status, the type of payment (card, UPI,
            netbanking, wallet), the bank, wallet or card-network name, and, if a payment fails, the reason
            Razorpay gives. We never see or store card numbers, UPI IDs or phone numbers. Razorpay handles those.
          </li>
          <li>
            <strong>Unfinished checkouts.</strong> If you enter your email and start paying but don&apos;t finish,
            we still keep that order record (email, amount, status). It helps us fix payment problems.
          </li>
          <li>
            <strong>Your access.</strong> Which course you own, when you bought it, and the payment ID.
          </li>
          <li>
            <strong>Your progress.</strong> While you watch, your place in each lesson is saved to our servers
            about every 20 seconds, so you can pick up where you left off on any device. We also log course
            downloads.
          </li>
          <li>
            <strong>Security records.</strong> Your IP address and browser details each time a sign-in session
            is issued or refreshed (roughly every 12 hours of use), plus which lesson is streaming from which
            session. We use these to enforce the 2-stream limit, spot account sharing and investigate abuse.
          </li>
          <li>
            <strong>Proof you agreed.</strong> The version of the Terms and Privacy Policy you accepted, and
            when, stored on your account or order.
          </li>
          <li>
            <strong>On your device:</strong> a sign-in session cookie (5 days), your sign-in state (until you sign
            out; we also sign you out 30 days after your last real sign-in), your email while a sign-in link is
            pending (we delete it after 24 hours), and your resume position.
          </li>
          <li>
            <strong>Reaching out about a stuck payment.</strong> If a payment fails or you leave mid-checkout,
            we may email you once to help. That&apos;s support, not marketing. Reply &ldquo;stop&rdquo; and we
            won&apos;t write again. We send no marketing email without a separate yes from you. Today we send
            sign-in links and support replies only.
          </li>
        </ul>
      </section>

      <section>
        <h2>Optional: analytics and session recordings</h2>
        <p>
          These are the business decisions behind the banner. We want to know where visitors come from, which
          pages lose them, where checkout trips people up and whether lessons are working. Each tool below is off
          until you accept it. Decline and it never loads, sets no cookies, and stores nothing about you.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className={th}>Tool</th>
                <th className={th}>What it sees</th>
                <th className={th}>Why we use it</th>
                <th className={th}>Needs your OK?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={td}>
                  <strong>Analytics:</strong> Google Analytics 4 (through Firebase)
                </td>
                <td className={td}>
                  Pages viewed, clicks like Enroll, lesson start, progress and completion, downloads, your device
                  and browser, and an approximate location worked out by Google from your IP address.
                </td>
                <td className={td}>To see what&apos;s working, which pages and sources bring buyers, and where people drop off.</td>
                <td className={td}>Yes. Off by default.</td>
              </tr>
              <tr>
                <td className={td}>
                  <strong>Analytics:</strong> where you came from (stored on your device)
                </td>
                <td className={td}>
                  The campaign tags or referring site of your first and latest visit, the page you landed on, and
                  how many visits you&apos;ve made.
                </td>
                <td className={td}>To learn which channels actually lead to students.</td>
                <td className={td}>Yes.</td>
              </tr>
              <tr>
                <td className={td}>
                  <strong>Analytics:</strong> extra details on your order
                </td>
                <td className={td}>
                  If you start checkout, the same source details, your Google Analytics ID, your approximate
                  country and region, and whether you used mobile or desktop are saved with the order.
                </td>
                <td className={td}>To tell which sources and devices lead to completed payments.</td>
                <td className={td}>
                  Yes. Without it, the order stores none of this.
                </td>
              </tr>
              <tr>
                <td className={td}>
                  <strong>Analytics:</strong> purchase and refund counts
                </td>
                <td className={td}>
                  Our server tells Google Analytics that an order was paid or refunded, using the order ID and
                  amount. No email or name is sent.
                </td>
                <td className={td}>So purchases are counted even if a tab closes right after paying.</td>
                <td className={td}>Yes. Sent only for visitors who accepted analytics.</td>
              </tr>
              <tr>
                <td className={td}>
                  <strong>Analytics:</strong> Mux Data
                </td>
                <td className={td}>
                  Video playback quality: startup time, buffering, errors, plus your device, browser and the
                  page address. It sets no cookie.
                </td>
                <td className={td}>To find and fix videos that stutter or fail.</td>
                <td className={td}>Yes. The video still plays if you decline.</td>
              </tr>
              <tr>
                <td className={td}>
                  <strong>Session recordings:</strong> Microsoft Clarity
                </td>
                <td className={td}>
                  Replays of mouse movement, clicks and scrolling, what was on screen, and heatmaps. Typed text,
                  including email fields, is masked. We don&apos;t link recordings to your account.
                </td>
                <td className={td}>To see where people get confused or give up, so we can fix it.</td>
                <td className={td}>Yes. Off by default.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            Microsoft decides for itself how it handles Clarity data (it&apos;s an independent controller) and may
            use it as set out in its own privacy statement. We can&apos;t delete a single person&apos;s recording
            on request. Recordings expire on Clarity&apos;s own schedule. If that bothers you, decline recordings.
          </li>
          <li>
            We switch off Google signals and ad personalisation. Nothing here is used to show you ads.
          </li>
          <li>
            A browser Global Privacy Control or Do Not Track signal counts as &ldquo;declined&rdquo; until you
            choose otherwise yourself.
          </li>
          <li>
            Your choice stays on your device. If you accept, we keep a small consent record (a random ID, the
            time, what you chose and the banner version, with no IP address) so we can show you agreed. If you
            decline, we send nothing and keep nothing. We ask again after about six months, or sooner if the
            purposes change.
          </li>
          <li>
            Change your mind any time with <PrivacySettingsLink className="underline" />. Withdrawing stops
            future collection and clears analytics cookies and stored source details from your device.
          </li>
        </ul>
      </section>

      <section>
        <h2>Cookies and browser storage</h2>
        <p>
          Lifetimes below are what the providers typically set (approx.). They&apos;re cookie lifetimes, not how
          long we keep data.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Set by</th>
                <th className={th}>Purpose</th>
                <th className={th}>Lasts (approx.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={td}>session (cookie)</td>
                <td className={td}>Us</td>
                <td className={td}>Keeps you signed in. Needed for the service.</td>
                <td className={td}>5 days</td>
              </tr>
              <tr>
                <td className={td}>Firebase sign-in state (browser storage)</td>
                <td className={td}>Google Firebase</td>
                <td className={td}>Your sign-in. Needed for the service.</td>
                <td className={td}>Until you sign out</td>
              </tr>
              <tr>
                <td className={td}>Pending sign-in email, resume position (browser storage)</td>
                <td className={td}>Us</td>
                <td className={td}>Finishing sign-in and resuming lessons. Needed for the service.</td>
                <td className={td}>Email: removed after 24 hours. Resume position: until the lesson ends</td>
              </tr>
              <tr>
                <td className={td}>Terms tick, sign-in email cool-down, last session refresh (browser storage)</td>
                <td className={td}>Us</td>
                <td className={td}>Remember that you ticked the box, stop accidental repeat sign-in emails, and know when to refresh your session. Needed for the service.</td>
                <td className={td}>Until you sign out or clear them</td>
              </tr>
              <tr>
                <td className={td}>Your privacy choice and its record ID (browser storage)</td>
                <td className={td}>Us</td>
                <td className={td}>Remembers what you picked on the banner.</td>
                <td className={td}>About 6 months</td>
              </tr>
              <tr>
                <td className={td}>_ga, _ga_9F466RVWND</td>
                <td className={td}>Google Analytics</td>
                <td className={td}>Tells visits apart. Analytics only.</td>
                <td className={td}>About 13 months</td>
              </tr>
              <tr>
                <td className={td}>Firebase installation ID (browser storage)</td>
                <td className={td}>Google Firebase</td>
                <td className={td}>Used by Google Analytics. Analytics only.</td>
                <td className={td}>Until you withdraw or clear it</td>
              </tr>
              <tr>
                <td className={td}>dfrenlearn:first-touch, last-touch, visit-count (browser storage) and a per-visit flag (session storage)</td>
                <td className={td}>Us</td>
                <td className={td}>Remembers where you came from. Analytics only.</td>
                <td className={td}>Until cleared or you withdraw</td>
              </tr>
              <tr>
                <td className={td}>_clck, _clsk</td>
                <td className={td}>Microsoft Clarity</td>
                <td className={td}>Links a recording to one visit. Recordings only.</td>
                <td className={td}>_clck about 1 year, _clsk 1 day</td>
              </tr>
              <tr>
                <td className={td}>CLID, ANONCHK, MR, MUID, SM</td>
                <td className={td}>Microsoft (clarity.ms, bing.com)</td>
                <td className={td}>Identify the browser across Clarity visits. Recordings only.</td>
                <td className={td}>Up to about 1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2">
          Razorpay&apos;s payment window loads only when you click to pay. Once it loads, Razorpay sets its own
          cookies for payment and fraud checks (for example rzp_unified_session_id). Those are needed to take your
          payment and are covered by Razorpay&apos;s privacy policy.
        </p>
      </section>

      <section>
        <h2>The invisible watermark</h2>
        <ul>
          <li>
            While you watch, the player overlays a faint code made from your account, the course and the lesson.
            Your email isn&apos;t in the picture.
          </li>
          <li>Our servers keep the link between that code and your account.</li>
          <li>We use it only to trace a leaked copy of the course back to its source. A person looks at it before any action is taken.</li>
          <li>
            We do this to protect the course. You can object by emailing us, and we&apos;ll look at your
            reasons.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where your data goes</h2>
        <ul>
          <li>
            <strong>Google (Firebase):</strong> accounts, the database (hosted in the US), sign-in emails, and
            Google Analytics. They process data for us.
          </li>
          <li>
            <strong>Microsoft (Clarity):</strong> session recordings and heatmaps, stored on Microsoft Azure. It
            is an independent controller of that data.
          </li>
          <li>
            <strong>Mux:</strong> video delivery and, if you accept analytics, Mux Data. Based in the US. Mux
            processes data for us.
          </li>
          <li>
            <strong>Razorpay:</strong> your payment. It uses the data for its own payment, fraud and
            know-your-customer duties too, under its own policy. Its checkout script loads only when you click
            to pay. Payment data is stored in India as RBI rules require.
          </li>
          <li>
            <strong>Netlify:</strong> hosting, and server logs that include IP addresses. US and AWS
            infrastructure. They process data for us.
          </li>
        </ul>
        <p className="mt-2">
          Some of these providers process data outside India. Indian law allows that, and each uses the
          safeguards in its own terms. We don&apos;t sell your data. We share it only with the providers above,
          for the reasons above, or when the law requires.
        </p>
      </section>

      <section>
        <h2>How long we keep data</h2>
        <p>
          We keep data for as long as we need it for the purposes described here and to meet our legal
          obligations. If you ask us to delete your data, we do, subject to those obligations. When you ask, we
          delete your account, progress, logs and the analytics details on your orders. We keep what the law
          requires, such as invoices and payment records for tax and accounting, and security logs, and we use
          those only for those reasons.
        </p>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <ul>
          <li>Ask for a summary of the data we hold about you and who we&apos;ve shared it with.</li>
          <li>Ask us to correct data that&apos;s wrong or update it.</li>
          <li>Ask us to erase your data.</li>
          <li>Nominate someone to exercise your rights if you die or can&apos;t act for yourself.</li>
          <li>
            Withdraw an optional choice any time, as easily as you gave it, with{" "}
            <PrivacySettingsLink className="underline" />.
          </li>
          <li>Make a complaint to us. Details are below.</li>
        </ul>
        <p className="mt-2">
          To make a request, email{" "}
          <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>{" "}
          from the address on your account. We confirm it&apos;s you through that inbox before we share or delete
          anything, so nobody else can ask on your behalf. These rights come from the Digital Personal Data
          Protection Act, 2023, and we offer the same choices to every visitor.
        </p>
        <p className="mt-2">
          Deleting your account ends your access, and it doesn&apos;t entitle you to a refund. See the{" "}
          <Link href="/refund-policy" className="underline">
            cancellation and refund policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          dfrenLearn is for people aged 18 and over. We don&apos;t knowingly track anyone younger. A person under
          18 needs a parent or guardian&apos;s consent under Indian law, and we don&apos;t offer that route. If we
          find out a minor has an account, we delete it.
        </p>
      </section>

      <section>
        <h2>Who the course is for</h2>
        <p>
          The course is offered to people in India and priced in Indian rupees. We apply the same privacy choices
          to every visitor.
        </p>
      </section>

      <section>
        <h2>Language</h2>
        <p>
          Want this policy in English or in another Indian language? Email us and we&apos;ll send you a copy.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We date and number every version (this one is {LEGAL.privacyVersion}, updated {LEGAL.updated}). If a
          change matters, we say so on the site and ask you to accept it again at your next sign-in or checkout.
          If we add a new optional purpose, we ask for your yes again.
        </p>
      </section>

      <section>
        <h2>Contact and grievances</h2>
        <p>
          {LEGAL.entity}
          <br />
          {LEGAL.address}
          <br />
          Email:{" "}
          <a className="underline" href={`mailto:${LEGAL.grievanceEmail}`}>
            {LEGAL.grievanceEmail}
          </a>
        </p>
        <p className="mt-2">
          Send questions, requests and complaints to that same inbox. We acknowledge them within{" "}
          {LEGAL.grievanceAckHours} hours and aim to resolve them within {LEGAL.grievanceResolveDays} days. If
          you&apos;re still not satisfied after that, you can complain to the Data Protection Board of India.
        </p>
      </section>
    </LegalPage>
  );
}
