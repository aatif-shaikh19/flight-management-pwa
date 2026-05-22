-- Enable Realtime publication for the seats table
-- This allows Supabase Realtime to push seat changes to subscribed clients
ALTER PUBLICATION supabase_realtime ADD TABLE seats;
