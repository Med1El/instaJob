// Auto-generated with: npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// Run after schema migrations are applied to regenerate.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          user_role: "user" | "admin";
          status: "pending" | "active" | "inactive";
          specialty_id: number | null;
          diploma_id: number | null;
          exp_range_ids: number[] | null;
          region_id: number | null;
          city_id: number | null;
          notification_prefs: { email: boolean; push: boolean } | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          user_role?: "user" | "admin";
          status?: "pending" | "active" | "inactive";
          specialty_id?: number | null;
          diploma_id?: number | null;
          exp_range_ids?: number[] | null;
          region_id?: number | null;
          city_id?: number | null;
          notification_prefs?: { email: boolean; push: boolean } | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          user_role?: "user" | "admin";
          status?: "pending" | "active" | "inactive";
          specialty_id?: number | null;
          diploma_id?: number | null;
          exp_range_ids?: number[] | null;
          region_id?: number | null;
          city_id?: number | null;
          notification_prefs?: { email: boolean; push: boolean } | null;
          created_at?: string;
        };
      };
      job_posts: {
        Row: {
          id: string;
          url: string;
          title: string;
          organization: string | null;
          body_text: string;
          deadline: string | null;
          exam_date: string | null;
          published_at: string | null;
          positions_count: number | null;
          competition_code: string | null;
          scraped_at: string;
          source_page: number | null;
        };
        Insert: {
          id?: string;
          url: string;
          title: string;
          organization?: string | null;
          body_text: string;
          deadline?: string | null;
          exam_date?: string | null;
          published_at?: string | null;
          positions_count?: number | null;
          competition_code?: string | null;
          scraped_at?: string;
          source_page?: number | null;
        };
        Update: {
          id?: string;
          url?: string;
          title?: string;
          organization?: string | null;
          body_text?: string;
          deadline?: string | null;
          exam_date?: string | null;
          published_at?: string | null;
          positions_count?: number | null;
          competition_code?: string | null;
          scraped_at?: string;
          source_page?: number | null;
        };
      };
      ai_analyses: {
        Row: {
          id: string;
          job_post_id: string;
          raw_output: string;
          specialty_matches: number[];
          diploma_matches: number[];
          exp_matches: number[];
          region_matches: number[];
          city_matches: number[];
          analyzed_at: string;
          ai_provider: string;
        };
        Insert: {
          id?: string;
          job_post_id: string;
          raw_output: string;
          specialty_matches: number[];
          diploma_matches: number[];
          exp_matches: number[];
          region_matches: number[];
          city_matches: number[];
          analyzed_at?: string;
          ai_provider: string;
        };
        Update: {
          id?: string;
          job_post_id?: string;
          raw_output?: string;
          specialty_matches?: number[];
          diploma_matches?: number[];
          exp_matches?: number[];
          region_matches?: number[];
          city_matches?: number[];
          analyzed_at?: string;
          ai_provider?: string;
        };
      };
      user_matches: {
        Row: {
          id: string;
          user_id: string;
          job_post_id: string;
          matched_at: string;
          notified: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_post_id: string;
          matched_at?: string;
          notified?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_post_id?: string;
          matched_at?: string;
          notified?: boolean;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          subscription: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription?: Json;
        };
      };
      scrape_runs: {
        Row: {
          id: string;
          triggered_by: "cron" | "manual";
          started_at: string;
          finished_at: string | null;
          posts_found: number | null;
          posts_new: number | null;
          status: "running" | "complete" | "error";
          error_message: string | null;
        };
        Insert: {
          id?: string;
          triggered_by: "cron" | "manual";
          started_at?: string;
          finished_at?: string | null;
          posts_found?: number | null;
          posts_new?: number | null;
          status?: "running" | "complete" | "error";
          error_message?: string | null;
        };
        Update: {
          id?: string;
          triggered_by?: "cron" | "manual";
          started_at?: string;
          finished_at?: string | null;
          posts_found?: number | null;
          posts_new?: number | null;
          status?: "running" | "complete" | "error";
          error_message?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
