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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_login_attempts: {
        Row: {
          created_at: string
          id: string
          ip: string
          ok: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          ok?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          ok?: boolean
        }
        Relationships: []
      }
      articles: {
        Row: {
          body: string[]
          category: string
          created_at: string
          date: string
          dek: string
          id: string
          minutes: number
          published: boolean
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string[]
          category?: string
          created_at?: string
          date?: string
          dek?: string
          id?: string
          minutes?: number
          published?: boolean
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string[]
          category?: string
          created_at?: string
          date?: string
          dek?: string
          id?: string
          minutes?: number
          published?: boolean
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean
        }
        Relationships: []
      }
      price_history: {
        Row: {
          close: number
          created_at: string
          date: string
          high: number
          id: string
          low: number
          open: number
          product_id: string
          volume: number
        }
        Insert: {
          close: number
          created_at?: string
          date: string
          high: number
          id?: string
          low: number
          open: number
          product_id: string
          volume?: number
        }
        Update: {
          close?: number
          created_at?: string
          date?: string
          high?: number
          id?: string
          low?: number
          open?: number
          product_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          featured: boolean
          grade: string
          id: string
          name: string
          origin: string
          passport: Json | null
          price: number
          priority: number
          slug: string
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description?: string
          featured?: boolean
          grade?: string
          id?: string
          name: string
          origin?: string
          passport?: Json | null
          price?: number
          priority?: number
          slug: string
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          grade?: string
          id?: string
          name?: string
          origin?: string
          passport?: Json | null
          price?: number
          priority?: number
          slug?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string
          announcement: string
          brand_latin: string
          brand_name: string
          brand_tagline: string
          contact_address: string
          contact_email: string
          contact_phone: string
          contact_whatsapp: string
          currency: string
          export_text: string
          founded_year: string
          hero_subtitle: string
          hero_title: string
          id: number
          instagram: string
          mission_text: string
          price_source: string
          seo_description: string
          seo_title: string
          site_url: string
          telegram: string
          updated_at: string
          wholesale_benefits: Json
          wholesale_tiers: Json
          working_hours: string
        }
        Insert: {
          about_text: string
          announcement?: string
          brand_latin: string
          brand_name: string
          brand_tagline: string
          contact_address: string
          contact_email: string
          contact_phone: string
          contact_whatsapp?: string
          currency?: string
          export_text?: string
          founded_year?: string
          hero_subtitle: string
          hero_title: string
          id?: number
          instagram?: string
          mission_text?: string
          price_source?: string
          seo_description?: string
          seo_title?: string
          site_url?: string
          telegram?: string
          updated_at?: string
          wholesale_benefits?: Json
          wholesale_tiers?: Json
          working_hours?: string
        }
        Update: {
          about_text?: string
          announcement?: string
          brand_latin?: string
          brand_name?: string
          brand_tagline?: string
          contact_address?: string
          contact_email?: string
          contact_phone?: string
          contact_whatsapp?: string
          currency?: string
          export_text?: string
          founded_year?: string
          hero_subtitle?: string
          hero_title?: string
          id?: number
          instagram?: string
          mission_text?: string
          price_source?: string
          seo_description?: string
          seo_title?: string
          site_url?: string
          telegram?: string
          updated_at?: string
          wholesale_benefits?: Json
          wholesale_tiers?: Json
          working_hours?: string
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
