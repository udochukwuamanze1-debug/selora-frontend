export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      doctor_profiles: {
        Row: {
          accepts_new_patients: boolean
          city: string
          clinic_name: string | null
          country: string
          created_at: string
          credential_document_path: string | null
          full_name: string
          id: string
          lat: number | null
          license_number: string | null
          lon: number | null
          medical_degree: string | null
          specialty: string
          updated_at: string
          verification_notes: string | null
          verified: boolean
          wallet_address: string
        }
        Insert: {
          accepts_new_patients?: boolean
          city: string
          clinic_name?: string | null
          country: string
          created_at?: string
          credential_document_path?: string | null
          full_name: string
          id?: string
          lat?: number | null
          license_number?: string | null
          lon?: number | null
          medical_degree?: string | null
          specialty: string
          updated_at?: string
          verification_notes?: string | null
          verified?: boolean
          wallet_address: string
        }
        Update: {
          accepts_new_patients?: boolean
          city?: string
          clinic_name?: string | null
          country?: string
          created_at?: string
          credential_document_path?: string | null
          full_name?: string
          id?: string
          lat?: number | null
          license_number?: string | null
          lon?: number | null
          medical_degree?: string | null
          specialty?: string
          updated_at?: string
          verification_notes?: string | null
          verified?: boolean
          wallet_address?: string
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          approved_amount: number | null
          claim_amount: number | null
          created_at: string
          id: string
          insurer_address: string
          notes: string | null
          patient_address: string
          prescription_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_amount?: number | null
          claim_amount?: number | null
          created_at?: string
          id?: string
          insurer_address: string
          notes?: string | null
          patient_address: string
          prescription_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_amount?: number | null
          claim_amount?: number | null
          created_at?: string
          id?: string
          insurer_address?: string
          notes?: string | null
          patient_address?: string
          prescription_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          blob_id: string | null
          created_at: string
          doctor_address: string
          doctor_name: string
          dosage: string
          duration: string
          frequency: string
          id: string
          medication: string
          notes: string | null
          patient_address: string
          pharmacy_id: string | null
          pharmacy_name: string | null
          status: string
          tx_digest: string | null
          updated_at: string
        }
        Insert: {
          blob_id?: string | null
          created_at?: string
          doctor_address: string
          doctor_name?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          medication: string
          notes?: string | null
          patient_address: string
          pharmacy_id?: string | null
          pharmacy_name?: string | null
          status?: string
          tx_digest?: string | null
          updated_at?: string
        }
        Update: {
          blob_id?: string | null
          created_at?: string
          doctor_address?: string
          doctor_name?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          medication?: string
          notes?: string | null
          patient_address?: string
          pharmacy_id?: string | null
          pharmacy_name?: string | null
          status?: string
          tx_digest?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      research_data_requests: {
        Row: {
          budget_tokens: number | null
          consent_count: number | null
          created_at: string
          data_type: string
          description: string | null
          id: string
          patient_count: number | null
          researcher_address: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_tokens?: number | null
          consent_count?: number | null
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          patient_count?: number | null
          researcher_address: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_tokens?: number | null
          consent_count?: number | null
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          patient_count?: number | null
          researcher_address?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          active_guardians: number
          created_at: string
          health_records: number
          id: string
          rewards_earned: number
          staked_datasets: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          active_guardians?: number
          created_at?: string
          health_records?: number
          id?: string
          rewards_earned?: number
          staked_datasets?: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          active_guardians?: number
          created_at?: string
          health_records?: number
          id?: string
          rewards_earned?: number
          staked_datasets?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      visit_reports: {
        Row: {
          blob_id: string | null
          chief_complaint: string | null
          created_at: string
          diagnosis: string
          doctor_address: string
          doctor_name: string
          id: string
          notes: string | null
          patient_address: string
          patient_name: string | null
          prescription_details: string | null
          report_type: string
          status: string
          tx_digest: string | null
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          blob_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis: string
          doctor_address: string
          doctor_name?: string
          id?: string
          notes?: string | null
          patient_address: string
          patient_name?: string | null
          prescription_details?: string | null
          report_type?: string
          status?: string
          tx_digest?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          blob_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string
          doctor_address?: string
          doctor_name?: string
          id?: string
          notes?: string | null
          patient_address?: string
          patient_name?: string | null
          prescription_details?: string | null
          report_type?: string
          status?: string
          tx_digest?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          referral_code: string
          referral_count: number
          referred_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          referral_code: string
          referral_count?: number
          referred_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          referral_code?: string
          referral_count?: number
          referred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["referral_code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_referral_count: {
        Args: { ref_code: string }
        Returns: undefined
      }
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

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
