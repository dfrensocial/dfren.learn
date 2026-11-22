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
          <li>Analytics, session recordings and ad measurement are optional. They&apos;re off until you accept them on the banner.</li>
          <li>Decline, or send a Global Privacy Control or Do Not Track signal, and none of the optional tools load.</li>
          <li>Ticking the Terms box at sign-in or checkout does not turn on analytics. The two are separate.</li>
          <li>We don&apos;t sell your data. The only advertising use is ad measurement with Meta (the Meta Pixel, and a report of your purchase), and only if you switch it on.</li>
          <li>The video at the top of the home page is played by YouTube, so Google can see that your browser loaded it. It is not one of the optional tools.</li>
          <li>
            You can change your mind any time with <PrivacySettingsLink className="underline" />, or ask us to
            delete your data.
          </li>
        </ul>
      </section>

      <section lang="ta">
        <h2>தனியுரிமைக் கொள்கை: தமிழில் சுருக்கம்</h2>
        <ul>
          <li>பாடத்தை வழங்க உங்கள் மின்னஞ்சல், ஆர்டர் விவரங்கள், பாதுகாப்புப் பதிவுகள் தேவை. இவை கட்டாயம்.</li>
          <li>பகுப்பாய்வு (Google Analytics), திரைப் பதிவுகள் (Microsoft Clarity) மற்றும் விளம்பர அளவீடு (Meta Pixel) விருப்பத்திற்குரியவை. நீங்கள் &quot;Accept&quot; என்று சொல்லும் வரை இவை இயங்காது.</li>
          <li>&quot;Decline&quot; செய்தால், அல்லது உங்கள் உலாவியில் Global Privacy Control அல்லது Do Not Track இயக்கத்தில் இருந்தால், விருப்பக் கருவிகள் எதுவும் ஏற்றப்படாது.</li>
          <li>உங்கள் தரவை நாங்கள் விற்பதில்லை. நீங்கள் அனுமதித்தால் மட்டுமே, எங்கள் Facebook, Instagram விளம்பரங்கள் பலன் தருகின்றனவா என்பதை அளவிட Meta Pixel பயன்படுத்தப்படும். நீங்கள் வாங்கினால், அனுமதித்திருந்தால் மட்டும், வாங்கிய தகவல் (ஆர்டர் எண், விலை) Meta-வுக்கு எங்கள் சர்வரிலிருந்தும் அனுப்பப்படும். உங்கள் மின்னஞ்சல், பெயர், தொலைபேசி எண் ஒருபோதும் அனுப்பப்படாது.</li>
          <li>முகப்புப் பக்கத்தின் மேலே உள்ள வீடியோவை YouTube இயக்குகிறது. அதனால் உங்கள் உலாவி அதை ஏற்றியது Google-க்குத் தெரியும். இது விருப்பக் கருவி அல்ல.</li>
          <li>உங்கள் தரவின் சுருக்கத்தை, திருத்தத்தை அல்லது நீக்கத்தை நீங்கள் கேட்கலாம். {LEGAL.contactEmail} க்கு எழுதுங்கள். {LEGAL.grievanceAckHours} மணி நேரத்துக்குள் பதில் தருவோம், {LEGAL.grievanceResolveDays} நாட்களுக்குள் தீர்வு காண்போம்.</li>
          <li>கணக்கை நீக்கினால் பாடத்துக்கான அணுகலும் முடிந்துவிடும், &quot;வாழ்நாள் அணுகல்&quot; என்று விற்கப்பட்டிருந்தாலும். பணம் திருப்பித் தரப்படாது.</li>
          <li>முழு விவரங்களுக்குக் கீழே உள்ள ஆங்கிலக் கொள்கையைப் பாருங்கள்.</li>
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
            <strong>Your ad choice on an order.</strong> If you allowed ad measurement when you paid, we note that
            on the order, together with Meta&apos;s two browser ids (the _fbp and _fbc cookies). We use them only to
            report that purchase to Meta, as described below. If you declined, none of this is saved.
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
            is issued or refreshed (roughly every 12 hours of use), when you place an order, and when you download
            a file, plus which lesson is streaming from which session and when you first opened the course. We use
            these to enforce the 2-stream limit, spot account sharing, investigate abuse and answer payment
            disputes.
          </li>
          <li>
            <strong>The viewing watermark.</strong> While you watch, the player lays a faint code over the video.
            The code is made from your account, the course and the lesson. We store the link between that code and
            your account on our servers. We use it only to trace a leaked copy of the course back to the account it
            came from, and a person reviews it before any step is taken. Your email is not in the picture.
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
            <strong>Email from us.</strong> Today we send sign-in links and replies to messages you send us. We
            send no marketing email without a separate yes from you.
          </li>
        </ul>
      </section>

      <section>
        <h2>Optional: analytics, session recordings and ad measurement</h2>
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
                  Replays of mouse movement, clicks and scrolling, what was on screen, and heatmaps. Typed text
                  in forms is masked, and places that show your email or name are marked so they are masked too. We
                  don&apos;t link recordings to your account.
                </td>
                <td className={td}>To see where people get confused or give up, so we can fix it.</td>
                <td className={td}>Yes. Off by default.</td>
              </tr>
              <tr>
                <td className={td}>
                  <strong>Ad measurement:</strong> Meta Pixel and a server report of your purchase
                </td>
                <td className={td}>
                  The pages you visit here, your browser and device, your IP address, and Meta&apos;s own cookies.
                  If you&apos;re logged in to Facebook or Instagram in the same browser, Meta can connect the visit
                  to that account. If you buy the course, our server also tells Meta that a purchase happened, once
                  your payment is confirmed: the order number, the price, the course, Meta&apos;s browser ids, and
                  your IP address and browser details. We never send Meta your email, name or phone number, and we
                  send nothing about your purchase if you declined ad measurement.
                </td>
                <td className={td}>
                  To see which of our Facebook and Instagram ads bring visitors and buyers (including when your
                  browser blocks the Pixel), and to show our ads again to people who visited.
                </td>
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
            We switch off Google signals and ad personalisation in Google Analytics, and Clarity is told no
            advertising storage. Only Meta (the Pixel, and the purchase report) is used for ads, and only if you switch on ad measurement.
          </li>
          <li>
            Meta decides for itself how it uses Pixel and purchase-report data for its own purposes (such as running
            and improving its ads), under its own privacy policy. To control ads on Facebook and Instagram, use
            Meta&apos;s ad settings. Switching ad measurement off here stops the Pixel and removes its cookies from
            our site. It also stops any new purchase report: we send Meta nothing about orders placed after you
            switch it off, but we can&apos;t take back a purchase report already sent while you had it on, except by
            asking Meta.
          </li>
          <li>
            The video at the top of the home page is played by YouTube (Google), using its privacy-enhanced player
            (youtube-nocookie.com). It loads from Google when the page opens and is not tied to the banner, because
            it is part of the page, like an image. Google can see your IP address and browser details when it loads,
            and may store data in your browser once you interact with the video. Google decides how it uses that,
            under its own privacy policy. We don&apos;t pass YouTube any information about you. How far you watch is
            counted in our own analytics only if you allowed analytics.
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
              <tr>
                <td className={td}>_fbp, _fbc</td>
                <td className={td}>Meta Pixel (on our domain)</td>
                <td className={td}>Recognise the browser and the ad click that brought you. Ad measurement only.</td>
                <td className={td}>About 90 days</td>
              </tr>
              <tr>
                <td className={td}>fr and other facebook.com cookies</td>
                <td className={td}>Meta (facebook.com)</td>
                <td className={td}>Meta&apos;s own ad cookies, read when the Pixel loads. Ad measurement only.</td>
                <td className={td}>Set by Meta, up to about 90 days</td>
              </tr>
              <tr>
                <td className={td}>Storage and cookies from youtube-nocookie.com / youtube.com</td>
                <td className={td}>Google (YouTube)</td>
                <td className={td}>Plays the video at the top of the home page. Loads with the page, not tied to the banner. The privacy-enhanced player mainly stores data after you interact with the video.</td>
                <td className={td}>Set by Google, varies</td>
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
        <p>
          It is part of the service you agreed to when you ticked the box at sign-in or checkout, because it is how
          we protect the course from being copied. It is not used for advertising or to profile you. If you have a
          concern about it, write to us and we&apos;ll explain how it works for your account. If you ask us to delete
          your data, we delete the link between the code and your account.
        </p>
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
            <strong>Meta (Pixel and purchase report):</strong> ad measurement, only if you allow it. This covers the
            Pixel in your browser and a report from our server that a purchase happened. Meta Platforms processes the
            data outside India and also uses it for its own purposes, as an independent controller, under its own
            privacy policy.
          </li>
          <li>
            <strong>Google (YouTube):</strong> plays the video at the top of the home page. It loads from Google
            when the page opens, whatever you chose on the banner. Google decides how it uses the data it receives,
            as an independent controller, under its own privacy policy.
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
            <strong>Google (Gmail):</strong> the inbox where we receive and answer your messages and requests.
            Google processes this data for us.
          </li>
          <li>
            <strong>Google (Firebase Storage):</strong> the private storage that holds the course files you
            download. Your browser fetches each file from Google through a link that lasts one minute.
          </li>
          <li>
            <strong>WhatsApp (Meta):</strong> only if you tap the green chat button and message us. The button is a
            plain link and loads nothing from WhatsApp until you tap it. After that, WhatsApp handles the chat under
            its own terms and privacy policy, and we see your number and what you write to us.
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
          We keep each kind of data only for as long as the reason in the table below lasts. When you ask us to
          delete your data, we do it within 30 days, except for the records the law requires us to keep, such as
          invoices and payment records for tax and accounting. We use those only for those reasons. Deleting your
          account also ends your access to the course, as the{" "}
          <Link href="/terms" className="underline">
            terms
          </Link>{" "}
          explain.
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className={th}>What</th>
                <th className={th}>How long</th>
                <th className={th}>Why</th>
                <th className={th}>How it ends</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={td}>Your account, course access and progress</td>
                <td className={td}>While your account is open</td>
                <td className={td}>To run the course</td>
                <td className={td}>Deleted when you ask</td>
              </tr>
              <tr>
                <td className={td}>Order and payment records (order id, amount, GST, date, status, method)</td>
                <td className={td}>8 years</td>
                <td className={td}>Tax and accounting duties</td>
                <td className={td}>Deleted at the end of that period</td>
              </tr>
              <tr>
                <td className={td}>Unfinished checkouts (email, amount, status)</td>
                <td className={td}>12 months</td>
                <td className={td}>To fix payment problems</td>
                <td className={td}>Deleted after 12 months</td>
              </tr>
              <tr>
                <td className={td}>Source, device and Google ids saved on an order (only if you allowed analytics), and your ad choice with Meta&apos;s browser ids (only if you allowed ad measurement)</td>
                <td className={td}>Until you ask us to remove them</td>
                <td className={td}>To learn which channels bring students</td>
                <td className={td}>Removed when you ask</td>
              </tr>
              <tr>
                <td className={td}>Sign-in and security records (IP address, browser, downloads, streams)</td>
                <td className={td}>12 months from the event</td>
                <td className={td}>To keep accounts safe and answer payment disputes. The law asks us to keep security logs for at least a year</td>
                <td className={td}>Sign-in records delete themselves after about 12 months. Others are deleted with your account</td>
              </tr>
              <tr>
                <td className={td}>Proof of your privacy choice (random id, choice, time, no IP address)</td>
                <td className={td}>3 years after your last choice</td>
                <td className={td}>To show that you agreed</td>
                <td className={td}>Deleted after that period</td>
              </tr>
              <tr>
                <td className={td}>Proof you accepted the Terms and Privacy Policy</td>
                <td className={td}>While your account is open, then 3 years</td>
                <td className={td}>To show what you agreed to</td>
                <td className={td}>Deleted after that period</td>
              </tr>
              <tr>
                <td className={td}>Messages you send us</td>
                <td className={td}>2 years after the last message</td>
                <td className={td}>To answer you and show how we handled a request</td>
                <td className={td}>Deleted after that period</td>
              </tr>
              <tr>
                <td className={td}>Google Analytics data (only if you allowed analytics)</td>
                <td className={td}>14 months</td>
                <td className={td}>Set in our Google Analytics account</td>
                <td className={td}>Google deletes it</td>
              </tr>
              <tr>
                <td className={td}>Microsoft Clarity recordings (only if you allowed recordings)</td>
                <td className={td}>Set by Microsoft, not by us</td>
                <td className={td}>Microsoft decides</td>
                <td className={td}>Expires on Microsoft&apos;s schedule</td>
              </tr>
              <tr>
                <td className={td}>Meta Pixel and purchase-report data (only if you allowed ad measurement)</td>
                <td className={td}>Set by Meta, not by us</td>
                <td className={td}>Meta decides</td>
                <td className={td}>Deleted on Meta&apos;s schedule</td>
              </tr>
              <tr>
                <td className={td}>Server logs at our host (IP address)</td>
                <td className={td}>Set by our host</td>
                <td className={td}>Security and fixing errors</td>
                <td className={td}>Deleted by our host</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <ul>
          <li>Ask for a summary of the data we hold about you and who we&apos;ve shared it with.</li>
          <li>Ask us to correct data that&apos;s wrong or update it.</li>
          <li>Ask us to erase your data. This also ends your access to the course, so we warn you first. You can start a request from the footer of your dashboard.</li>
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
          This policy is in English. A short Tamil summary is at the top of this page. For a copy of the full
          policy in another Indian language, email us.
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
          <br />
          Grievance Officer: {LEGAL.grievanceOfficer}
          <br />
          Phone: {LEGAL.grievancePhone}
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
