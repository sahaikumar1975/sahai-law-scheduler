-- Create a table for Clients/Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('meeting', 'diligence', 'drafting')),
    status TEXT DEFAULT 'Pending',
    fee_status TEXT DEFAULT 'Unpaid',
    priority TEXT DEFAULT 'Medium',
    details TEXT,
    time TEXT,
    agenda TEXT,
    reminder_set BOOLEAN DEFAULT false,
    received_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a table for Reading List
CREATE TABLE IF NOT EXISTS public.reading_list (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;

-- Create Policies so users can only see their own data
CREATE POLICY "Users can manage their own tasks"
    ON public.tasks
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reading list"
    ON public.reading_list
    FOR ALL
    USING (auth.uid() = user_id);
