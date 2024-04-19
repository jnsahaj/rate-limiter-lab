# rate-limiter

Rate Limiting Demo App to showcase multiple Rate Limiting algorithms with request analytics <br />
Uses Redis as in-memory KV store <br />
- Fixed Window
- Sliding Window
- Token Bucket

### Run locally
Run `docker compose up` <br />
This will start up a local server at `localhost:3000`

### Improvements

-   ✔️ Improve UI using React
-   ✔️ Add request analytics
-   ✔️ Allow for custom tuning
-   ✔️ Give choice between multiple rate-limiting algorithms
-   Distribute servers behing a load-balancer
