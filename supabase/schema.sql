-- PostgreSQL schema for the server-only MfaroBooking gateway.
-- Apply as an administrative migration. No existing project tables are changed.
CREATE SCHEMA mfarobooking;
CREATE SCHEMA mfarobooking_private;
REVOKE ALL ON SCHEMA mfarobooking, mfarobooking_private FROM PUBLIC, anon, authenticated;
CREATE ROLE mfarobooking_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
GRANT mfarobooking_runtime TO postgres;
GRANT USAGE ON SCHEMA mfarobooking TO mfarobooking_runtime;

CREATE TABLE mfarobooking.businesses (
 id text PRIMARY KEY, owner text NOT NULL, name text NOT NULL, industry text NOT NULL,
 settings text NOT NULL CHECK(jsonb_typeof(settings::jsonb)='object'), created text NOT NULL
);
CREATE TABLE mfarobooking.members (
 id text PRIMARY KEY, business text NOT NULL REFERENCES mfarobooking.businesses(id),
 "user" text NOT NULL, role text NOT NULL CHECK(role IN ('owner','manager','receptionist','staff')),
 staff text, branch text, UNIQUE(business,"user")
);
CREATE TABLE mfarobooking.records (
 id text PRIMARY KEY, business text NOT NULL REFERENCES mfarobooking.businesses(id),
 kind text NOT NULL CHECK(kind IN ('customers','staff','services','resources','token')),
 data text NOT NULL CHECK(jsonb_typeof(data::jsonb)='object'), UNIQUE(id,business)
);
CREATE INDEX records_tenant ON mfarobooking.records(business,kind);
CREATE INDEX records_email ON mfarobooking.records(business,lower(data::jsonb->>'email')) WHERE kind='customers';
CREATE INDEX records_token_hash ON mfarobooking.records(business,(data::jsonb->>'hash')) WHERE kind='token';
CREATE TABLE mfarobooking.bookings (
 id text PRIMARY KEY, business text NOT NULL REFERENCES mfarobooking.businesses(id), branch text NOT NULL,
 customer text NOT NULL,email text NOT NULL, service text NOT NULL,staff text NOT NULL,resource text NOT NULL,
 start bigint NOT NULL,"end" bigint NOT NULL CHECK("end">start),
 status text NOT NULL CHECK(status IN ('pending','confirmed','arrived','in progress','completed','cancelled','no-show','checked-in','checked-out')),
 amount bigint NOT NULL CHECK(amount>=0),paid bigint NOT NULL DEFAULT 0 CHECK(paid>=0),
 data text NOT NULL CHECK(jsonb_typeof(data::jsonb)='object'),retry text NOT NULL,created text NOT NULL,
 UNIQUE(business,retry),UNIQUE(id,business),
 FOREIGN KEY(service,business) REFERENCES mfarobooking.records(id,business),
 FOREIGN KEY(staff,business) REFERENCES mfarobooking.records(id,business),
 FOREIGN KEY(resource,business) REFERENCES mfarobooking.records(id,business)
);
CREATE INDEX booking_overlap ON mfarobooking.bookings(business,start,"end");
CREATE INDEX booking_staff ON mfarobooking.bookings(business,staff,start,"end") WHERE status NOT IN ('cancelled','no-show');
CREATE INDEX booking_resource ON mfarobooking.bookings(business,resource,start,"end") WHERE status NOT IN ('cancelled','no-show');
CREATE TABLE mfarobooking.payments (
 id text PRIMARY KEY,business text NOT NULL REFERENCES mfarobooking.businesses(id),booking text NOT NULL,
 amount bigint NOT NULL CHECK(amount<>0),method text NOT NULL,retry text NOT NULL,created text NOT NULL,
 UNIQUE(business,retry),FOREIGN KEY(booking,business) REFERENCES mfarobooking.bookings(id,business)
);
CREATE INDEX payment_booking ON mfarobooking.payments(business,booking);
CREATE TABLE mfarobooking.events (
 id text PRIMARY KEY,business text NOT NULL REFERENCES mfarobooking.businesses(id),actor text NOT NULL,
 kind text NOT NULL,detail text NOT NULL,created text NOT NULL
);
CREATE INDEX event_tenant ON mfarobooking.events(business,created DESC);
CREATE TABLE mfarobooking.delivery (
 id text PRIMARY KEY,business text NOT NULL REFERENCES mfarobooking.businesses(id),booking text NOT NULL,
 kind text NOT NULL,status text NOT NULL,due bigint NOT NULL,attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),content text NOT NULL,
 UNIQUE(booking,kind),FOREIGN KEY(booking,business) REFERENCES mfarobooking.bookings(id,business)
);
CREATE INDEX delivery_tenant ON mfarobooking.delivery(business,due DESC);
CREATE TABLE mfarobooking.limits ("key" text PRIMARY KEY,count integer NOT NULL,expires bigint NOT NULL);
CREATE INDEX limits_expiry ON mfarobooking.limits(expires);
CREATE TABLE mfarobooking_private.app_keys (
 id text PRIMARY KEY,key_hash text NOT NULL UNIQUE CHECK(key_hash ~ '^[a-f0-9]{64}$'),
 enabled boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE mfarobooking_private.app_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA mfarobooking_private FROM PUBLIC,anon,authenticated,mfarobooking_runtime;

-- End users never receive this database role. The authenticated server gateway
-- checks membership/tenant permissions in the existing application API.
DO $policies$
DECLARE relation text;
BEGIN
 FOREACH relation IN ARRAY ARRAY['businesses','members','records','bookings','payments','events','delivery','limits'] LOOP
   EXECUTE format('ALTER TABLE mfarobooking.%I ENABLE ROW LEVEL SECURITY',relation);
   EXECUTE format('REVOKE ALL ON mfarobooking.%I FROM PUBLIC,anon,authenticated',relation);
   EXECUTE format('GRANT SELECT,INSERT,UPDATE ON mfarobooking.%I TO mfarobooking_runtime',relation);
   EXECUTE format('CREATE POLICY server_access ON mfarobooking.%I TO mfarobooking_runtime USING (true) WITH CHECK (true)',relation);
 END LOOP;
END;
$policies$;
GRANT DELETE ON mfarobooking.limits TO mfarobooking_runtime;

CREATE POLICY no_client_access ON mfarobooking_private.app_keys FOR ALL TO anon,authenticated USING(false) WITH CHECK(false);
CREATE INDEX bookings_service_tenant_fk ON mfarobooking.bookings(service,business);
CREATE INDEX bookings_staff_tenant_fk ON mfarobooking.bookings(staff,business);
CREATE INDEX bookings_resource_tenant_fk ON mfarobooking.bookings(resource,business);
CREATE INDEX payments_booking_tenant_fk ON mfarobooking.payments(booking,business);
CREATE INDEX delivery_booking_tenant_fk ON mfarobooking.delivery(booking,business);
