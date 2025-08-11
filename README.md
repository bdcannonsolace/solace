## Solace Candidate Assignment

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install dependencies

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

## Database set up

The app is configured to return a default list of advocates. This will allow you to get the app up and running without needing to configure a database. If you’d like to configure a database, you’re encouraged to do so. You can uncomment the url in `.env` and the line in `src/app/api/advocates/route.ts` to test retrieving advocates from the database.

1. Feel free to use whatever configuration of postgres you like. The project is set up to use docker-compose.yml to set up postgres. The url is in .env.

```bash
docker compose up -d
```

2. Create a `solaceassignment` database.

3. Push migration to the database

```bash
npx drizzle-kit push
```

4. Seed the database

```bash
curl -X POST http://localhost:3000/api/seed
```


## Planned Changes
+ ~~Improve GET /advocates~~
  - ~~Improve querying advocates with the current querying pattern~~
    - ~~Add indices for the fields we're making queryable~~
  - ~~Add paging to the endpoint~~
    - ~~Fine for now but as the number of advocates grow you don't want to fetch all everytime~~
  - ~~Add Unit tests for the endpoint to make sure its behaving as expected~~
+ Improve UI
  - ~~At the moment this is just a clunky text with not formatting or style~~
  - ~~Improve filtering UI~~
+ ~~Improve Backend Internals~~
  - ~~Add some service or class responsible for returning Advocate Data~~
  - ~~Add unit tests~~
+ ~~Improve Frontend internals~~
  - ~~Create something like a useAdvocates to consolidate bits for fetching and displaying advocate data~~

## Things that could still use improvement
+ Add more unit tests
  - Integration and frontend tests
+ Change DB schema
  - Possibly Enumerate certain columns
  - Specialties could use its own table with join records rather than JSONB
  - Change the Phone number type to string (Seems weird to be big int)
  - Make the phone number unique to de-dupe advocates
  - Change the column name of Specialites from "payload" to probably specialties
+ UI Frontend
  - Overall style improvement
  - Add view for just an advocate
  - Advocates could use different sortings. By name, YoE...

  