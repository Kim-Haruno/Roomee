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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          about_me: string | null
          admin_notes: string | null
          age: number
          created_at: string
          email: string
          full_name: string
          id: string
          landlord_id: string
          landlord_notes: string | null
          listing_id: string
          phone: string
          place_of_residence: string
          school: string
          sex: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          about_me?: string | null
          admin_notes?: string | null
          age: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          landlord_id: string
          landlord_notes?: string | null
          listing_id: string
          phone: string
          place_of_residence: string
          school: string
          sex: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          about_me?: string | null
          admin_notes?: string | null
          age?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          landlord_id?: string
          landlord_notes?: string | null
          listing_id?: string
          phone?: string
          place_of_residence?: string
          school?: string
          sex?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address: string
          admin_notes: string | null
          amenities: string[] | null
          available_from: string
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          current_occupants: number
          description: string
          id: string
          images: string[] | null
          landlord_id: string
          max_occupants: number
          price: number
          property_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          amenities?: string[] | null
          available_from: string
          bathrooms: number
          bedrooms: number
          city: string
          created_at?: string
          current_occupants?: number
          description: string
          id?: string
          images?: string[] | null
          landlord_id: string
          max_occupants?: number
          price: number
          property_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          amenities?: string[] | null
          available_from?: string
          bathrooms?: number
          bedrooms?: number
          city?: string
          created_at?: string
          current_occupants?: number
          description?: string
          id?: string
          images?: string[] | null
          landlord_id?: string
          max_occupants?: number
          price?: number
          property_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_notes: string | null
          application_status: string
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string
          stay_duration: string | null
          university: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          application_status?: string
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role: string
          stay_duration?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          application_status?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          stay_duration?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roommate_profiles: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          bio: string | null
          budget_max: number | null
          budget_min: number | null
          cleanliness: string | null
          created_at: string
          gender_preference: string | null
          guests: string | null
          id: string
          interests: string[] | null
          is_visible: boolean | null
          move_in_date: string | null
          noise_level: string | null
          pets: string | null
          preferred_city: string | null
          sleep_schedule: string | null
          smoking: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness?: string | null
          created_at?: string
          gender_preference?: string | null
          guests?: string | null
          id?: string
          interests?: string[] | null
          is_visible?: boolean | null
          move_in_date?: string | null
          noise_level?: string | null
          pets?: string | null
          preferred_city?: string | null
          sleep_schedule?: string | null
          smoking?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness?: string | null
          created_at?: string
          gender_preference?: string | null
          guests?: string | null
          id?: string
          interests?: string[] | null
          is_visible?: boolean | null
          move_in_date?: string | null
          noise_level?: string | null
          pets?: string | null
          preferred_city?: string | null
          sleep_schedule?: string | null
          smoking?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          application_status: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          role: string | null
          stay_duration: string | null
          university: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          application_status?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
          stay_duration?: string | null
          university?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_status?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
          stay_duration?: string | null
          university?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conv_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
