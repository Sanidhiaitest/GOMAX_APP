export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          criteria_type: string | null
          criteria_value: number | null
          id: string
          subtitle: string | null
          title: string
        }
        Insert: {
          criteria_type?: string | null
          criteria_value?: number | null
          id?: string
          subtitle?: string | null
          title: string
        }
        Update: {
          criteria_type?: string | null
          criteria_value?: number | null
          id?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      beat_plan: {
        Row: {
          address: string | null
          area: string | null
          dealer_id: string | null
          dealer_name: string
          id: string
          last_order_amount: number | null
          phone: string | null
          salesman_id: string
          status: string
          visit_date: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          dealer_id?: string | null
          dealer_name: string
          id?: string
          last_order_amount?: number | null
          phone?: string | null
          salesman_id: string
          status?: string
          visit_date?: string
        }
        Update: {
          address?: string | null
          area?: string | null
          dealer_id?: string | null
          dealer_name?: string
          id?: string
          last_order_amount?: number | null
          phone?: string | null
          salesman_id?: string
          status?: string
          visit_date?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          progress?: number
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          active: boolean
          id: string
          period_end: string | null
          period_start: string | null
          reward_label: string | null
          reward_points: number
          reward_runs: number
          subtitle: string | null
          target: number
          title: string
        }
        Insert: {
          active?: boolean
          id?: string
          period_end?: string | null
          period_start?: string | null
          reward_label?: string | null
          reward_points?: number
          reward_runs?: number
          subtitle?: string | null
          target?: number
          title: string
        }
        Update: {
          active?: boolean
          id?: string
          period_end?: string | null
          period_start?: string | null
          reward_label?: string | null
          reward_points?: number
          reward_runs?: number
          subtitle?: string | null
          target?: number
          title?: string
        }
        Relationships: []
      }
      dcr_entries: {
        Row: {
          dealer_name: string
          entry_time: string
          id: string
          notes: string | null
          outcome: string
          salesman_id: string
        }
        Insert: {
          dealer_name: string
          entry_time?: string
          id?: string
          notes?: string | null
          outcome: string
          salesman_id: string
        }
        Update: {
          dealer_name?: string
          entry_time?: string
          id?: string
          notes?: string | null
          outcome?: string
          salesman_id?: string
        }
        Relationships: []
      }
      dealer_business_details: {
        Row: {
          address: string | null
          bank_upi: string | null
          created_at: string
          credit_limit: number
          dealer_id: string
          due_date: string | null
          gst_number: string | null
          outstanding: number
          shop_name: string
          shop_photo_url: string | null
          verification_status: string
        }
        Insert: {
          address?: string | null
          bank_upi?: string | null
          created_at?: string
          credit_limit?: number
          dealer_id: string
          due_date?: string | null
          gst_number?: string | null
          outstanding?: number
          shop_name?: string
          shop_photo_url?: string | null
          verification_status?: string
        }
        Update: {
          address?: string | null
          bank_upi?: string | null
          created_at?: string
          credit_limit?: number
          dealer_id?: string
          due_date?: string | null
          gst_number?: string | null
          outstanding?: number
          shop_name?: string
          shop_photo_url?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      fraud_flags: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          related_scan_id: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          related_scan_id?: string | null
          severity: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          related_scan_id?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      ledger_transactions: {
        Row: {
          amount: number
          created_at: string
          dealer_id: string
          id: string
          label: string
          txn_date: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          dealer_id: string
          id?: string
          label: string
          txn_date?: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          dealer_id?: string
          id?: string
          label?: string
          txn_date?: string
          type?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          price: number
          product_id: string | null
          qty: number
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          price?: number
          product_id?: string | null
          qty?: number
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          qty?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          dealer_id: string
          id: string
          order_date: string
          order_no: string
          salesman_id: string | null
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          dealer_id: string
          id?: string
          order_date?: string
          order_no: string
          salesman_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          dealer_id?: string
          id?: string
          order_date?: string
          order_no?: string
          salesman_id?: string | null
          status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category: string
          description: string | null
          icon: string | null
          id: string
          name: string
          price: number
          unit: string
          used_for: string[] | null
        }
        Insert: {
          active?: boolean
          category: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          price: number
          unit: string
          used_for?: string[] | null
        }
        Update: {
          active?: boolean
          category?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          price?: number
          unit?: string
          used_for?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string
          created_at: string
          employee_code: string | null
          full_name: string
          id: string
          kyc_status: string
          language: string
          loyalty_tier: string
          mobile_number: string | null
          onboarding_complete: boolean
          points: number
          referral_code: string | null
          referred_by: string | null
          role: string
          runs: number
          upi_id: string | null
        }
        Insert: {
          city?: string
          created_at?: string
          employee_code?: string | null
          full_name?: string
          id: string
          kyc_status?: string
          language?: string
          loyalty_tier?: string
          mobile_number?: string | null
          onboarding_complete?: boolean
          points?: number
          referral_code?: string | null
          referred_by?: string | null
          role?: string
          runs?: number
          upi_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          employee_code?: string | null
          full_name?: string
          id?: string
          kyc_status?: string
          language?: string
          loyalty_tier?: string
          mobile_number?: string | null
          onboarding_complete?: boolean
          points?: number
          referral_code?: string | null
          referred_by?: string | null
          role?: string
          runs?: number
          upi_id?: string | null
        }
        Relationships: []
      }
      redemption_requests: {
        Row: {
          amount: number
          decided_at: string | null
          decided_by: string | null
          id: string
          requested_at: string
          status: string
          upi_id: string
          user_id: string
        }
        Insert: {
          amount: number
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_at?: string
          status?: string
          upi_id: string
          user_id: string
        }
        Update: {
          amount?: number
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_at?: string
          status?: string
          upi_id?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          referred_mobile: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          referred_mobile: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          referred_mobile?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      scan_activity: {
        Row: {
          gps_lat: number | null
          gps_lng: number | null
          id: string
          points: number
          product_id: string | null
          qr_code: string | null
          scanned_at: string
          user_id: string
        }
        Insert: {
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          points?: number
          product_id?: string | null
          qr_code?: string | null
          scanned_at?: string
          user_id: string
        }
        Update: {
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          points?: number
          product_id?: string | null
          qr_code?: string | null
          scanned_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scratch_cards: {
        Row: {
          active: boolean
          expires_rule: string | null
          id: string
          reward: number
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean
          expires_rule?: string | null
          id?: string
          reward?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean
          expires_rule?: string | null
          id?: string
          reward?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_scratch_cards: {
        Row: {
          card_id: string
          created_at: string
          expires_at: string | null
          id: string
          scratched: boolean
          scratched_at: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          scratched?: boolean
          scratched_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          scratched?: boolean
          scratched_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_is: { Args: { target: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Row: infer R } ? R : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
