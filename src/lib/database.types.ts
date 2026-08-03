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
      commission_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          level: number
          recipient_id: string
          source_scan_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          level: number
          recipient_id: string
          source_scan_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          level?: number
          recipient_id?: string
          source_scan_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          batch_id: string | null
          code: string
          created_at: string
          id: string
          points_value: number
          redeemed_at: string | null
          redeemed_by: string | null
          status: string
        }
        Insert: {
          batch_id?: string | null
          code: string
          created_at?: string
          id?: string
          points_value: number
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
        }
        Update: {
          batch_id?: string | null
          code?: string
          created_at?: string
          id?: string
          points_value?: number
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      gift_catalogue: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          market_value_inr: number | null
          name: string
          runs_cost: number
          stock: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          market_value_inr?: number | null
          name: string
          runs_cost: number
          stock?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          market_value_inr?: number | null
          name?: string
          runs_cost?: number
          stock?: number
        }
        Relationships: []
      }
      gift_redemptions: {
        Row: {
          delivered_at: string | null
          gift_id: string
          id: string
          proof_url: string | null
          requested_at: string
          runs_spent: number
          shipped_at: string | null
          status: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          delivered_at?: string | null
          gift_id: string
          id?: string
          proof_url?: string | null
          requested_at?: string
          runs_spent: number
          shipped_at?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          delivered_at?: string | null
          gift_id?: string
          id?: string
          proof_url?: string | null
          requested_at?: string
          runs_spent?: number
          shipped_at?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed: boolean
          created_at: string
          expires_at: string
          id: string
          mobile_number: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed?: boolean
          created_at?: string
          expires_at: string
          id?: string
          mobile_number: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          mobile_number?: string
        }
        Relationships: []
      }
      points_ledger: {
        Row: {
          amount: number
          created_at: string
          entry_type: string
          id: string
          ref_id: string | null
          ref_table: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          entry_type: string
          id?: string
          ref_id?: string | null
          ref_table?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          entry_type?: string
          id?: string
          ref_id?: string | null
          ref_table?: string | null
          user_id?: string
        }
        Relationships: []
      }
      points_redemption_requests: {
        Row: {
          amount: number
          bank_account_number: string | null
          bank_ifsc: string | null
          decided_at: string | null
          decided_by: string | null
          id: string
          proof_url: string | null
          requested_at: string
          status: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_number?: string | null
          bank_ifsc?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          proof_url?: string | null
          requested_at?: string
          status?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_number?: string | null
          bank_ifsc?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          proof_url?: string | null
          requested_at?: string
          status?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
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
          pan_number: string | null
          points: number
          referral_code: string | null
          referrer_id: string | null
          role: string
          runs: number
          security_answer_hash: string | null
          security_question: string | null
          upi_id: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
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
          pan_number?: string | null
          points?: number
          referral_code?: string | null
          referrer_id?: string | null
          role?: string
          runs?: number
          security_answer_hash?: string | null
          security_question?: string | null
          upi_id?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
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
          pan_number?: string | null
          points?: number
          referral_code?: string | null
          referrer_id?: string | null
          role?: string
          runs?: number
          security_answer_hash?: string | null
          security_question?: string | null
          upi_id?: string | null
        }
        Relationships: []
      }
      runs_ledger: {
        Row: {
          amount: number
          created_at: string
          entry_type: string
          id: string
          ref_id: string | null
          ref_table: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          entry_type: string
          id?: string
          ref_id?: string | null
          ref_table?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          entry_type?: string
          id?: string
          ref_id?: string | null
          ref_table?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scan_transactions: {
        Row: {
          applicator_id: string
          coupon_id: string
          created_at: string
          id: string
          points_awarded: number
        }
        Insert: {
          applicator_id: string
          coupon_id: string
          created_at?: string
          id?: string
          points_awarded: number
        }
        Update: {
          applicator_id?: string
          coupon_id?: string
          created_at?: string
          id?: string
          points_awarded?: number
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
      tds_records: {
        Row: {
          benefit_type: string
          benefit_value: number
          created_at: string
          cumulative_fy_value: number
          financial_year: string
          id: string
          pan_on_file: boolean
          ref_id: string
          ref_table: string
          tds_amount: number | null
          tds_applicable: boolean
          tds_rate: number | null
          user_id: string
        }
        Insert: {
          benefit_type: string
          benefit_value: number
          created_at?: string
          cumulative_fy_value: number
          financial_year: string
          id?: string
          pan_on_file?: boolean
          ref_id: string
          ref_table: string
          tds_amount?: number | null
          tds_applicable?: boolean
          tds_rate?: number | null
          user_id: string
        }
        Update: {
          benefit_type?: string
          benefit_value?: number
          created_at?: string
          cumulative_fy_value?: number
          financial_year?: string
          id?: string
          pan_on_file?: boolean
          ref_id?: string
          ref_table?: string
          tds_amount?: number | null
          tds_applicable?: boolean
          tds_rate?: number | null
          user_id?: string
        }
        Relationships: []
      }
      spin_wheel_prizes: {
        Row: {
          active: boolean
          id: string
          label: string
          runs_value: number
          weight: number
        }
        Insert: {
          active?: boolean
          id?: string
          label: string
          runs_value?: number
          weight?: number
        }
        Update: {
          active?: boolean
          id?: string
          label?: string
          runs_value?: number
          weight?: number
        }
        Relationships: []
      }
      spin_wheel_spins: {
        Row: {
          id: string
          prize_id: string | null
          runs_awarded: number
          spin_date: string
          spun_at: string
          user_id: string
        }
        Insert: {
          id?: string
          prize_id?: string | null
          runs_awarded?: number
          spin_date?: string
          spun_at?: string
          user_id: string
        }
        Update: {
          id?: string
          prize_id?: string | null
          runs_awarded?: number
          spin_date?: string
          spun_at?: string
          user_id?: string
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
      tier_bands: {
        Row: {
          id: string
          min_lifetime_points: number
          name: string
          perk_description: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          min_lifetime_points: number
          name: string
          perk_description?: string | null
          sort_order: number
        }
        Update: {
          id?: string
          min_lifetime_points?: number
          name?: string
          perk_description?: string | null
          sort_order?: number
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
      admin_account_exists: { Args: never; Returns: boolean }
      bootstrap_admin_account: { Args: { p_full_name: string }; Returns: Json }
      check_security_answer: {
        Args: { p_answer: string; p_mobile_number: string }
        Returns: boolean
      }
      claim_challenge: { Args: { p_challenge_id: string }; Returns: Json }
      get_my_downline: {
        Args: never
        Returns: {
          id: string
          full_name: string
          role: string
          created_at: string
          referrer_id: string | null
          commission_generated: number
          business_volume: number
        }[]
      }
      check_and_record_tds: {
        Args: {
          p_benefit_type: string
          p_benefit_value: number
          p_ref_id: string
          p_ref_table: string
          p_user_id: string
        }
        Returns: Json
      }
      complete_signup: {
        Args: {
          p_aadhaar_number?: string
          p_address: string
          p_bank_account_number: string
          p_bank_ifsc: string
          p_city: string
          p_full_name: string
          p_mobile_number: string
          p_pan_number?: string
          p_referral_code: string
          p_role: string
          p_security_answer: string
          p_security_question: string
          p_upi_id: string
        }
        Returns: Json
      }
      get_tds_summary: {
        Args: { p_financial_year?: string }
        Returns: {
          cumulative_fy_value: number
          financial_year: string
          full_name: string
          latest_tds_amount: number | null
          mobile_number: string
          pan_number: string | null
          tds_applicable: boolean
          user_id: string
        }[]
      }
      current_role_is: { Args: { target: string }; Returns: boolean }
      get_my_tier: { Args: never; Returns: Json }
      list_tier_bands: {
        Args: never
        Returns: {
          id: string
          min_lifetime_points: number
          name: string
          perk_description: string | null
          sort_order: number
        }[]
      }
      get_referrer_role_by_code: {
        Args: { p_referral_code: string }
        Returns: Json
      }
      get_security_question: {
        Args: { p_mobile_number: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      redeem_gift: { Args: { p_gift_id: string }; Returns: Json }
      request_password_reset_otp: {
        Args: { p_mobile_number: string }
        Returns: Json
      }
      request_points_redemption: { Args: { p_amount: number }; Returns: Json }
      reset_password_with_otp: {
        Args: {
          p_mobile_number: string
          p_new_password: string
          p_otp_code: string
          p_security_answer: string
        }
        Returns: Json
      }
      reveal_scratch_card: { Args: { p_user_card_id: string }; Returns: Json }
      scan_coupon: { Args: { p_code: string }; Returns: Json }
      spin_wheel: { Args: never; Returns: Json }
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
