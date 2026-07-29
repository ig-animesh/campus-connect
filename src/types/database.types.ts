export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'CR' | 'Faculty'
          section: 'A' | 'B' | 'C' | 'D' | null
          designation: 'Class Coordinator' | 'HOD' | 'Dean' | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'CR' | 'Faculty'
          section?: 'A' | 'B' | 'C' | 'D' | null
          designation?: 'Class Coordinator' | 'HOD' | 'Dean' | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'CR' | 'Faculty'
          section?: 'A' | 'B' | 'C' | 'D' | null
          designation?: 'Class Coordinator' | 'HOD' | 'Dean' | null
          created_at?: string
        }
      }
      campus_issues: {
        Row: {
          id: string
          student_name: string
          message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_name: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_name?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
      class_issues: {
        Row: {
          id: string
          cr_id: string
          section: 'A' | 'B' | 'C' | 'D'
          title: string
          description: string
          image_url: string | null
          status: 'Pending' | 'Accepted' | 'Rejected'
          faculty_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cr_id: string
          section: 'A' | 'B' | 'C' | 'D'
          title: string
          description: string
          image_url?: string | null
          status?: 'Pending' | 'Accepted' | 'Rejected'
          faculty_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cr_id?: string
          section?: 'A' | 'B' | 'C' | 'D'
          title?: string
          description?: string
          image_url?: string | null
          status?: 'Pending' | 'Accepted' | 'Rejected'
          faculty_response?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      issue_images: {
        Row: {
          id: string
          issue_id: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          image_url?: string
          created_at?: string
        }
      }
    }
  }
}
