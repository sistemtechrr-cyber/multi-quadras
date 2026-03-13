export type UserType = 'owner' | 'customer';
export type SportType = 'futebol_society' | 'futevolei' | 'beach_tennis' | 'volei';
export type CourtStatus = 'active' | 'inactive';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface Database {
  public: {
    Tables: {
      profilesS: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          user_type: UserType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          user_type?: UserType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          user_type?: UserType;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_monthly: number;
          max_courts: number;
          featured_listing: boolean;
          priority_support: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_monthly?: number;
          max_courts?: number;
          featured_listing?: boolean;
          priority_support?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price_monthly?: number;
          max_courts?: number;
          featured_listing?: boolean;
          priority_support?: boolean;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          owner_id: string;
          plan_id: string;
          status: SubscriptionStatus;
          starts_at: string;
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          plan_id: string;
          status?: SubscriptionStatus;
          starts_at?: string;
          ends_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          plan_id?: string;
          status?: SubscriptionStatus;
          starts_at?: string;
          ends_at?: string;
          created_at?: string;
        };
      };
      courts: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          sport_type: SportType;
          description: string | null;
          street: string | null;
          number: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          latitude: number | null;
          longitude: number | null;
          contact_phone: string | null;
          price_per_hour: number;
          status: CourtStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          sport_type: SportType;
          description?: string | null;
          street?: string | null;
          number?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          contact_phone?: string | null;
          price_per_hour?: number;
          status?: CourtStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          sport_type?: SportType;
          description?: string | null;
          street?: string | null;
          number?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          contact_phone?: string | null;
          price_per_hour?: number;
          status?: CourtStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      court_images: {
        Row: {
          id: string;
          court_id: string;
          image_url: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          image_url: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          image_url?: string;
          order?: number;
          created_at?: string;
        };
      };
      amenities: {
        Row: {
          id: string;
          court_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      operating_hours: {
        Row: {
          id: string;
          court_id: string;
          day_of_week: number;
          open_time: string;
          close_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          day_of_week: number;
          open_time: string;
          close_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          day_of_week?: number;
          open_time?: string;
          close_time?: string;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          court_id: string;
          customer_id: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          total_price: number;
          convenience_fee: number;
          status: BookingStatus;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          customer_id?: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          total_price?: number;
          convenience_fee?: number;
          status?: BookingStatus;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          customer_id?: string | null;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          total_price?: number;
          convenience_fee?: number;
          status?: BookingStatus;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
