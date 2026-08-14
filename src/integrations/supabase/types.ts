export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      introduction_requests: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          ngo_id: string;
          recruiter_id: string;
          response_notes: string | null;
          status: Database["public"]["Enums"]["request_status"];
          survivor_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          ngo_id: string;
          recruiter_id: string;
          response_notes?: string | null;
          status?: Database["public"]["Enums"]["request_status"];
          survivor_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          ngo_id?: string;
          recruiter_id?: string;
          response_notes?: string | null;
          status?: Database["public"]["Enums"]["request_status"];
          survivor_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "introduction_requests_ngo_id_fkey";
            columns: ["ngo_id"];
            isOneToOne: false;
            referencedRelation: "ngos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "introduction_requests_recruiter_id_fkey";
            columns: ["recruiter_id"];
            isOneToOne: false;
            referencedRelation: "recruiters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "introduction_requests_survivor_id_fkey";
            columns: ["survivor_id"];
            isOneToOne: false;
            referencedRelation: "survivors";
            referencedColumns: ["id"];
          },
        ];
      };
      job_applications: {
        Row: {
          cover_note: string | null;
          created_at: string;
          id: string;
          job_id: string;
          ngo_id: string | null;
          status: Database["public"]["Enums"]["application_status"];
          survivor_id: string;
          updated_at: string;
        };
        Insert: {
          cover_note?: string | null;
          created_at?: string;
          id?: string;
          job_id: string;
          ngo_id?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          survivor_id: string;
          updated_at?: string;
        };
        Update: {
          cover_note?: string | null;
          created_at?: string;
          id?: string;
          job_id?: string;
          ngo_id?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          survivor_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_applications_survivor_id_fkey";
            columns: ["survivor_id"];
            isOneToOne: false;
            referencedRelation: "survivors";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          closes_at: string | null;
          company_name: string;
          created_at: string;
          currency: string | null;
          description: string | null;
          embedding: string | null;
          employment_type: string | null;
          id: string;
          languages: string[] | null;
          location_country: string | null;
          location_region: string | null;
          preferred_skills: string[] | null;
          published_at: string | null;
          recruiter_id: string;
          remote_ok: boolean | null;
          required_skills: string[] | null;
          salary_max: number | null;
          salary_min: number | null;
          status: Database["public"]["Enums"]["job_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          closes_at?: string | null;
          company_name: string;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          embedding?: string | null;
          employment_type?: string | null;
          id?: string;
          languages?: string[] | null;
          location_country?: string | null;
          location_region?: string | null;
          preferred_skills?: string[] | null;
          published_at?: string | null;
          recruiter_id: string;
          remote_ok?: boolean | null;
          required_skills?: string[] | null;
          salary_max?: number | null;
          salary_min?: number | null;
          status?: Database["public"]["Enums"]["job_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          closes_at?: string | null;
          company_name?: string;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          embedding?: string | null;
          employment_type?: string | null;
          id?: string;
          languages?: string[] | null;
          location_country?: string | null;
          location_region?: string | null;
          preferred_skills?: string[] | null;
          published_at?: string | null;
          recruiter_id?: string;
          remote_ok?: boolean | null;
          required_skills?: string[] | null;
          salary_max?: number | null;
          salary_min?: number | null;
          status?: Database["public"]["Enums"]["job_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_recruiter_id_fkey";
            columns: ["recruiter_id"];
            isOneToOne: false;
            referencedRelation: "recruiters";
            referencedColumns: ["id"];
          },
        ];
      };
      match_scores: {
        Row: {
          breakdown: Json;
          computed_at: string;
          id: string;
          job_id: string;
          score: number;
          summary: string | null;
          survivor_id: string;
        };
        Insert: {
          breakdown?: Json;
          computed_at?: string;
          id?: string;
          job_id: string;
          score: number;
          summary?: string | null;
          survivor_id: string;
        };
        Update: {
          breakdown?: Json;
          computed_at?: string;
          id?: string;
          job_id?: string;
          score?: number;
          summary?: string | null;
          survivor_id?: string;
        };
        Relationships: [];
      };
      mentor_messages: {
        Row: {
          created_at: string;
          id: string;
          parts: Json[];
          role: string;
          safety_flagged: boolean;
          thread_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          parts: Json[];
          role: string;
          safety_flagged?: boolean;
          thread_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          parts?: Json[];
          role?: string;
          safety_flagged?: boolean;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mentor_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "mentor_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      mentor_threads: {
        Row: {
          created_at: string;
          id: string;
          safety_flagged: boolean;
          survivor_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          safety_flagged?: boolean;
          survivor_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          safety_flagged?: boolean;
          survivor_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ngos: {
        Row: {
          address: string | null;
          approved_at: string | null;
          approved_by: string | null;
          city: string | null;
          contact_email: string;
          contact_phone: string | null;
          country: string | null;
          created_at: string;
          description: string | null;
          focus_areas: string[] | null;
          id: string;
          name: string;
          owner_id: string;
          registration_number: string | null;
          rejection_reason: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["ngo_status"];
          updated_at: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          city?: string | null;
          contact_email: string;
          contact_phone?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          focus_areas?: string[] | null;
          id?: string;
          name: string;
          owner_id: string;
          registration_number?: string | null;
          rejection_reason?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["ngo_status"];
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          city?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          focus_areas?: string[] | null;
          id?: string;
          name?: string;
          owner_id?: string;
          registration_number?: string | null;
          rejection_reason?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["ngo_status"];
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          email: boolean;
          in_app: boolean;
          kind: string;
          user_id: string;
        };
        Insert: {
          email?: boolean;
          in_app?: boolean;
          kind: string;
          user_id: string;
        };
        Update: {
          email?: boolean;
          in_app?: boolean;
          kind?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          kind: string;
          payload: Json;
          read_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind: string;
          payload?: Json;
          read_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: string;
          payload?: Json;
          read_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          action: string;
          count: number;
          user_id: string;
          window_start: string;
        };
        Insert: {
          action: string;
          count?: number;
          user_id: string;
          window_start?: string;
        };
        Update: {
          action?: string;
          count?: number;
          user_id?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      recruiters: {
        Row: {
          company_name: string;
          company_website: string | null;
          created_at: string;
          id: string;
          rejection_reason: string | null;
          status: Database["public"]["Enums"]["recruiter_status"];
          updated_at: string;
          user_id: string;
          verification_notes: string | null;
          verification_status: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          company_name: string;
          company_website?: string | null;
          created_at?: string;
          id?: string;
          rejection_reason?: string | null;
          status?: Database["public"]["Enums"]["recruiter_status"];
          updated_at?: string;
          user_id: string;
          verification_notes?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          company_name?: string;
          company_website?: string | null;
          created_at?: string;
          id?: string;
          rejection_reason?: string | null;
          status?: Database["public"]["Enums"]["recruiter_status"];
          updated_at?: string;
          user_id?: string;
          verification_notes?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [];
      };
      survivor_documents: {
        Row: {
          created_at: string;
          doc_type: string;
          file_name: string;
          id: string;
          kind: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          status: string | null;
          storage_path: string;
          survivor_id: string;
          uploaded_by: string;
        };
        Insert: {
          created_at?: string;
          doc_type?: string;
          file_name: string;
          id?: string;
          kind?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: string | null;
          storage_path: string;
          survivor_id: string;
          uploaded_by: string;
        };
        Update: {
          created_at?: string;
          doc_type?: string;
          file_name?: string;
          id?: string;
          kind?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: string | null;
          storage_path?: string;
          survivor_id?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "survivor_documents_survivor_id_fkey";
            columns: ["survivor_id"];
            isOneToOne: false;
            referencedRelation: "survivors";
            referencedColumns: ["id"];
          },
        ];
      };
      survivor_skills_taxonomy: {
        Row: {
          category: string;
          created_at: string;
          label: string;
          slug: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          label: string;
          slug: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          label?: string;
          slug?: string;
        };
        Relationships: [];
      };
      survivors: {
        Row: {
          accommodation_needs: string | null;
          age: number | null;
          anonymous_id: string;
          availability: string | null;
          bio: string | null;
          certifications: Json | null;
          city: string | null;
          consent_ai_changed_at: string | null;
          consent_ai_processing: boolean;
          consent_share_changed_at: string | null;
          consent_share_with_recruiters: boolean;
          country: string | null;
          created_at: string;
          created_by: string;
          date_of_birth: string | null;
          education: Json | null;
          education_level: string | null;
          email: string | null;
          emergency_contact: string | null;
          full_name: string;
          gender: string | null;
          id: string;
          interests: string[] | null;
          languages: string[] | null;
          linked_user_id: string | null;
          location_country: string | null;
          location_region: string | null;
          ngo_id: string | null;
          notes: string | null;
          phone: string | null;
          preferred_industries: string[] | null;
          preferred_locations: string[] | null;
          preferred_roles: string[] | null;
          profile_completion: number;
          pronouns: string | null;
          rejection_reason: string | null;
          resume_name: string | null;
          resume_uploaded_at: string | null;
          resume_url: string | null;
          searchable: boolean;
          skills: string[] | null;
          state: string | null;
          status: Database["public"]["Enums"]["survivor_status"];
          updated_at: string;
          updated_by: string | null;
          uploaded_at: string | null;
          work_history: Json | null;
        };
        Insert: {
          accommodation_needs?: string | null;
          age?: number | null;
          anonymous_id?: string;
          availability?: string | null;
          bio?: string | null;
          certifications?: Json | null;
          city?: string | null;
          consent_ai_changed_at?: string | null;
          consent_ai_processing?: boolean;
          consent_share_changed_at?: string | null;
          consent_share_with_recruiters?: boolean;
          country?: string | null;
          created_at?: string;
          created_by: string;
          date_of_birth?: string | null;
          education?: Json | null;
          education_level?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          full_name: string;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          languages?: string[] | null;
          linked_user_id?: string | null;
          location_country?: string | null;
          location_region?: string | null;
          ngo_id?: string | null;
          notes?: string | null;
          phone?: string | null;
          preferred_industries?: string[] | null;
          preferred_locations?: string[] | null;
          preferred_roles?: string[] | null;
          profile_completion?: number;
          pronouns?: string | null;
          rejection_reason?: string | null;
          resume_name?: string | null;
          resume_uploaded_at?: string | null;
          resume_url?: string | null;
          searchable?: boolean;
          skills?: string[] | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["survivor_status"];
          updated_at?: string;
          updated_by?: string | null;
          uploaded_at?: string | null;
          work_history?: Json | null;
        };
        Update: {
          accommodation_needs?: string | null;
          age?: number | null;
          anonymous_id?: string;
          availability?: string | null;
          bio?: string | null;
          certifications?: Json | null;
          city?: string | null;
          consent_ai_changed_at?: string | null;
          consent_ai_processing?: boolean;
          consent_share_changed_at?: string | null;
          consent_share_with_recruiters?: boolean;
          country?: string | null;
          created_at?: string;
          created_by?: string;
          date_of_birth?: string | null;
          education?: Json | null;
          education_level?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          full_name?: string;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          languages?: string[] | null;
          linked_user_id?: string | null;
          location_country?: string | null;
          location_region?: string | null;
          ngo_id?: string | null;
          notes?: string | null;
          phone?: string | null;
          preferred_industries?: string[] | null;
          preferred_locations?: string[] | null;
          preferred_roles?: string[] | null;
          profile_completion?: number;
          pronouns?: string | null;
          rejection_reason?: string | null;
          resume_name?: string | null;
          resume_uploaded_at?: string | null;
          resume_url?: string | null;
          searchable?: boolean;
          skills?: string[] | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["survivor_status"];
          updated_at?: string;
          updated_by?: string | null;
          uploaded_at?: string | null;
          work_history?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "survivors_ngo_id_fkey";
            columns: ["ngo_id"];
            isOneToOne: false;
            referencedRelation: "ngos";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      survivor_directory: {
        Row: {
          anonymous_id: string | null;
          availability: string | null;
          bio_excerpt: string | null;
          certifications: Json | null;
          education: Json | null;
          id: string | null;
          languages: string[] | null;
          location_country: string | null;
          location_region: string | null;
          searchable: boolean | null;
          skills: string[] | null;
          work_history: Json | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      check_rate_limit: {
        Args: {
          _action: string;
          _max?: number;
          _user_id: string;
        };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      owns_approved_ngo: {
        Args: { _ngo_id: string; _user_id: string };
        Returns: boolean;
      };
      self_assign_initial_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] };
        Returns: undefined;
      };
    };
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "ngo_partner"
        | "survivor"
        | "recruiter";
      application_status:
        | "submitted"
        | "reviewing"
        | "shortlisted"
        | "rejected"
        | "hired";
      job_status: "draft" | "published" | "closed";
      ngo_status: "pending" | "approved" | "rejected" | "suspended";
      recruiter_status: "pending" | "approved" | "rejected" | "suspended";
      request_status: "pending" | "accepted" | "declined";
      survivor_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;
