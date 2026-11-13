# Columbia University for PanCAN

Next.js App Router + React + TypeScript. Hosted on Vercel, with Supabase for board login and saved edits.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` checks a production build; `npm run typecheck` checks TypeScript.

Without Supabase settings, the site still runs and shows its built-in text and events; board login just says "Coming soon".

## Structure

- `src/app/`: Home, Events, Join, Contact, Board Login, and Admin (who can log in) pages.
- `src/app/admin/actions.ts`: every save (text, events, text boxes, admins). Each one checks the person is a board admin.
- `src/app/board-login/`: name + email → emailed one-time code → logged in. Codes expire after 2 minutes.
- `src/components/editable.tsx`: `<Editable k="...">original text</Editable>` marks text board members can change.
- `src/components/page-blocks.tsx`: the extra text boxes board members add to a page.
- `src/lib/content.ts`: loads edited text, events and text boxes.
- `supabase/schema.sql`: database tables, security rules, photo storage and starting data.

## Board editing

Once logged in, board members see:

- ✎ next to every piece of text: click it to change the wording (or "Restore original").
- "Edit link" chips under buttons that go to other sites (Join PanCAN, the Google Forms).
- On Events: "+ Add an event", plus Edit / ↑ / ↓ / Delete on each event. Tick "Show as an upcoming event" to feature it at the top.
- On every page: "+ Add a text box", with four designs (White card, Purple panel, Lavender band, Highlight), an optional photo and an optional button.
- A purple bar at the bottom with Admins (add or remove who can log in) and Log out.

In text: a blank line starts a new paragraph, `**bold**` makes bold, `[link text](https://...)` makes a link.

## Setting up login (one time)

### 1. Supabase project

1. Create a free project at https://supabase.com.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` and press **Run**. This creates the tables, the board email list (all six board members plus columbia4pancan@gmail.com), the photo bucket and the current events.

### 2. Login emails (Authentication settings)

1. **Authentication → Sign In / Providers → Email**: keep Email enabled. Set **Email OTP Expiration** to `120` seconds and **Email OTP Length** to `6`.
2. **Authentication → Hooks → Before User Created**: choose Postgres function `public.board_only_signup` and enable it. This stops anyone who is not on the board list from creating an account.
3. **Authentication → Emails → SMTP Settings**: Supabase's built-in email only reaches the project's own team and is heavily rate-limited, so turn on custom SMTP. With the chapter Gmail:
   - On columbia4pancan@gmail.com, turn on 2-Step Verification, then create an **App password** at https://myaccount.google.com/apppasswords.
   - Host `smtp.gmail.com`, port `465`, username `columbia4pancan@gmail.com`, password = the app password, sender email `columbia4pancan@gmail.com`, sender name `Columbia 4 PanCAN`.
4. **Authentication → Emails → Templates**: Supabase sends a link by default; change both **Magic Link** and **Confirm signup** to send the code instead:
   - Subject: `Your Columbia 4 PanCAN login code`
   - Body:
     ```html
     <h2>Your login code</h2>
     <p>Enter this code on the Board Login page within 2 minutes:</p>
     <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
     <p>If you didn't try to log in, you can ignore this email.</p>
     ```
5. **Authentication → URL Configuration**: set Site URL to the live site address (from step 3).

### 3. Vercel hosting

1. Import the GitHub repository at https://vercel.com/new (framework: Next.js, default settings).
2. Under **Environment Variables**, add the two values from Supabase **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the publishable / "anon" key; never the secret or service_role key)
3. Deploy. Then go to **Board Login** on the live site, enter your name and board email, and type in the emailed code.

For local testing, put the same two lines in `.env.local` (copy `.env.example`) and restart `npm run dev`.

## Security notes

- Only emails in the `admins` table can get a code, create an account, or change anything. The database enforces this on every write, not just the website.
- Admins can add and remove other admins on the Admins page; nobody can remove themselves.
- Photo uploads are limited to JPEG, PNG, WebP and GIF, 5 MB each.
- Text is always shown as plain text (with the bold and link shortcuts), never as raw HTML.
