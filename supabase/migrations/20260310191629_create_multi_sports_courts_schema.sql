/*
  # Multi-Sports Courts Reservation Platform - Complete Schema

  ## Overview
  Complete database schema for a multi-sports court reservation platform with monetization.

  ## New Tables

  1. **profiles**
     - `id` (uuid, primary key, references auth.users)
     - `email` (text, not null)
     - `full_name` (text)
     - `phone` (text)
     - `user_type` (text, 'owner' or 'customer')
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **subscription_plans**
     - `id` (uuid, primary key)
     - `name` (text, e.g., 'Básico', 'Premium')
     - `description` (text)
     - `price_monthly` (numeric)
     - `max_courts` (integer)
     - `featured_listing` (boolean)
     - `priority_support` (boolean)
     - `created_at` (timestamptz)

  3. **subscriptions**
     - `id` (uuid, primary key)
     - `owner_id` (uuid, references profiles)
     - `plan_id` (uuid, references subscription_plans)
     - `status` (text, 'active', 'cancelled', 'expired')
     - `starts_at` (timestamptz)
     - `ends_at` (timestamptz)
     - `created_at` (timestamptz)

  4. **courts**
     - `id` (uuid, primary key)
     - `owner_id` (uuid, references profiles)
     - `name` (text, not null)
     - `sport_type` (text, 'futebol_society', 'futevolei', 'beach_tennis', 'volei')
     - `description` (text)
     - `street` (text)
     - `number` (text)
     - `neighborhood` (text)
     - `city` (text)
     - `state` (text)
     - `zip_code` (text)
     - `latitude` (numeric)
     - `longitude` (numeric)
     - `contact_phone` (text)
     - `price_per_hour` (numeric)
     - `status` (text, 'active', 'inactive')
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  5. **court_images**
     - `id` (uuid, primary key)
     - `court_id` (uuid, references courts)
     - `image_url` (text, not null)
     - `order` (integer)
     - `created_at` (timestamptz)

  6. **amenities**
     - `id` (uuid, primary key)
     - `court_id` (uuid, references courts)
     - `name` (text, e.g., 'churrasqueira', 'estacionamento', 'vestiário')
     - `created_at` (timestamptz)

  7. **operating_hours**
     - `id` (uuid, primary key)
     - `court_id` (uuid, references courts)
     - `day_of_week` (integer, 0-6, Sunday-Saturday)
     - `open_time` (time)
     - `close_time` (time)
     - `created_at` (timestamptz)

  8. **bookings**
     - `id` (uuid, primary key)
     - `court_id` (uuid, references courts)
     - `customer_id` (uuid, references profiles)
     - `booking_date` (date, not null)
     - `start_time` (time, not null)
     - `end_time` (time, not null)
     - `total_price` (numeric)
     - `convenience_fee` (numeric)
     - `status` (text, 'pending', 'confirmed', 'cancelled', 'completed')
     - `customer_name` (text)
     - `customer_email` (text)
     - `customer_phone` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users based on user_type and ownership
  - Public read access for courts and related data
  - Owners can manage their own courts and bookings
  - Customers can view their own bookings
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profilesS (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('owner', 'customer')) DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL DEFAULT 0,
  max_courts integer NOT NULL DEFAULT 1,
  featured_listing boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profilesS(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create courts table
CREATE TABLE IF NOT EXISTS courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  sport_type text NOT NULL CHECK (sport_type IN ('futebol_society', 'futevolei', 'beach_tennis', 'volei')),
  description text,
  street text,
  number text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  latitude numeric,
  longitude numeric,
  contact_phone text,
  price_per_hour numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create court_images table
CREATE TABLE IF NOT EXISTS court_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create operating_hours table
CREATE TABLE IF NOT EXISTS operating_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time NOT NULL,
  close_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  customer_id uuid REFERENCES profilesS(id) ON DELETE SET NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  convenience_fee numeric DEFAULT 0,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courts_owner_id ON courts(owner_id);
CREATE INDEX IF NOT EXISTS idx_courts_sport_type ON courts(sport_type);
CREATE INDEX IF NOT EXISTS idx_courts_city ON courts(city);
CREATE INDEX IF NOT EXISTS idx_courts_status ON courts(status);
CREATE INDEX IF NOT EXISTS idx_bookings_court_id ON bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner_id ON subscriptions(owner_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for subscriptions
CREATE POLICY "Owners can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for courts (public read, owner manage)
CREATE POLICY "Anyone can view active courts"
  ON courts FOR SELECT
  USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "Owners can insert own courts"
  ON courts FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own courts"
  ON courts FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete own courts"
  ON courts FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for court_images
CREATE POLICY "Anyone can view court images"
  ON court_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = court_images.court_id
      AND (courts.status = 'active' OR courts.owner_id = auth.uid())
    )
  );

CREATE POLICY "Owners can manage court images"
  ON court_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = court_images.court_id
      AND courts.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = court_images.court_id
      AND courts.owner_id = auth.uid()
    )
  );

-- RLS Policies for amenities
CREATE POLICY "Anyone can view amenities"
  ON amenities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = amenities.court_id
      AND (courts.status = 'active' OR courts.owner_id = auth.uid())
    )
  );

CREATE POLICY "Owners can manage amenities"
  ON amenities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = amenities.court_id
      AND courts.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = amenities.court_id
      AND courts.owner_id = auth.uid()
    )
  );

-- RLS Policies for operating_hours
CREATE POLICY "Anyone can view operating hours"
  ON operating_hours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = operating_hours.court_id
      AND (courts.status = 'active' OR courts.owner_id = auth.uid())
    )
  );

CREATE POLICY "Owners can manage operating hours"
  ON operating_hours FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = operating_hours.court_id
      AND courts.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = operating_hours.court_id
      AND courts.owner_id = auth.uid()
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Anyone can view court bookings for availability"
  ON bookings FOR SELECT
  USING (
    status != 'cancelled' AND (
      EXISTS (
        SELECT 1 FROM courts
        WHERE courts.id = bookings.court_id
        AND courts.status = 'active'
      )
      OR customer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM courts
        WHERE courts.id = bookings.court_id
        AND courts.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = bookings.court_id
      AND courts.status = 'active'
    )
  );

CREATE POLICY "Owners can update bookings for their courts"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = bookings.court_id
      AND courts.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courts
      WHERE courts.id = bookings.court_id
      AND courts.owner_id = auth.uid()
    )
  );

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, max_courts, featured_listing, priority_support)
VALUES 
  ('Básico', 'Plano básico para começar', 0, 1, false, false),
  ('Premium', 'Plano completo com destaque e suporte prioritário', 99.90, 5, true, true),
  ('Profissional', 'Para múltiplas quadras', 199.90, 20, true, true)
ON CONFLICT DO NOTHING;