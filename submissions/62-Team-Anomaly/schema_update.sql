-- 1. KNOWLEDGE BASE & FAQ TABLE
-- Used for Level 1 AI deflection and user self-service.
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL, -- e.g., 'IT', 'HR', 'Finance'
    tags text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. NOTIFICATIONS TABLE
-- Real-time alerts for users when ticket status changes.
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info', -- 'success', 'warning', 'info'
    is_read boolean DEFAULT false,
    ticket_id int4 REFERENCES public.tickets(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 3. ENSURE TICKETS TABLE HAS AI COLUMNS
-- Adding columns that might be missing for AI analysis results.
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS ai_summary text,
ADD COLUMN IF NOT EXISTS ai_decision text,
ADD COLUMN IF NOT EXISTS entities text[], -- extracted keywords
ADD COLUMN IF NOT EXISTS is_duplicate boolean DEFAULT false;

-- 4. ENABLE REALTIME
-- Required for the Dashboard to update without refresh.
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- 5. INITIAL KB DATA (OPTIONAL SEED)
INSERT INTO public.knowledge_base (title, content, category)
VALUES 
('VPN Connection Guide', 'To connect to the corporate VPN, use Cisco AnyConnect with server port 443...', 'IT'),
('Applying for Leave', 'All leave requests must be submitted 2 weeks in advance via the User Portal...', 'HR'),
('Payroll Schedule 2024', 'Salaries are processed on the 25th of every month. Internal cut-off is the 18th...', 'Finance');
