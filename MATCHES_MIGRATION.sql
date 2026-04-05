-- Migration to add matches_sent column to event_participants
-- This allows the system to track whether matches have been sent for a participant

ALTER TABLE public.event_participants
ADD COLUMN matches_sent BOOLEAN DEFAULT false;

-- Add index for efficient queries
CREATE INDEX idx_event_participants_matches_sent 
ON public.event_participants(event_id, matches_sent);

-- Add comment for documentation
COMMENT ON COLUMN public.event_participants.matches_sent IS 'Tracks whether matches have been sent to this participant. Set to true after admin approves and distributes matches.';
